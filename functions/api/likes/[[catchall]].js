import { v4 as uuidv4 } from 'uuid';

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const sessionId = getSessionIdFromRequest(request);

    if (!sessionId) {
        return new Response(JSON.stringify({ error: 'Unauthorized access' }), { status: 401 });
    }

    switch (request.method) {
        case 'GET':
            // Retrieving likes information for studying which posts are liked by a user
            return await getLikedVideos(request, sessionId, env);
        case 'POST':
            // Posting likes or unlikes for a video
            if (url.pathname.startsWith('/api/likes/')) {
                const videoId = url.pathname.split('/api/likes/')[1];
                return await handleLike(videoId, sessionId, env);
            }
            break;
        default:
            return new Response("Method Not Allowed", { status: 405 });
    }

    return new Response("Not Found", { status: 404 });
}

async function getLikedVideos(request, sessionId, env) {
    const sessionValue = await env.COOLFROG_SESSIONS.get(sessionId);
    if (!sessionValue) {
        return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 403 });
    }

    const userData = JSON.parse(sessionValue);
    const stmt = env.COOLFROG_LIKES.prepare("SELECT video_id FROM likes WHERE username = ?");
    const likes = await stmt.bind(userData.username).all();
    return new Response(JSON.stringify(likes), { headers: { 'Content-Type': 'application/json' } });
}

async function handleLike(videoId, sessionId, env) {
    const sessionValue = await env.COOLFROG_SESSIONS.get(sessionId);
    if (!sessionValue) {
        return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 403 });
    }

    const userData = JSON.parse(sessionValue);
    let stmt = env.COOLFROG_LIKES.prepare("SELECT * FROM likes WHERE video_id = ? AND username = ?");
    const existingLike = await stmt.bind(videoId, userData.username).one();

    if (existingLike) {
        // User has already liked the video; unlike it
        stmt = env.COOLFROG_LIKES.prepare("DELETE FROM likes WHERE video_id = ? AND username = ?");
        await stmt.bind(videoId, userData.username).run();
        return new Response(null, { status: 204 });
    } else {
        // User hasn't liked the video; like it
        stmt = env.COOLFROG_LIKES.prepare("INSERT INTO likes (video_id, username) VALUES (?, ?)");
        await stmt.bind(videoId, userData.username).run();
        return new Response(null, { status: 201 });
    }
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