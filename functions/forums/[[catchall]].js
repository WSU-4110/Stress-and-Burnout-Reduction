import { v4 as uuidv4 } from 'uuid';

// This handles GET requests including serving the forum page and specific topic pages.
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
    
    // Main forum page handling
    if (url.pathname === '/forums') {
        return renderForumsPage(session.username, env);
    }
    
    // Specific topic page handling (extended feature)
    const match = url.pathname.match(/^\/forums\/topic\/(\w+)$/);
    if (match) {
        const topicId = match[1];
        return renderTopicPage(topicId, session.username, env);
    }

    return new Response("Resource Not Found", { status: 404 });
}

// POST request handling for adding/deleting topics and posts within topics.
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
        return deleteTopicAndPosts(topicId, session.username, env);
    } else if (url.pathname.startsWith("/forums/topic/")) {
        const topicId = url.pathname.split('/')[3];
        if (url.pathname.endsWith("/add-post")) {
            return addPost(topicId, formData.get('title'), formData.get('body'), session.username, env);
        }
        else if (url.pathname.endsWith("/delete-post/")) {
            const postId = url.pathname.split('/')[5];
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
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
            <title>Forum Page</title>
        </head>
        <body>
            <div class="container mt-4">
                <h1>Forum Topics</h1>
                <table class="table table-striped">
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
                <a href="/forums" class="btn btn-secondary">Back to Forums</a>
            </div>
        </body>
        </html>
    `;
  
    return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
}

async function renderTopicPage(topicId, username, env) {
    let topic = await fetchTopic(topicId, env);
    let posts = await fetchPosts(topicId, env);
    
    const postsHtml = posts.map(post => `
        <div class="card mb-3">
            <div class="card-header">${post.title} - Posted by ${post.username}</div>
            <div class="card-body">
                <p class="card-text">${post.body}</p>
                ${username === post.username ? `<form action="/forums/topic/${topicId}/delete-post/${post.id}" method="post"><button type="submit" class="btn btn-danger">Delete</button></form>` : ''}
            </div>
        </div>
    `).join('');
    
    const pageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
            <title>Posts in ${topic.title}</title>
        </head>
        <body>
            <div class="container mt-4">
                <h1>Posts in ${topic.title}</h1>
                <div>${postsHtml}</div>
                <form method="post" action="/forums/topic/${topicId}/add-post">
                    <input type="text" name="title" placeholder="Enter post title" class="form-control mb-2" required>
                    <textarea name="body" class="form-control mb-2" placeholder="Enter post body" required></textarea>
                    <button type="submit" class="btn btn-primary">Add Post</button>
                </form>
                <a href="/forums" class="btn btn-secondary">Back to Forums</a>
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

async function addPost(topicId, title, body, username, env) {
    const stmt = env.COOLFROG_FORUM.prepare("INSERT INTO posts (topic_id, title, body, username) VALUES (?, ?, ?, ?)");
    await stmt.bind(topicId, title, body, username).run();
    return new Response(null, { status: 303, headers: { 'Location': `/forums/topic/${topicId}` } });
}

async function deleteTopicAndPosts(topicId, username, env) {
    // Delete all posts first
    const deletePostsStmt = env.COOLFROG_FORUM.prepare("DELETE FROM posts WHERE topic_id = ?");
    await deletePostsStmt.bind(topicId).run();
    // Then delete the topic
    const deleteTopicStmt = env.COOLFROG_FORUM.prepare("DELETE FROM topics WHERE id = ? AND username = ?");
    await deleteTopicStmt.bind(topicId, username).run();
    return new Response(null, { status: 204 });
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

async function fetchTopic(topicId, env) {
    const stmt = env.COOLFROG_FORUM.prepare("SELECT id, title FROM topics WHERE id = ?");
    return (await stmt.bind(topicId).get()).result;
}

async function fetchPosts(topicId, env) {
    const stmt = env.COOLFROG_FORUM.prepare("SELECT id, title, body, username FROM posts WHERE topic_id = ? ORDER BY id DESC");
    return (await stmt.bind(topicId).all()).results;
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