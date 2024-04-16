export async function onRequest({ request, env }) {
    let url = new URL(request.url);
    if (url.pathname === '/api/likes') {
        switch (request.method) {
            case 'POST':
                return await toggleLikeStatus(request, env);
            case 'GET':
                return await getLikes(request, env);
            default:
                return new Response("Method Not Allowed", { status: 405 });
        }
    }
    return new Response("Not Found", { status: 404 });
}

async function toggleLikeStatus(request, env) {
    const { sessionId } = getSessionIdFromRequest(request);
    if (!sessionId) {
        return new Response(JSON.stringify({ error: 'Session ID missing' }), { status: 401 });
    }

    const sessionValue = await env.COOLFROG_SESSIONS.get(sessionId);
    if (!sessionValue) {
        return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 403 });
    }

    const userData = JSON.parse(sessionValue);
    const body = await request.json();
    const { videoId } = body;

    let userLikes = await env.COOLFROG_LIKES.get(userData.username) || "{}";
    userLikes = JSON.parse(userLikes);

    const likeKey = `_${videoId}`;
    let videoLikes = parseInt(await env.COOLFROG_LIKES.get(likeKey) || "0");

    if (userLikes[videoId]) {
        videoLikes--;
        delete userLikes[videoId];
    } else {
        videoLikes++;
        userLikes[videoId] = true;
    }

    await env.COOLFROG_LIKES.put(userData.username, JSON.stringify(userLikes));
    await env.COOLFROG_LIKES.put(likeKey, videoLikes.toString());

    return new Response(JSON.stringify({ likes: videoLikes }), { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
    });
}

async function getLikes(request, env) {
    const url = new URL(request.url);
    const videoId = url.searchParams.get("videoId");
    const sessionId = getSessionIdFromRequest(request).sessionId;
    
    if (!sessionId) {
        return new Response(JSON.stringify({ error: 'Session ID missing' }), { status: 401 });
    }
    
    const sessionValue = await env.COOLFROG_SESSIONS.get(sessionId);
    if (!sessionValue) {
        return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 403 });
    }

    const userData = JSON.parse(sessionValue);
    const likeKey = `_${videoId}`;
    const userLikes = JSON.parse(await env.COOLFROG_LIKES.get(userData.username) || "{}");
    const videoLikes = await env.COOLFROG_LIKES.get(likeKey) || "0";

    const userHasLiked = !!userLikes[videoId];

    return new Response(JSON.stringify({ likes: parseInt(videoLikes), userHasLiked }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

function getSessionIdFromRequest(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return {};

    const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
    const sessionIdCookie = cookies.find(cookie => cookie.startsWith('session-id='));

    if (!sessionIdCookie) return {};
    
    return {
        sessionId: sessionIdCookie.split('=')[1]
    };
}