export async function onRequest({ request, env }) {
    const url = new URL(request.url);
    if (url.pathname === '/api/likes' && request.method === 'POST') {
        return handleLikes(request, env);
    }

    return new Response("Endpoint not found", { status: 404 });
}

async function handleLikes(request, env) {
    const { videoId, action } = await request.json();
    const username = await getUsername(request, env);

    if (!username) {
        return new Response(JSON.stringify({ error: "Authentication required" }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    let stmt;
    switch (action) {
        case 'like':
            stmt = env.COOLFROG_LIKES.prepare("INSERT INTO likes (video_id, username) VALUES (?, ?)");
            await stmt.run(videoId, username);
            break;
        case 'unlike':
            stmt = env.COOLFROG_LIKES.prepare("DELETE FROM likes WHERE video_id = ? AND username = ?");
            await stmt.run(videoId, username);
            break;
        default:
            return new Response("Invalid action", { status: 400 });
    }

    const likesCount = await updateLikesCount(videoId, env);
    return new Response(JSON.stringify({ likes: likesCount }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    });
}

async function getUsername(request, env) {
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = cookieHeader ? cookieHeader.split(";").find(c => c.trim().startsWith("session-id=")) : null;

    if (!sessionId) {
        return null;
    }

    const session = await env.COOLFROG_SESSIONS.get(sessionId.split("=")[1]);
    return session ? JSON.parse(session).username : null;
}

async function updateLikesCount(videoId, env) {
    const countStmt = env.COOLFROG_LIKES.prepare("SELECT COUNT(*) AS count FROM likes WHERE video_id = ?");
    const result = await countStmt.get(videoId);
    return result.count;
}