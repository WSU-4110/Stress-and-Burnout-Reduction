export async function onRequest({request, env}) {
    const url = new URL(request.url);
    let sessionId = getSessionIdFromRequest(request);
    if (!sessionId) {
        return new Response(JSON.stringify({error: 'Unauthorized'}), {status: 401});
    }

    const userSession = await env.COOLFROG_SESSIONS.get(sessionId);
    if (!userSession) {
        return new Response(JSON.stringify({error: 'Session not valid'}), {status: 403});
    }

    const userData = JSON.parse(userSession);
    const videoId = url.searchParams.get("videoId");

    switch (request.method) {
        case 'POST':
            const liked = url.searchParams.get("like") === 'true';
            return handleLikeRequest(videoId, liked, userData.username, env);
        case 'GET':
            return getLikes(videoId, env);
        default:
            return new Response("Method Not Allowed", {status: 405});
    }
}

async function handleLikeRequest(videoId, liked, username, env) {
    const likeStatusQuery = `SELECT * FROM likes WHERE video_id = ? AND username = ?`;
    const existingLike = await env.COOLFROG_LIKES.prepare(likeStatusQuery).bind(videoId, username).all();

    if (liked && existingLike.results.length === 0) {
        const likeQuery = `INSERT INTO likes (video_id, username) VALUES (?, ?)`;
        await env.COOLFROG_LIKES.prepare(likeQuery).bind(videoId, username).run();
    } else if (!liked && existingLike.results.length > 0) {
        const unlikeQuery = `DELETE FROM likes WHERE video_id = ? AND username = ?`;
        await env.COOLFROG_LIKES.prepare(unlikeQuery).bind(videoId, username).run();
    }

    return new Response(null, {status: 204});
}

async function getLikes(videoId, env) {
    const likesQuery = `SELECT COUNT(*) AS likeCount FROM likes WHERE video_id = ?`;
    const results = await env.COOLFROG_LIKES.prepare(likesQuery).bind(videoId).all();
    return new Response(JSON.stringify({likes: results.results[0].likeCount}), {
        headers: {'Content-Type': 'application/json'}
    });
}

function getSessionIdFromRequest(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return {};

    const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
    const sessionIdCookie = cookies.find(cookie => cookie.startsWith('session-id='));

    if (!sessionIdCookie) return {};

    return {sessionId: sessionIdCookie.split('=')[1]};
}