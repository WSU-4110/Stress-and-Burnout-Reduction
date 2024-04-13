import { v4 as uuidv4 } from 'uuid';

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
        return unauthorizedResponse();
    }

    const session = JSON.parse(await env.COOLFROG_SESSIONS.get(sessionCookie));
    if (!session) {
        return unauthorizedResponse();
    }

    if (url.pathname === '/forums') {
        return renderForumsPage(session.username, env);
    } else if (url.pathname.startsWith('/forums/topic/')) {
        const topicId = url.pathname.split('/')[3];
        return renderTopicPage(topicId, session.username, env);
    }

    return new Response("Resource Not Found", { status: 404 });
}

export async function onRequestPost({ request, env }) {
    const url = new URL(request.url);
    const formData = await request.formData();
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
        return unauthorizedResponse();
    }

    const session = JSON.parse(await env.COOLFROG_SESSIONS.get(sessionCookie));
    if (!session) {
        return unauthorizedResponse();
    }

    if (url.pathname === "/forums/add-topic") {
        const title = formData.get('title').trim();
        return addTopic(title, session.username, env);
    } else if (url.pathname.startsWith("/forums/delete-topic/")) {
        const topicId = url.pathname.split('/')[3];
        return deleteTopic(topicId, session.username, env);
    } else if (url.pathname.startsWith("/forums/topic/")) {
        const topicId = url.pathname.split('/')[3];
        if (url.pathname.endsWith('/add-post')) {
            const title = formData.get('title').trim();
            const body = formData.get('body').trim();
            return addPost(topicId, title, body, session.username, env);
        } else if (url.pathname.endsWith('/delete-post')) {
            const postId = formData.get('postId');
            return deletePost(postId, session.username, env);
        }
    }

    return new Response("Not Found", { status: 404 });
}

async function renderForumsPage(username, env) {
    let topics = await fetchTopics(env);
    const topicsHtml = topics.map(topic => `
        <tr>
            <td><a href="/forums/topic/${topic.id}">${topic.title}</a></td>
            <td>${topic.username}</td>
            <td>${username === topic.username ? `<form action="/forums/delete-topic/${topic.id}" method="post"><button type="submit" class="btn btn-danger">Delete</button></form>` : ''}</td>
        </tr>
    `).join('');

    const pageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale="1.0">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
            <title>Forum Page</title>
        </head>
        <body>
            <div class="container mt-4">
                <h1>Welcome ${username}! Browse Topics or Create Your Own</h1>
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>${topicsHtml}</tbody>
                </table>
                <form method="post" action="/forums/add-topic">
                    <input type="text" name="title" placeholder="Enter topic title" class="form-control mb-2" required>
                    <button type="submit" class="btn btn-primary">Add Topic</button>
                </form>
            </div>
        </body>
        </html>
    `;
    
    return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
}

async function renderTopicPage(topicId, username, env) {
    const topic = await fetchSingleTopic(topicId, env);
    let posts = await fetchPosts(topicId, env);
    // Sort posts such that the most recent are on top
    posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const postsHtml = posts.map(post => `
        <tr>
            <td>${post.title}</td>
            <td>${post.body}</td>
            <td>${post.username}</td>
            <td>${username === post.username ? `<form action="/forums/topic/${topicId}/delete-post" method="post"><input type="hidden" name="postId" value="${post.id}"><button type="submit" class="btn btn-danger">Delete</button></form>` : ''}</td>
        </tr>
    `).join('');

    const pageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale="1.0">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
            <title>${topic.title} - Posts</title>
        </head>
        <body>
            <div class="container mt-4">
                <h1>${topic.title}</h1>
                <form method="post" action="/forums/topic/${topicId}/add-post">
                    <input type="text" name="title" placeholder="Enter post title" class="form-control mb-2" required>
                    <textarea name="body" rows="3" class="form-control mb-2" placeholder="Enter post body" required></textarea>
                    <button type="submit" class="btn btn-primary">Add Post</button>
                </form>
                <table class="table table-striped table-hover mt-4">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Body</th>
                            <th>Author</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>${postsHtml}</tbody>
                </table>
                <a href="/forums" class="btn btn-secondary">Back to Topics</a>
            </div>
        </body>
        </html>
    `;

    return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
}

async function addTopic(title, username, env) {
    const stmt = env.COOLFROG_FORUM.prepare("INSERT INTO topics (title, username) VALUES (?, ?)");
    await stmt.bind(title, username).run();
    return new Response(null, { status: 303, headers: { 'Location': '/forums' } });
}

async function deleteTopic(topicId, username, env) {
    // Delete all posts in the topic first
    const deletePostsStmt = env.COOLFROG_FORUM.prepare("DELETE FROM posts WHERE topic_id = ?");
    await deletePostsStmt.bind(topicId).run();
    // Then delete the topic
    const stmt = env.COOLFROG_FORUM.prepare("DELETE FROM topics WHERE id = ? AND username = ?");
    await stmt.bind(topicId, username).run();
    return new Response(null, { status: 204 });
}

async function addPost(topicId, title, body, username, env) {
    const stmt = env.COOLFROG_FORUM.prepare("INSERT INTO posts (topic_id, title, body, username) VALUES (?, ?, ?, ?)");
    await stmt.bind(topicId, title, body, username).run();
    return new Response(null, { status: 303, headers: { 'Location': `/forums/topic/${topicId}` } });
}

async function deletePost(postId, username, env) {
    const stmt = env.COOLFROG_FORUM.prepare("DELETE FROM posts WHERE id = ? AND username = ?");
    await stmt.bind(postId, username).run();
    return new Response(null, { status: 204 });
}

async function fetchTopics(env) {
    const stmt = env.COOLFROG_FORUM.prepare("SELECT id, title, username FROM topics");
    return (await stmt.all()).results;
}

async function fetchSingleTopic(topicId, env) {
    const stmt = env.COOLFROG_FORUM.prepare("SELECT id, title FROM topics WHERE id = ?");
    const results = await stmt.bind(topicId).all();
    return results.length ? results[0] : null;
}

async function fetchPosts(topicId, env) {
    const stmt = env.COOLFROG_FORUM.prepare("SELECT id, title, body, username, created_at FROM posts WHERE topic_id = ?");
    const results = await stmt.bind(topicId).all();
    return results;
}

function getSessionCookie(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim().split('='));
    return Object.fromEntries(cookies)['session-id'];
}

function unauthorizedResponse() {
    return new Response("Unauthorized - Please log in.", {status: 403, headers: {'Content-Type': 'text/plain'}});
}