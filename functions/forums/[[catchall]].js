import { v4 as uuidv4 } from 'uuid';

// Handler for GET requests
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
        return renderTopicPage(topicId, env, session.username);
    }

    return new Response("Resource Not Found", { status: 404 });
}

// Handler for POST requests
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
    } else if (url.pathname === "/forums/add-post") {
        const title = formData.get('title').trim();
        const body = formData.get('body').trim();
        const topicId = formData.get('topicId').trim();
        return addPost(title, body, topicId, session.username, env);
    } else if (url.pathname.startsWith("/forums/delete-post/")) {
        const postId = url.pathname.split('/')[3];
        return deletePost(postId, session.username, env);
    } else if (url.pathname === "/forums/add-reply") {
        const body = formData.get('body').trim();
        const postId = formData.get('postId').trim();
        return addReply(body, postId, session.username, env);
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
            </div>
        </body>
        </html>
    `;
  
    return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
}

async function renderTopicPage(topicId, env, username) {
    const stmtPosts = env.COOLFROG_FORUM.prepare("SELECT id, title, body, username FROM posts WHERE topic_id = ?");
    let posts = (await stmtPosts.bind(topicId).all()).results;
    let postsHtml = await Promise.all(posts.map(async post => {
       const stmtReplies = env.COOLFROG_FORUM.prepare("SELECT username, body FROM replies WHERE post_id = ?");
       let replies = (await stmtReplies.bind(post.id).all()).results;
       let repliesHtml = replies.map(reply => `
         <div class="reply">
           <strong>${reply.username}:</strong> ${reply.body}
         </div>
       `).join('');
       return `
         <div class="post">
           <h3>${post.title} by ${post.username}</h3>
           <p>${post.body}</p>
           ${repliesHtml}
           <form method="post" action="/forums/add-reply">
             <input type="hidden" name="postId" value="${post.id}">
             <textarea name="body" required placeholder="Write a reply..."></textarea>
             <button type="submit">Reply</button>
           </form>
           ${username === post.username ? `<form action="/forums/delete-post/${post.id}" method="post"><button class="btn btn-danger">Delete Post</button></form>` : ''}
         </div>
       `;
     }));

     const pageHtml = `
       <div class="container">
         <h2>Topic Posts</h2>
         ${postsHtml.join('')}
         <h3>Add a Post</h3>
         <form method="post" action="/forums/add-post">
           <input type="hidden" name="topicId" value="${topicId}">
           <input type="text" name="title" placeholder="Post title" required>
           <textarea name="body" required placeholder="Write something..."></textarea>
           <button type="submit">Submit Post</button>
         </form>
       </div>
     `;
     return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
}

async function addTopic(title, username, env) {
    const topicId = uuidv4();
    const stmt = env.COOLFROG_FORUM.prepare("INSERT INTO topics (id, title, username) VALUES (?, ?, ?)");
    await stmt.bind(topicId, title, username).run();
    return new Response(null, { status: 303, headers: { 'Location': '/forums' } });
}

async function deleteTopic(topicId, username, env) {
    const stmt = env.COOLFROG_FORUM.prepare("DELETE FROM topics WHERE id = ? AND username = ?");
    await stmt.bind(topicId, username).run();
    return new Response(null, { status: 204 });
}

async function addPost(title, body, topicId, username, env) {
    const postId = uuidv4();
    const stmt = env.COOLFROG_FORUM.prepare("INSERT INTO posts (id, topic_id, username, title, body, timestamp) VALUES (?, ?, ?, ?, ?, ?)");
    await stmt.bind(postId, topicId, username, title, body, Date.now()).run();
    return new Response(null, { status: 303, headers: { 'Location': `/forums/topic/${topicId}` } });
}

async function deletePost(postId, username, env) {
    const stmt = env.COOLFROG_FORUM.prepare("DELETE FROM posts WHERE id = ? AND username = ?");
    await stmt.bind(postId, username).run();
    return new Response(null, { status: 204 });
}

async function addReply(body, postId, username, env) {
    const replyId = uuidv4();
    const stmt = env.COOLFROG_FORUM.prepare("INSERT INTO replies (id, post_id, username, body, timestamp) VALUES (?, ?, ?, ?, ?)");
    await stmt.bind(replyId, postId, username, body, Date.now()).run();
    return new Response(null, { status: 303, headers: { 'Location': `/forums/topic/${postId}` } });
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