export async function onRequest({
    request,
    env
}) {
    const url = new URL(request.url);
    if (url.pathname === '/api/likes') {
        switch (request.method) {
            case 'POST':
                return await toggleLike(request, env);
            case 'GET':
                return await getLikesCount(request, env);
            default:
                return new Response("Method Not Allowed", {
                    status: 405
                });
        }
    }
    return new Response("Not Found", {
        status: 404
    });
}

async function toggleLike(request, env) {
    const { username } = await getSessionFromRequest(request, env);
    if (!username) {
        return unauthorizedResponse();
    }

    const body = await request.json();
    const { videoId } = body;
    const action = body.action; // 'like' or 'unlike'

    if (action === 'like') {
        const stmt = env.COOLFROG_LIKES.prepare("INSERT OR IGNORE INTO likes (video_id, username) VALUES (?, ?)");
        await stmt.bind(videoId, username).run();
    } else if (action === 'unlike') {
        const stmt = env.COOLFROG_LIKES.prepare("DELETE FROM likes WHERE video_id = ? AND username = ?");
        await stmt.bind(videoId, username).run();
    }

    return new Response(null, { status: 204 });
}

async function getLikesCount(request, env) {
    const url = new URL(request.url);
    const videoId = url.searchParams.get("videoId");

    const stmt = env.COOLFROG_LIKES.prepare("SELECT COUNT(*) as count FROM likes WHERE video_id = ?");
    const result = await stmt.bind(videoId).get();

    return new Response(JSON.stringify({ likes: result.count }), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

function getSessionFromRequest(request, env) {
    const sessionId = getSessionCookie(request);
    if (!sessionId) {
        return Promise.resolve({});
    }

    return env.COOLFROG_SESSIONS.get(sessionId).then(session => session ? JSON.parse(session) : {});
}

function getSessionCookie(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim()).find(cookie => cookie.startsWith('session-id='));
    return cookies && cookies.split('=')[1];
}

function unauthorizedResponse() {
    return new Response("Unauthorized - Please log in.", { status: 403, headers: { 'Content-Type': 'text/plain' } });
}