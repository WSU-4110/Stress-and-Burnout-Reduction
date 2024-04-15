export async function onRequest({ request, env }) {
    let url = new URL(request.url);
    if (url.pathname.startsWith('/api/likes')) {
        const sessionId = getSessionCookie(request);

        if (!sessionId || !await validateSession(sessionId, env)) {
            return unauthorizedResponse();
        }

        const username = await getUsernameFromSessionId(sessionId, env);
        const videoId = url.searchParams.get("videoId");

        switch (request.method) {
            case 'POST':
                return handleLikeToggle(request, env, username, videoId);
            case 'GET':
                return getLikesCount(videoId, env);
            default:
                return new Response("Method Not Allowed", { status: 405 });
        }
    }

    return new Response("Not Found", { status: 404 });
}

async function handleLikeToggle(request, env, username, videoId) {
    const liked = await checkLikeStatus(videoId, username, env);

    if (liked) {
        await unlikeVideo(videoId, username, env);
    } else {
        await likeVideo(videoId, username, env);
    }

    return new Response(null, { status: 204 });
}

async function likeVideo(videoId, username, env) {
    const stmt = env.COOLFROG_LIKES.prepare("INSERT INTO likes (video_id, username) VALUES (?, ?)");
    await stmt.bind(videoId, username).run();
}

async function unlikeVideo(videoId, username, env) {
    const stmt = env.COOLFROG_LIKES.prepare("DELETE FROM likes WHERE video_id = ? AND username = ?");
    await stmt.bind(videoId, username).run();
}

async function getLikesCount(videoId, env) {
    const stmt = env.COOLFROG_LIKES.prepare("SELECT COUNT(username) AS count FROM likes WHERE video_id = ?");
    const result = await stmt.bind(videoId).get();
    return new Response(JSON.stringify({ likes: result.count }), {
        headers: {"Content-Type": "application/json"}
    });
}

async function checkLikeStatus(videoId, username, env) {
    const stmt = env.COOLFROG_LIKES.prepare("SELECT COUNT(*) AS count FROM likes WHERE video_id = ? AND username = ?");
    const result = await stmt.bind(videoId, username).get();
    return result.count > 0;
}

function getSessionCookie(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim().split('='));
    return Object.fromEntries(cookies)['session-id'];
}

async function validateSession(sessionId, env) {
    const sessionValue = await env.SESSION.get(sessionId);
    return sessionValue !== null;
}

async function getUsernameFromSessionId(sessionId, env) {
    const sessionValue = await env.SESSION.get(sessionId);
    return JSON.parse(sessionValue).username;
}

function unauthorizedResponse() {
    return new Response("Unauthorized - Please log in.", {status: 403, headers: {'Content-Type': 'text/plain'}});
}