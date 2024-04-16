export async function onRequest({ request, env }) {
    const url = new URL(request.url);

    if (url.pathname === '/api/likes') {
        switch (request.method) {
            case 'POST':
                return await toggleLike(request, env);
            case 'GET':
                return await getLikes(request, env);
            default:
                return new Response("Method Not Allowed", { status: 405 });
        }
    }
    return new Response("Not Found", { status: 404 });
}

async function toggleLike(request, env) {
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
    const videoId = body.videoId;

    let userLikes = JSON.parse(await env.COOLFROG_LIKES.get(userData.username) || "{}");
    const likedVideosSet = new Set(userLikes);
    const isLiked = likedVideosSet.has(videoId);

    if (isLiked) {
        likedVideosSet.delete(videoId);
    } else {
        likedVideosSet.add(videoId);
    }

    await env.COOLFROG_LIKES.put(userData.username, JSON.stringify(Array.from(likedVideosSet)));

    const videoLikeKey = "_" + videoId;
    const currentLikes = Number(await env.COOLFROG_LIKES.get(videoLikeKey) || "0");
    const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;

    await env.COOLFROG_LIKES.put(videoLikeKey, String(newLikes));

    return new Response(JSON.stringify({ success: true, likes: newLikes }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

async function getLikes(request, env) {
    const { sessionId } = getSessionIdFromRequest(request);
    if (!sessionId) {
        return new Response(JSON.stringify({ error: 'Session ID missing' }), { status: 401 });
    }

    const sessionValue = await env.COOLFROG_SESSIONS.get(sessionId);
    if (!sessionValue) {
        return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 403 });
    }

    const userData = JSON.parse(sessionValue);
    
    let userLikes = JSON.parse(await env.COOLFROG_LIKES.get(userData.username) || "{}");
    const likedVideosSet = new Set(userLikes);

    let likesData = {};
    for (const videoId of likedVideosSet) {
        const totalLikes = await env.COOLFROG_LIKES.get("_" + videoId) || 0;
        likesData[videoId] = { totalLikes, userLiked: true };
    }

    return new Response(JSON.stringify(likesData), {
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