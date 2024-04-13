import { v4 as uuidv4 } from 'uuid';

// Handle GET requests which includes serving the main forums page and topic specific pages.
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

// Handle POST requests for adding or deleting forum topics and forum posts.
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
        await deleteAllPostsForTopic(topicId, env);  // Ensure all posts are deleted when a topic is deleted.
        return deleteTopic(topicId, session.username, env);
    } else if (url.pathname.startsWith("/forums/add-post/")) {
        const topicId = url.pathname.split('/')[3];
        const title = formData.get('title');
        const content = formData.get('content');
        return addPost(topicId, session.username, title, content, env);
    } else if (url.pathname.startsWith("/forums/delete-post/")) {
        const postId = url.pathname.split('/')[3];
        return deletePost(postId, session.username, env);
    }

    return new Response("Not Found", { status: 404 });
}

// Fetch topics from the database and render the forums page.
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
            </div>
        </body>
        </html>
    `;
  
    return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
}

// Helper functions for specific operations such as adding topics, deleting topics, and session management.
async function fetchTopics(env) {
    const stmt = env.COOLFROG_FORUM.prepare("SELECT id, title, username FROM topics");
    return (await stmt.all()).results;
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

async function fetchPostsByTopicId(topicId, env) {
    const stmt = env.COOLFROG_FORUM.prepare("SELECT * FROM posts WHERE topic_id = ? ORDER BY created_at DESC");
    return (await stmt.bind(topicId).all()).results;
}

async function addPost(topicId, username, title, content, env) {
    const postId = uuidv4();
    const stmt = env.COOLFROG_FORUM.prepare("INSERT INTO posts (id, topic_id, username, title, content, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))");
    await stmt.bind(postId, topicId, username, title, content).run();
    return new Response(null, { status: 303, headers: { 'Location': `/forums/topic/${topicId}` } });
}

async function deletePost(postId, username, env) {
    const stmt = env.COOLFROG_FORUM.prepare("DELETE FROM posts WHERE id = ? AND username = ?");
    await stmt.bind(postId, username).run();
    return new Response(null, { status: 204 });
}

async function deleteAllPostsForTopic(topicId, env) {
    const stmt = env.COOLFROG_FORUM.prepare("DELETE FROM posts WHERE topic_id = ?");
    await stmt.bind(topicId).run();
}

// Render page showing posts within a specific forum topic.
async function renderTopicPage(topicId, username, env) {
    let posts = await fetchPostsByTopicId(topicId, env);
    const postsHtml = posts.map(post => `
        <tr>
            <td>${post.title}</td>
            <td>${post.username}</td>
            <td>${post.content}</td>
            <td>${post.created_at}</td>
            <td>${username === post.username ? `<form action="/forums/delete-post/${post.id}" method="post"><button type="submit" class="btn btn-danger">Delete</button></form>` : ''}</td>
        </tr>
    `).join('');

    const pageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
            <title>Forum Topic: ${topicId}</title>
        </head>
        <body>
            <div class="container mt-4">
                <h1>Posts in Topic</h1>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Content</th>
                            <th>Posted At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>${postsHtml}</tbody>
                </table>
                <form method="post" action="/forums/add-post/${topicId}">
                    <input type="text" name="title" placeholder="Enter post title" class="form-control mb-2" required>
                    <textarea name="content" placeholder="Enter post content" class="form-control mb-2" required></textarea>
                    <button type="submit" class="btn btn-primary">Add Post</button>
                </form>
                <a href="/forums" class="btn btn-secondary mt-3">Back to Forum</a>
            </div>
        </body>
        </html>
    `;

    return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
}

// Get session cookie from request headers.
function getSessionCookie(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim().split('='));
    return Object.fromEntries(cookies)['session-id'];
}

// Unauthorized response for users not logged in.
function unauthorizedResponse() {
    return new Response("Unauthorized - Please log in.", {status: 403, headers: {'Content-Type': 'text/plain'}});
}