export async function onRequest({ request, env }) {
    let url = new URL(request.url);
    if (url.pathname === '/api/likes') {
        switch (request.method) {
            case 'POST':
                return await handleLikes(request, env);
            default:
                return new Response("Method Not Allowed", { status: 405 });
        }
    }
    return new Response("Not Found", { status: 404 });
}

async function handleLikes(request, env) {
    const sessionId = getSessionIdFromRequest(request);
    if (!sessionId) {
        return new Response(JSON.stringify({ error: 'Session ID missing' }), { status: 401 });
    }

    const sessionValue = await env.COOLFROG_SESSIONS.get(sessionId);
    if (!sessionValue) {
        return new Response(JSON.stringify({ error: 'Session not found' }), { status: 403 });
    }

    const username = JSON.parse(sessionValue).username;
    const body = await request.json();
    const { videoId, action } = body;

    const likesKey = `likes_${videoId}`;
    const userLikesKey = `userlikes_${username}_${videoId}`;

    let likes = (await env.COOLFROG_LIKES.get(likesKey)) || 0;
    let userLiked = (await env.COOLFROG_LIKES.get(userLikesKey)) === 'true';

    if (action === 'like' && !userLiked) {
        likes++;
        await env.COOLFROG_LIKES.put(likesKey, likes.toString());
        await env.COOLFROG_LIKES.put(userLikesKey, 'true');
    } else if (action === 'unlike' && userLiked) {
        likes = Math.max(0, likes - 1);
        await env.COOLFROG_LIKES.put(likesKey, likes.toString());
        await env.COOLFROG_LIKES.put(userLikesKey, 'false');
    }

    return new Response(JSON.stringify({ likes }), { headers: { 'Content-Type': 'application/json' } });
}

function getSessionIdFromRequest(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;
  
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
    const sessionIdCookie = cookies.find(cookie => cookie.startsWith('session-id='));
  
    if (!sessionIdCookie) return null;
  
    return sessionIdCookie.split('=')[1];
}