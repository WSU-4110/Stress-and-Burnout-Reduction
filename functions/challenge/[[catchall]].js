import { v4 as uuidv4 } from 'uuid';

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const sessionCookie = getSessionCookie(request);
    let session;

    if (!sessionCookie || !(session = JSON.parse(await env.COOLFROG_SESSIONS.get(sessionCookie)))) {
        return unauthorizedResponse();
    }

    if (url.pathname === '/challenge') {
        return renderChallengesPage(session.username, env);
    } else if (url.pathname.startsWith('/challenge/topic/')) {
        const topicId = url.pathname.split('/challenge/topic/')[1];
        if (topicId) {
            return renderTopicPage(topicId, session.username, env);
        }
    }

    return new Response("Resource Not Found", { status: 404 });
}

export async function onRequestPost({ request, env }) {
    const url = new URL(request.url);
    const formData = await request.formData();
    const sessionCookie = getSessionCookie(request);
    let session;

    if (!sessionCookie || !(session = JSON.parse(await env.COOLFROG_SESSIONS.get(sessionCookie)))) {
        return unauthorizedResponse();
    }

    // Define routes for POST requests
    if (url.pathname === "/challenge/add-topic") {
        const title = formData.get('title').trim();
        return addTopic(title, session.username, env);
    } else if (url.pathname.startsWith("/challenge/delete-topic/")) {
        const topicId = url.pathname.split('/')[3];
        return deleteTopic(topicId, session.username, env);
    } else if (url.pathname === `/challenge/topic/${formData.get('topic_id')}/accept-challenge`) {
        const topicId = formData.get('topic_id');
        return acceptChallenge(topicId, session.username, env);
    } else if (url.pathname === `/challenge/topic/${formData.get('topic_id')}/complete-challenge`) {
        const topicId = formData.get('topic_id');
        const newStatus = 'completed';
        return updateChallengeStatus(topicId, session.username, newStatus, env);
    } else if (url.pathname === `/challenge/topic/${formData.get('topic_id')}/abandon-challenge`) {
        const topicId = formData.get('topic_id');
        const newStatus = 'abandoned';
        return updateChallengeStatus(topicId, session.username, newStatus, env);
    }

    return new Response("Bad Request", { status: 400 });
}


async function renderChallengesPage(username, env) {
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
            <title>Challenge Page</title>
        </head>
        <body>
            <div class="container mt-4">
                <h1>Challenge Topics</h1>
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
    let post = await fetchPostForTopicAndUser(topicId, username, env);

    let postHtml = '';
    if (post) {
        postHtml = `
            <div class="card mb-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>@${post.username}</span>
                    ${(post.status === 'active') ? `<form action="/challenge/topic/${topicId}/complete-challenge" method="post" class="mb-0">
                        <input type="hidden" name="topic_id" value="${topicId}">
                        <button type="submit" class="btn btn-success btn-sm">Complete Challenge</button>
                    </form>
                    <form action="/challenge/topic/${topicId}/abandon-challenge" method="post" class="mb-0">
                        <input type="hidden" name="topic_id" value="${topicId}">
                        <button type="submit" class="btn btn-danger btn-sm">Abandon Challenge</button>
                    </form>` : ''}
                </div>
                <div class="card-body">
                    <h5 class="card-title">${username} has ${post.status} the challenge</h5>
                </div>
                <div class="card-footer text-muted">
                    ${new Date(post.post_date).toLocaleString()}
                </div>
            </div>
        `;
    } else {
        postHtml = `
            <form method="post" action="/challenge/topic/${topicId}/accept-challenge">
                <input type="hidden" name="topic_id" value="${topicId}">
                <button type="submit" class="btn btn-success">Accept the Challenge</button>
            </form>
        `;
    }

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
            <div class="container mt-5">
                <h1>${topic.title}</h1>
                <a href="/challenge" class="btn btn-primary mb-3">Back to Topics</a>
                ${postHtml}
            </div>
        </body>
        </html>
    `;

    return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
}

async function addTopic(title, username, env) {
    const stmt = env.COOLFROG_CHALLENGES.prepare("INSERT INTO topics (id, title, username) VALUES (?, ?, ?)");
    await stmt.bind(uuidv4(), title, username).run();
    return new Response(null, { status: 303, headers: { 'Location': '/challenge' } });
}

async function deleteTopic(topicId, username, env) {
    const stmt = env.COOLFROG_CHALLENGES.prepare("DELETE FROM topics WHERE id = ? AND username = ?");
    await stmt.bind(topicId, username).run();
    return new Response(null, { status: 204 });
}

async function acceptChallenge(topicId, username, env) {
    const postExistenceCheck = env.COOLFROG_CHALLENGES.prepare("SELECT id FROM posts WHERE topic_id = ? AND username = ?");
    const existingPost = await postExistenceCheck.bind(topicId, username).all();
    if (existingPost.results.length === 0) {
        const stmt = env.COOLFROG_CHALLENGES.prepare("INSERT INTO posts (id, title, status, topic_id, username, post_date) VALUES (?, ?, ?, ?, ?, ?)");
        await stmt.bind(uuidv4(), `${username} has accepted the challenge`, 'active', topicId, username, new Date().toISOString()).run();
        return new Response(null, { status: 303, headers: { 'Location': `/challenge/topic/${topicId}` } });
    }
    return new Response("Challenge Already Accepted", { status: 400 });
}

async function updateChallengeStatus(topicId, username, newStatus, env) {
    const stmt = env.COOLFROG_CHALLENGES.prepare("UPDATE posts SET title = ?, status = ?, post_date = ? WHERE topic_id = ? AND username = ?");
    await stmt.bind(`${username} has ${newStatus} the challenge`, newStatus, new Date().toISOString(), topicId, username).run();
    return new Response(null, { status: 303, headers: { 'Location': `/challenge/topic/${topicId}` } });
}

async function fetchTopics(env) {
    const stmt = env.COOLFROG_CHALLENGES.prepare("SELECT id, title, username FROM topics ORDER BY title");
    return (await stmt.all()).results;
}

async function fetchTopicById(topicId, env) {
    const stmt = env.COOLFROG_CHALLENGES.prepare("SELECT id, title, username FROM topics WHERE id = ?");
    return (await stmt.bind(topicId).all()).results;
}

async function fetchPostForTopicAndUser(topicId, username, env) {
    const stmt = env.COOLFROG_CHALLENGES.prepare("SELECT id, title, status, username, post_date FROM posts WHERE topic_id = ? AND username = ?");
    const result = await stmt.bind(topicId, username).all();
    return result.results.length > 0 ? result.results[0] : null;
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