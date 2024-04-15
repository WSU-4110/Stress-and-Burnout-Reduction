export async function onRequest({ request, env }) {
    const url = new URL(request.url);
    const method = request.method;
    
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie || !(await env.COOLFROG_SESSIONS.get(sessionCookie))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    if (url.pathname === '/api/likes') {
        switch (method) {
            case 'POST':
                return handlePostLike(request, env);
            case 'GET':
                return handleGetLikes(request, env);
            default:
                return new Response(null, { status: 405 });
        }
    }

    return new Response(null, { status: 404 });
}

async function handlePostLike(request, env) {
    const { videoId, liked } = await request.json();
    const stmt = env.COOLFROG_LIKES.prepare(
        "REPLACE INTO likes (video_id, username, liked) VALUES (?, ?, ?)"
    );
    await stmt.run(videoId, request.username, liked);

    // Also calculate total likes
    const countStmt = env.COOLFROG_LIKES.prepare(
        "SELECT COUNT(*) as count FROM likes WHERE video_id = ? AND liked = 1"
    );
    const { count } = await countStmt.get(videoId);

    return new Response(JSON.stringify({ likes: count }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

async function handleGetLikes(request, env) {
    const videoId = new URL(request.url).searchParams.get('video_id');
    const countStmt = env.COOLFROG_LIKES.prepare(
        "SELECT COUNT(*) as count FROM likes WHERE video_id = ? AND liked = 1"
    );
    const { count } = await countStmt.get(videoId);
    
    return new Response(JSON.stringify({ likes: count }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

function getSessionCookie(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;
    return Object.fromEntries(
        cookieHeader.split(';').map(c => {
            const [key, ...v] = c.trim().split('=');
            return [key, v.join('=')];
        })
    )['session-id'];
}