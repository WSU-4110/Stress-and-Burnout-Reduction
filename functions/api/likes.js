export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const sessionId = getSessionIdFromRequest(request);

    if (!sessionId || !(await env.COOLFROG_SESSIONS.get(sessionId))) {
        return unauthorizedResponse();
    }

    switch (request.method) {
        case 'POST':
            return handlePost(request, env);
        case 'GET':
            return handleGet(request, env);
        default:
            return new Response("Method Not Allowed", { status: 405 });
    }
}

async function handlePost(request, env) {
    const url = new URL(request.url);
    const videoId = url.searchParams.get("videoId");
    const username = await getUsernameFromSessionId(request, env);
    
    if (!videoId || !username) {
        return new Response(JSON.stringify({ error: "Missing video ID or user information" }), { status: 400 });
    }

    const alreadyLiked = await env.COOLFROG_LIKES.get(`${username}_${videoId}`);
    if (alreadyLiked) {
        await env.COOLFROG_LIKES.delete(`${username}_${videoId}`);
    } else {
        await env.COOLFROG_LIKES.put(`${username}_${videoId}`, 'liked');
    }
    
    const likes = await countLikes(videoId, env);
    return new Response(JSON.stringify({ likes }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleGet(request, env) {
    const url = new URL(request.url);
    const videoId = url.searchParams.get("videoId");
    
    if (!videoId) {
        return new Response(JSON.stringify({ error: "Missing video ID" }), { status: 400 });
    }

    const likes = await countLikes(videoId, env);
    return new Response(JSON.stringify({ likes }), { headers: { 'Content-Type': 'application/json' } });
}

async function countLikes(videoId, env) {
    const keys = await env.COOLFROG_LIKES.list();
    return keys.keys.filter(key => key.name.endsWith(`_${videoId}`)).length;
}

function unauthorizedResponse() {
    return new Response("Unauthorized - Please log in.", { status: 403, headers: { 'Content-Type': 'text/plain' } });
}

function getSessionIdFromRequest(request) {
    const cookieHeader = request.headers.get('Cookie');
    return cookieHeader && cookieHeader.split(';').map(cookie => cookie.trim()).find(c => c.startsWith('session-id='))?.split('=')[1];
}

async function getUsernameFromSessionId(request, env) {
    const cookie = getSessionIdFromRequest(request);
    const session = await env.COOLFROG_SESSIONS.get(cookie);
    return session && JSON.parse(session).username;
}