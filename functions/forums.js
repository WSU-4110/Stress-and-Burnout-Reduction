export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        let response = await handleRequest(request, env, url);
        return response;
    }
};

async function handleRequest(request, env, url) {
    const sessionId = getSessionIdFromRequest(request);

    // Ensure request is directed to /forums or its subpaths
    if (!url.pathname.startsWith("/forums")) {
        return new Response("Not found", { status: 404 });
    }

    if (!sessionId) {
        return Response.redirect(`${url.origin}/login`, 302);
    }

    const session = await env.COOLFROG_SESSIONS.get(sessionId);
    if (!session) {
        return mustSignInPage();
    }

    if (request.method === 'POST' && url.pathname === "/forums") {
        return await handlePostRequest(request, env);
    } else if (request.method === 'DELETE' && url.pathname.startsWith("/forums/delete-topic/")) {
        const topicId = url.pathname.split('/')[3];
        return await handleDeleteTopic(topicId, env, JSON.parse(session).username);
    } else if (url.pathname === "/forums") {
        return await renderForumPage(env, JSON.parse(session).username);
    } else {
        return new Response("Not found", { status: 404 });
    }
}

async function handlePostRequest(request, env) {
    const formData = await request.formData();
    const topicTitle = formData.get('title');
    const username = formData.get('username');
    
    if (topicTitle && username) {
        const stmt = env.COOLFROG_FORUM.prepare('INSERT INTO topics (title, createdBy) VALUES (?, ?)');
        await stmt.bind(topicTitle, username).run();
    }
    
    return Response.redirect(`${new URL(request.url).origin}/forums`);
}

async function handleDeleteTopic(topicId, env, username) {
    const stmt = env.COOLFROG_FORUM.prepare('DELETE FROM topics WHERE id = ? AND createdBy = ?');
    await stmt.bind(topicId, username).run();
    
    return new Response(null, {status: 204});
}

function getSessionIdFromRequest(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;
    
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
    const sessionIdCookie = cookies.find(cookie => cookie.startsWith('session-id='));
    
    if (!sessionIdCookie) return null;
    
    return sessionIdCookie.split('=')[1];
}

function mustSignInPage() {
    return new Response(`<html><body><h1>You must be signed in to view the forum.</h1></body></html>`, { headers: { 'Content-Type': 'text/html' } });
}

async function renderForumPage(env, username) {
    const stmt = env.COOLFROG_FORUM.prepare('SELECT * FROM topics');
    const topics = await stmt.all();

    let topicsHtml = topics.map(topic => {
        let actions = `<div>Posted by: ${topic.createdBy}</div>`;
        if (topic.createdBy === username) {
            actions += `<button onclick="fetch('/forums/delete-topic/${topic.id}', { method: 'DELETE' }).then(() => location.reload())">Delete</button>`;
        }
        return `<li>${topic.title} - ${actions}</li>`;
    }).join('');

    return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Forum Topics</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    </head>
    <body>
        <div class="container">
            <h1>Forum Topics</h1>
            <ul>${topicsHtml}</ul>
            <form method="POST" action="/forums">
                <input type="text" name="title" placeholder="New Topic Title" required/>
                <input type="hidden" name="username" value="${username}"/>
                <button type="submit">Add Topic</button>
            </form>
        </div>
    </body>
    </html>
    `, { headers: { 'Content-Type': 'text/html' } });
}