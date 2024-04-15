export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/likes')) {
        const sessionId = getSessionCookie(request);
        if (!sessionId || !await isUserLoggedIn(sessionId, env)) {
            return unauthorizedResponse();
        }

        switch (request.method) {
            case 'POST':
                return await toggleLike(request, env, sessionId);
            case 'GET':
                return await countLikes(request, env);
            default:
                return new Response("Method Not Allowed", { status: 405 });
        }
    }

    return new Response("Not Found", { status: 404 });
}

async function toggleLike(request, env, sessionId) {
    const userData = await getUserDataFromSession(sessionId, env);
    const { videoId, like } = await request.json();
    const sql = like 
        ? "INSERT INTO video_likes (video_id, username) VALUES (?, ?)"
        : "DELETE FROM video_likes WHERE video_id = ? AND username = ?";
    const stmt = env.COOLFROG_LIKES.prepare(sql);

    try {
        await stmt.run([videoId, userData.username]);
        return new Response(null, { status: 204 });
    } catch (err) {
        return new Response("Database error", { status: 500 });
    }
}

async function countLikes(request, env) {
    const url = new URL(request.url);
    const videoId = url.searchParams.get('videoId');
    const stmt = env.COOLFROG_LIKES.prepare("SELECT COUNT(*) AS count FROM video_likes WHERE video_id = ?");
    const { count } = await stmt.get([videoId]);

    return new Response(JSON.stringify({ likes: count }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    });
}

async function isUserLoggedIn(sessionId, env) {
    return await env.AUTH_SYSTEM.get(`user-${sessionId}`) !== null;
}

async function getUserDataFromSession(sessionId, env) {
    const userBlob = await env.AUTH_SYSTEM.get(`user-${sessionId}`);
    return JSON.parse(userBlob);
}

function getSessionCookie(request) {
    const cookieHeader = request.headers.get('Cookie');
    return cookieHeader?.split(';').find(c => c.trim().startsWith('session-id='))?.split('=')[1];
}

function unauthorizedResponse() {
    return new Response("Unauthorized - Please log in.", { status: 403 });
}