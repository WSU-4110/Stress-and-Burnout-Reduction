export async function onRequest({ request, env }) {
    if (!validateSession(request)) {
        return unauthorizedResponse();
    }

    const url = new URL(request.url);
    switch (url.pathname) {
        case '/api/likes':
            if (request.method === 'POST') {
                return handleLikeRequest(request, env);
            } else {
                return new Response("Method Not Allowed", { status: 405 });
            }
        default:
            return new Response("Not Found", { status: 404 });
    }
}

async function handleLikeRequest(request, env) {
    const username = await getSessionUsername(request, env);
    if (!username) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), { status: 403 });
    }

    const data = await request.json();
    const { videoId, likeAction } = data; // likeAction could be 'like' or 'unlike'

    if (likeAction === 'like') {
        return await addLike(videoId, username, env);
    } else if (likeAction === 'unlike') {
        return await removeLike(videoId, username, env);
    } else {
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
    }
}

async function addLike(videoId, username, env) {
    // Check if already liked
    const alreadyLiked = await env.COOLFROG_LIKES.get(`${videoId}-${username}`);
    if (alreadyLiked) {
        return new Response(JSON.stringify({ error: 'Already liked' }), { status: 409 });
    }

    await env.COOLFROG_LIKES.put(`${videoId}-${username}`, '1');
    return new Response(null, { status: 204 });
}

async function removeLike(videoId, username, env) {
    await env.COOLFROG_LIKES.delete(`${videoId}-${username}`);
    return new Response(null, { status: 204 });
}

function validateSession(request) {
    const sessionCookie = request.headers.get("Cookie");
    return sessionCookie && sessionCookie.includes("sessionId=");
}

async function getSessionUsername(request, env) {
    const sessionCookie = request.headers.get("Cookie");
    const sessionId = sessionCookie.split("sessionId=")[1].split(";")[0];
    const sessionData = await env.COOLFROG_SESSIONS.get(sessionId);
    return sessionData ? JSON.parse(sessionData).username : null;
}

function unauthorizedResponse() {
    return new Response("Unauthorized - Please log in.", {status: 403, headers: {'Content-Type': 'text/plain'}});
}