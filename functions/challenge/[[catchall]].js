import { v4 as uuidv4 } from 'uuid';

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const sessionCookie = getSessionCookie(request);
    let session;

    if (!sessionCookie || !(session = JSON.parse(await env.COOLFROG_CHALLENGES.get(sessionCookie)))) {
        return unauthorizedResponse();
    }
    
    if (url.pathname === '/challenge') {
        return renderForumsPage(session.username, env);
    } else if (url.pathname.startsWith('/challenge/topic/')) {
        const topicId = url.pathname.split('/')[3];
        return renderTopicPage(topicId, session.username, env);
    }

    return new Response("Resource Not Found", { status: 404 });
}

export async function onRequestPost({ request, env }) {
    const url = new URL(request.url);
    const formData = await request.formData();
    const sessionCookie = getSessionCookie(request);
    let session;

    if (!sessionCookie || !(session = JSON.parse(await env.COOLFROG_CHALLENGES.get(sessionCookie)))) {
        return unauthorizedResponse();
    }

    if (url.pathname === "/challenge/add-topic") {
        const title = formData.get('title').trim();
        return addTopic(title, session.username, env);
    } else if (url.pathname.startsWith("/challenge/delete-topic/")) {
        const topicId = url.pathname.split('/')[3];
        return deleteTopic(topicId, session.username, env);
    } else if (url.pathname.startsWith("/challenge/topic/") && url.pathname.endsWith('/update-status')) {
        const topicId = url.pathname.split('/')[3];
        const status = formData.get('status');
        return updatePostStatus(status, topicId, session.username, env);
    }

    return new Response("Bad Request", { status: 400 });
}

async function renderForumsPage(username, env) {
    let topics = await fetchTopics(env);
    const topicsHtml = topics.map(topic => `
        <tr>
            <td style="width: 70%;"><a href="/challenge/topic/${topic.id}">${topic.title}</a></td>
            <td style="width: 20%;">${topic.username}</td>
            <td style="width: 10%;">${username === topic.username ? `<form action="/challenge/delete-topic/${topic.id}" method="post"><button type="submit" class="btn btn-danger">Delete</button></form>` : ''}</td>
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
            <style>
                body { padding-top: 80px; }
                .fixed-header { position: fixed; top: 0; width: 100%; z-index: 1000; }
                .navbar-brand img { height: 40px; }
            </style>
        </head>
        <body>
            <header class="fixed-header navbar navbar-expand-lg navbar-light bg-light">
                <div class="container">
                    <a class="navbar-brand" href="/"><img src="/logo.png" alt="logo"></a>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" 
                            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ml-auto">
                            <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
                            <li class="nav-item"><a class="nav-link" href="/about">About</a></li>
                            <li class="nav-item active"><a class="nav-link" href="/challenge">Forums</a></li>
                        </ul>
                    </div>
                </div>
            </header>
            <div class="container mt-5">
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
                <form method="post" action="/challenge/add-topic">
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
    let topic = (await fetchTopicById(topicId, env))[0];
    let posts = await fetchPostsForTopic(topicId, env);

    const challengeHtml = posts.length ? '' : `<button class="btn btn-success">Accept the Challenge</button>`;
    const postsHtml = posts.map(post => `
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>${post.title}</span>
                <div>
                    ${username === post.username && post.status === 'active' ? `
                    <form action="/challenge/topic/${topicId}/update-status" method="post">
                        <input type="hidden" name="status" value="completed">
                        <button type="submit" class="btn btn-success btn-sm">Complete Challenge</button>
                    </form>
                    <form action="/challenge/topic/${topicId}/update-status" method="post">
                        <input type="hidden" name="status" value="abandoned">
                        <button type="submit" class="btn btn-danger btn-sm">Abandon Challenge</button>
                    </form>` : ''}
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">${post.status}</h5>
            </div>
            <div class="card-footer text-muted">
                ${new Date(post.post_date).toLocaleString()}
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
            <title>${topic.title}</title>
            <style>
                body { padding-top: 80px; }
                .fixed-header { position: fixed; top: 0; width: 100%; z-index: 1000; }
                .navbar-brand img { height: 40px; }
            </style>
        </head>
        <body>
            <header class="fixed-header navbar navbar-expand-lg navbar-light bg-light">
                <div class="container">
                    <a class="navbar-brand" href="/"><img src="/logo.png" alt="logo"></a>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" 
                            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ml-auto">
                            <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
                            <li class="nav-item"><a class="nav-link" href="/about">About</a></li>
                            <li class="nav-item active"><a class="nav-link" href="/challenge">Forums</a></li>
                        </ul>
                    </div>
                </div>
            </header>
            <div class="container mt-5">
                <h1>${topic.title}</h1>
                <a href="/challenge" class="btn btn-primary mb-3">Back to Topics</a>
                ${challengeHtml}
                ${postsHtml}
            </div>
        </body>
        </html>
    `;

    return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
}

async function updatePostStatus(status, topicId, username, env) {
    const existingPost = await fetchPostsForTopic(topicId, env);
    if (existingPost.length === 0) {
        // Create new post
        await addPost(status, topicId, username, env);
    } else {
        // Update existing post status and date
        const stmt = env.COOLFROG_FORUM.prepare("UPDATE posts SET status=?, post_date=DATETIME('now') WHERE topic_id=? AND username=?");
        await stmt.bind(status, topicId, username).run();
    }
    return new Response(null, { status: 303, headers: { 'Location': `/challenge/topic/${topicId}` } });
}

async function addPost(status, topicId, username, env) {
    const title = `${username} has ${status === 'active'
        ? `accepted the challenge`
        : status === 'completed'
            ? `completed the challenge`
            : `abandoned the challenge`}`;
    const stmt = env.COOLFROG_FORUM.prepare("INSERT INTO posts (id, title, status, topic_id, username, post_date) VALUES (?, ?, ?, ?, ?, DATETIME('now'))");
    await stmt.bind(uuidv4(), title, status, topicId, username).run();
    return new Response(null, { status: 303, headers: { 'Location': `/challenge/topic/${topicId}` } });
}

async function deleteTopic(topicId, username, env) {
    const stmt = env.COOLFROG_FORUM.prepare("DELETE FROM topics WHERE id = ? AND username = ?");
    await stmt.bind(topicId, username).run();
    return new Response(null, { status: 204 });
}

async function fetchTopics(env) {
    const stmt = env.COOLFROG_FORUM.prepare("SELECT id, title, username FROM topics ORDER BY title");
    return (await stmt.all()).results;
}

async function fetchTopicById(topicId, env) {
    const stmt = env.COOLFROG_FORUM.prepare("SELECT id, title, username FROM topics WHERE id = ?");
    return (await stmt.bind(topicId).all()).results;
}

async function fetchPostsForTopic(topicId, env) {
    const stmt = env.COOLFROG_FORUM.prepare("SELECT id, title, status, username, post_date FROM posts WHERE topic_id = ? AND status NOT IN ('completed', 'abandoned') ORDER BY post_date DESC");
    return (await stmt.bind(topicId).all()).results;
}

function getSessionCookie(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim().split('='));
    return Object.fromEntries(cookies)['session-id'];
}

function unauthorizedResponse() {
    return new Response("Unauthorized - Please log in.", { status: 403, headers: {'Content-Type': 'text/plain'} });
}