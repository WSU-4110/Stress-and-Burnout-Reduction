export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    // Check for session validity
    const sessionId = getSessionIdFromRequest(request);
    if (!sessionId) {
        return new Response(JSON.stringify({ error: 'Not logged in' }), { status: 401 });
    }

    const session = await env.COOLFROG_SESSIONS.get(sessionId);
    if (!session) {
        return new Response(JSON.stringify({ error: 'Session not found' }), { status: 403 });
    }

    const username = JSON.parse(session).username;
    
    switch (true) {
        case url.pathname === '/api/likes' && request.method === 'POST':
            const data = await request.json();
            return handleLikeRequest(data.videoId, username, env);
        default:
            return new Response("Not Found", { status: 404 });
    }
}

async function handleLikeRequest(videoId, username, env) {
    // Check if user already liked this video
    const query = `SELECT * FROM likes WHERE video_id = ? AND username = ?`;
    let results = await env.COOLFROG_LIKES.query(query, [videoId, username]);
    
    let response, newTotal;
    if (results.length > 0) {
        // Unlike
        const deleteQuery = `DELETE FROM likes WHERE video_id = ? AND username = ?`;
        await env.COOLFROG_LIKES.query(deleteQuery, [videoId, username]);
        newTotal = await getTotalLikes(videoId, env);
    } else {
        // Like
        const insertQuery = `INSERT INTO likes (video_id, username) VALUES (?, ?)`;
        await env.COOLFROG_LIKES.query(insertQuery, [videoId, username]);
        newTotal = await getTotalLikes(videoId, env);
    }

    return new Response(JSON.stringify({ totalLikes: newTotal }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    });
}

async function getTotalLikes(videoId, env) {
    const countQuery = `SELECT COUNT(*) AS total FROM likes WHERE video_id = ?`;
    const results = await env.COOLFROG_LIKES.query(countQuery, [videoId]);
    return results[0].total;
}

function getSessionIdFromRequest(request) {
    const sessionCookie = request.headers.get('Cookie');
    const match = sessionCookie && sessionCookie.match(/session-id=([^;]+);?/);
    return match ? match[1] : null;
}