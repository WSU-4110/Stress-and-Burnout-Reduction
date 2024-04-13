import { v4 as uuidv4 } from 'uuid';

export async function onRequestGet({ request, env }) {
    // Extend the existing implementation while keeping the logic untouched
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
    } else if (url.pathname.startsWith("/forums/topic/")) {
        const topicId = url.pathname.split('/').pop();
        return renderTopicPage(topicId, session.username, env);
    }

    return new Response("Resource Not Found", { status: 404 });
}

export async function onRequestPost({ request, env }) {
    // This method is engaged when posting to topics for creating and deleting posts
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
    } else if (url.pathname.startsWith("/forums/add-post/")) {
        const topicId = url.pathname.split('/')[3];
        const title = formData.get('title').trim();
        const content = formData.get('content').trim();
        return addPost(topicId, title, content, session.username, env);
    } else if (url.pathname.startsWith("/forums/delete-post/")) {
        const topicId = url.pathname.split('/')[3];
        const postId = url.pathname.split('/')[4];
        return deletePost(topicId, postId, session.username, env);
    }

    return new Response("Not Found", { status: 404 });
}

async function renderTopicPage(topicId, username, env) {
    const topicInfo = await fetchTopicById(topicId, env);
    const posts = await fetchPostsForTopic(topicId, env);

    const postsHtml = posts.map(post => `
        <div class="post">
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <span>Posted by ${post.username}</span>
            ${username === post.username ? `<button onclick="deletePost('${post.id}')">Delete</button>` : ''}
        </div>
    `).join('');

    const pageHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Topic: ${topicInfo.title}</title>
        </head>
        <body>
            <h1>${topicInfo.title}</h1>
            <div>${postsHtml}</div>
            <form action="/forums/add-post/${topicId}" method="post">
                <input type="text" name="title" placeholder="Title of your post" required>
                <textarea name="content" placeholder="Write your post here..." required></textarea>
                <button type="submit">Post</button>
            </form>
            <button onclick="window.location.href='/forums'">Back to Forums</button>
        </body>
        </html>`;
    return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
}

async function fetchTopicById(topicId, env) {
    const stmt = env.COOLFROG_FORUM.prepare("SELECT id, title FROM topics WHERE id = ?");
    return await stmt.bind(topicId).get();
}

async function fetchPostsForTopic(topicId, env) {
    const stmt = env.COOLFROG_FORUM.prepare("SELECT id, title, content, username FROM posts WHERE topic_id = ?");
    return (await stmt.bind(topicId).all()).results;
}

async function addPost(topicId, title, content, username, env) {
    const stmt = env.COOLFROG_FORUM.prepare("INSERT INTO posts (topic_id, title, content, username) VALUES (?, ?, ?, ?)");
    await stmt.bind(topicId, title, content, username).run();
    return new Response(null, { status: 303, headers: { 'Location': `/forums/topic/${topicId}` } });
}

async function deletePost(topicId, postId, username, env) {
    const stmt = env.COOLFROG_FORUM.prepare("DELETE FROM posts WHERE id = ? AND username = ?");
    await stmt.bind(postId, username).run();
    return new Response(null, { status: 204, headers: { 'Location': `/forums/topic/${topicId}` } });
}

async function renderForumsPage(username, env) {
    let topics = await fetchTopics(env);
    
    const topicsHtml = topics.map(topic => `
        <tr>
            <td>${topic.title}</td>
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
    const stmt = env.COOLFROG_FORUM.prepare("DELETE FROM topics WHERE id = ? AND username = ?");
    await stmt.bind(topicId, username).run();
    return new Response(null, { status: 204 });
}

async function fetchTopics(env) {
    const stmt = env.COOLFROG_FORUM.prepare("SELECT id, title, username FROM topics");
    return (await stmt.all()).results;
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