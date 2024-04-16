import { v4 as uuidv4 } from 'uuid';

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const sessionCookie = getSessionCookie(request);
    let session;

    if (!sessionCookie || !(session = JSON.parse(await env.COOLFROG_SESSIONS.get(sessionCookie)))) {
        return unauthorizedResponse();
    }
    
    if (url.pathname === '/meetups') {
        return renderForumsPage(session.username, env);
    } else if (url.pathname.startsWith('/meetups/topic/')) {
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

    if (!sessionCookie || !(session = JSON.parse(await env.COOLFROG_SESSIONS.get(sessionCookie)))) {
        return unauthorizedResponse();
    }

    if (url.pathname === "/meetups/add-topic") {
        const title = formData.get('title').trim();
        const emailGroup = formData.get('emailGroup').trim();
        const description = formData.get('description').trim();
        const mode = formData.get('mode').trim(); // 'In Person' or 'Online'
        const locationOrLink = mode === 'In Person' ? formData.get('location').trim() : formData.get('link').trim();
        const dateAndTime = formData.get('dateAndTime').trim();

        return addTopic(title, description, emailGroup, mode, locationOrLink, dateAndTime, session.username, env);
    } else if (url.pathname.startsWith("/meetups/delete-topic/")) {
        const topicId = url.pathname.split('/')[3];
        return deleteTopic(topicId, session.username, env);
    } else if (url.pathname.startsWith("/meetups/topic/") && url.pathname.endsWith('/add-post')) {
        const topicId = url.pathname.split('/')[3];
        const title = formData.get('title');
        const body = formData.get('body');
        return addPost(title, body, topicId, session.username, env);
    } else if (url.pathname.startsWith("/meetups/topic/") && url.pathname.endsWith('/delete-post')) {
        const postId = formData.get('post_id');
        return deletePost(postId, session.username, env);
    }

    return new Response("Bad Request", { status: 400 });
}

