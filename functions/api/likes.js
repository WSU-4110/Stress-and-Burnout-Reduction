export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/likes')) {
        switch (request.method) {
            case 'POST':
                return await handleLikeToggle(request, env);
            case 'GET':
                return await countLikes(request, env);
            default:
                return new Response("Method Not Allowed", { status: 405 });
        }
    }

    return new Response("Not Found", { status: 404 });
}

async function handleLikeToggle(request, env) {
    const sessionId = getSessionCookie(request);
    if (!sessionId) {
        return unauthorizedResponse();
    }

    const user = await env.AUTH_SYSTEM.getUserFromSession(sessionId);
    if (!user) {
        return unauthorizedResponse();
    }

    const { videoId, like } = await request.json();
    const stmt = like 
        ? env.COOLFROG_LIKES.prepare("INSERT INTO video_likes (video_id, username) VALUES (?, ?)")
        : env.COOLFROG_LIKES.prepare("DELETE FROM video_likes WHERE video_id = ? AND username = ?");

    await stmt.bind(videoId, user.username).run();
    return new Response(null, { status: 204 });
}

async function countLikes(request, env) {
    const url = new URL(request.url);
    const videoId = url.searchParams.get("videoId");

    const stmt = env.COOLFROG_LIKES.prepare("SELECT COUNT(*) AS like_count FROM video_likes WHERE video_id = ?");
    const result = await stmt.bind(videoId).get();
    return new Response(JSON.stringify({ likes: result.like_count }), {
        headers: { 'Content-Type': 'application/json' }
    });
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