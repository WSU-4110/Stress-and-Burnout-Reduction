export async function onRequest({ request, env }) {
    let url = new URL(request.url);
    switch (url.pathname) {
        case '/api/likes':
            if (request.method === 'POST') {
                return handlePostLike(request, env);
            } else {
                return new Response("Method Not Allowed", { status: 405 });
            }
        default:
            return new Response("Not Found", { status: 404 });
    }
}

async function handlePostLike(request, env) {
    const cookie = request.headers.get('Cookie');
    if (!cookie) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const sessionId = getSessionIdFromCookie(cookie);
    if (!sessionId) {
        return Response(JSON.stringify({ error: 'Session ID missing' }), { status: 401 });
    }

    const session = await env.COOLFROG_SESSIONS.get(sessionId);
    if (!session) {
        return Response(JSON.stringify({ error: 'Session not found' }), { status: 401 });
    }

    const userData = JSON.parse(session);
    const data = await request.json();
    const videoId = data.videoId;
    const likeAction = data.action === 'like';

    // Retrieve current likes data
    let likesData = JSON.parse(await env.COOLFROG_LIKES.get(videoId) || '{}');
    
    if (likeAction && !likesData[userData.username]) {
        likesData[userData.username] = true;
        likesData.totalCount = (likesData.totalCount || 0) + 1;
    } else if (!likeAction && likesData[userData.username]) {
        delete likesData[userData.username];
        likesData.totalCount = (likesData.totalCount || 0) - 1;
    }

    await env.COOLFROG_LIKES.put(videoId, JSON.stringify(likesData));

    return new Response(JSON.stringify({ likesCount: likesData.totalCount }), { headers: { 'Content-Type': 'application/json' } });
}

function getSessionIdFromCookie(cookie) {
    const cookies = cookie.split(';');
    const sessionCookie = cookies.find(c => c.trim().startsWith('session-id='));
    if (!sessionCookie) return null;

    return sessionCookie.split('=')[1];
}