async function renderForumsPage(username, env) {
    let topics = await fetchTopics(env);
    
    const topicsHtml = topics.map(topic => `
    <tr>
        <td style="width: 70%;"><a href="/meetups/topic/${topic.id}">${topic.title}</a></td>
        <td style="width: 20%;">${topic.username}</td>
        <td style="width: 10%;">${username === topic.username ? `<form action="/meetups/delete-topic/${topic.id}" method="post"><button type="submit" class="btn btn-danger">Delete</button></form>` : ''}</td>
    </tr>
`).join('');

    const user = JSON.parse(await env.COOLFROG_USERS.get(username));
    const emailGroups = [...new Set(user.emails.map(email => '@' + email.email.split('@')[1]))];
    const emailGroupOptions = emailGroups.map(group => `<option value="${group}">${group}</option>`).join('');

    const pageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
            <title>Welcome to the Forum Page</title>
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
                <form method="post" action="/meetups/add-topic">
                    <input type="text" name="title" placeholder="Enter topic title" class="form-control mb-2" required>
                    <select name="emailGroup" class="form-control mb-2">${emailGroupOptions}</select>
                    <textarea name="description" placeholder="Enter description" class="form-control mb-2" required></textarea>
                    <label><input type="radio" name="mode" value="In Person" required>In Person</label>
                    <label><input type="radio" name="mode" value="Online" required>Online</label>
                    <input type="text" name="location" class="form-control mb-2" placeholder="Enter location">
                    <input type="text" name="link" class="form-control mb-2" placeholder="Enter link">
                    <input type="datetime-local" name="dateAndTime" class="form-control mb-2" required>
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

    const topicInfoHtml = `
        <div class="card mb-3">
            <div class="card-header">Topic Details</div>
            <div class="card-body">
                <h5 class="card-title">${topic.title} (${topic.mode})</h5>
                <p class="card-text">${topic.description}</p>
                <p>${topic.mode === 'In Person' ? `Location: ${topic.location}` : `Link: ${topic.link}`}</p>
                <p>Date and Time: ${new Date(topic.dateAndTime).toLocaleString()}</p>
            </div>
        </div>
    `;

    const postsHtml = posts.map(post => `
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>@${post.username}</span>
                ${username === post.username ? `<form action="/meetups/topic/${topicId}/delete-post" method="post" class="mb-0">
                    <input type="hidden" name="post_id" value="${post.id}">
                    <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                </form>` : ''}
            </div>
            <div class="card-body">
                <h5 class="card-title">${post.title}</h5>
                <p class="card-text">${post.body}</p
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
            <title>Posts in ${topic.title}</title>
        </head>
        <body>
            <div class="container mt-5">
                <h1>${topic.title}</h1>
                <a href="/meetups" class="btn btn-primary mb-3">Back to Topics</a>
                ${topicInfoHtml}
                ${postsHtml}
                <form method="post" action="/meetups/topic/${topicId}/add-post">
                    <input type="text" name="title" placeholder="Enter post title" class="form-control mb-2" required>
                    <textarea name="body" class="form-control mb-2" placeholder="Enter post body" required></textarea>
                    <button type="submit" class="btn btn-success">Add Post</button>
                </form>
            </div>
        </body>
        </html>
    `;

    return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
}

async function addTopic(title, description, emailGroup, mode, locationOrLink, dateAndTime, username, env) {
    const stmt = env.COOLFROG_MEETUPS.prepare("INSERT INTO topics (id, title, description, emailGroup, mode, location, link, dateAndTime, username) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    const location = mode === 'In Person' ? locationOrLink : null;
    const link = mode === 'Online' ? locationOrLink : null;
    await stmt.bind(uuidv4(), title, description, emailGroup, mode, location, link, dateAndTime, username).run();
    return new Response(null, { status: 303, headers: { 'Location': '/meetups' } });
}

async function deleteTopic(topicId, username, env) {
    const stmt = env.COOLFROG_MEETUPS.prepare("DELETE FROM topics WHERE id = ? AND username = ?");
    await stmt.bind(topicId, username).run();
    return new Response(null, { status: 204 });
}

async function addPost(title, body, topicId, username, env) {
    const stmt = env.COOLFROG_MEETUPS.prepare("INSERT INTO posts (id, title, body, topic_id, username) VALUES (?, ?, ?, ?, ?)");
    await stmt.bind(uuidv4(), title, body, topicId, username).run();
    return new Response(null, { status: 303, headers: { 'Location': `/meetups/topic/${topicId}` } });
}

async function deletePost(postId, username, env) {
    const stmt = env.COOLFROG_MEETUPS.prepare("DELETE FROM posts WHERE id = ? AND username = ?");
    await stmt.bind(postId, username).run();
    return new Response(null, { status: 204 });
}

async function fetchTopics(env) {
    const stmt = env.COOLFROG_MEETUPS.prepare("SELECT id, title, username FROM topics ORDER BY title");
    return (await stmt.all()).results;
}

async function fetchTopicById(topicId, env) {
    const stmt = env.COOLFROG_MEETUPS.prepare("SELECT id, title, description, emailGroup, mode, location, link, dateAndTime, username FROM topics WHERE id = ?");
    return (await stmt.bind(topicId).all()).results;
}

async function fetchPostsForTopic(topicId, env) {
    const stmt = env.COOLFROG_MEETUPS.prepare("SELECT id, title, body, username, post_date FROM posts WHERE topic_id = ? ORDER BY post_date DESC");
    return (await stmt.bind(topicId).all()).results;
}

function getSessionCookie(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim().split('='));
    const sessionId = Object.fromEntries(cookies).find(entry => entry[0] === 'session-id');
    return sessionId ? sessionId[1] : null;
}

function unauthorizedResponse() {
    return new Response("Unauthorized - Please log in.", {status: 403, headers: {'Content-Type': 'text/plain'}});
}