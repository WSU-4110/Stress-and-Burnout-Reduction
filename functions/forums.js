import { v4 as uuidv4 } from 'uuid';

async function getSessionUser(request, env) {
    const cookie = request.headers.get('Cookie');
    if (!cookie) return null;
    const match = cookie.match(/session-id=([^;]+)/);
    if (!match) return null;
    const sessionId = match[1];
    const sessionData = await env.COOLFROG_SESSIONS.get(sessionId);
    if (!sessionData) return null;
    return JSON.parse(sessionData).username;
}

async function handleRequest(request, env) {
    const url = new URL(request.url);
    const username = await getSessionUser(request, env);

    if (!username) {
        return Response.redirect(env.ORIGIN + '/login');
    }

    if (request.method === "POST") {
        const formData = await request.formData();
        const topicTitle = formData.get('title');
        const topicContent = formData.get('content');
        const topicId = uuidv4();
        await env.COOLFROG_FORUM.put(topicId, JSON.stringify({ id: topicId, title: topicTitle, content: topicContent, author: username }));
        return new Response(null, { status: 303, headers: { 'Location': '/forums' } });
    } else if (request.method === "DELETE") {
        const topicId = url.pathname.split("/").pop();
        const topicData = await env.COOLFROG_FORUM.get(topicId);
        if (topicData && JSON.parse(topicData).author === username) {
            await env.COOLFROG_FORUM.delete(topicId);
            return new Response(null, { status: 204 });
        }
        return new Response("Unauthorized", { status: 401 });
    }
    
    const topics = [];
    const keys = await env.COOLFROG_FORUM.list();
    for (const key of keys.keys) {
        const topicData = await env.COOLFROG_FORUM.get(key.name);
        if (topicData) {
            topics.push(JSON.parse(topicData));
        }
    }
    
    const body = `
        <!DOCTYPE html>
        <html lang="en">
            ${generateHead()}
            ${generateBody(topics, username)}
        </html>
    `;
    return new Response(body, { headers: { 'Content-Type': 'text/html' } });
}

function generateHead() {
    return `
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Forum Topics</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
        </head>`;
}

function generateBody(topics, username) {
    let topicsHtml = topics.map(topic =>
        `<div class="card mb-2">
            <div class="card-body">
                <h5 class="card-title">${topic.title}</h5>
                <p class="card-text">${topic.content}</p>
                <p class="card-text"><small class="text-muted">Posted by ${topic.author}</small></p>
                ${topic.author === username ? `<button class="btn btn-danger delete-topic" data-id="${topic.id}">Delete</button>` : ''}
            </div>
        </div>`
    ).join('');

    return `
        <body>
            <div class="container mt-4">
                <h1>Forum</h1>
                <div>
                    <form method="POST">
                        <input type="text" name="title" placeholder="Topic Title" required class="form-control mb-2">
                        <textarea name="content" placeholder="Write something..." required class="form-control mb-2"></textarea>
                        <button type="submit" class="btn btn-primary">Post Topic</button>
                    </form>
                </div>
                ${topicsHtml}
            </div>
        </body>
        <script>
            document.addEventListener("click", function(event) {
                if (event.target.classList.contains("delete-topic")) {
                    fetch("/forums/" + event.target.dataset.id, { method: "DELETE" })
                        .then(response => {
                            if (response.ok) window.location.reload();
                            else alert("Failed to delete!");
                        })
                        .catch(err => alert("Error: " + err));
                }
            });
        </script>
    `;
}

export default {
    async fetch(request, env) {
        try {
            return handleRequest(request, env);
        } catch (err) {
            console.error("Failed to handle request", err);
            return new Response("Error handling request", { status: 500 });
        }
    }
};