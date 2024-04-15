export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // Decide the action based on the URL path and method
    if (url.pathname.startsWith('/api/likes')) {
        switch (request.method) {
            case 'POST': // Toggle like status
                return await handleLikeToggle(request, env);
            case 'GET': // Get like count for a video
                return await countLikes(request, env);
            default:
                return new Response("Method Not Allowed", { status: 405 });
        }
    }
    return new Response("Not Found", { status: 404 });
}

// Handle the toggling of likes/unlikes for a given video and user
async function handleLikeToggle(request, env) {
    const sessionUser = await getSessionUser(request, env);
    if (!sessionUser) {
        return unauthorizedResponse();
    }

    // Read the request body
    const { videoId, like } = await request.json();
    if (like) {
        // Insert like if it's a like action
        const stmt = env.COOLFROG_LIKES.prepare("INSERT OR IGNORE INTO video_likes (video_id, username) VALUES (?, ?)");
        await stmt.run(videoId, sessionUser.username);
    } else {
        // Delete like if it's an unlike action
        const stmt = env.COOLFROG_LIKES.prepare("DELETE FROM video_likes WHERE video_id = ? AND username = ?");
        await stmt.run(videoId, sessionUser.username);
    }
    return new Response(null, { status: 204 });  // No Content response
}

// Function to count the likes of a given video
async function countLikes(request, env) {
    const videoId = new URL(request.url).searchParams.get("videoId");
    if (!videoId) {
        return new Response("Video ID is required", { status: 400 });
    }

    const stmt = env.COOLFROG_LIKES.prepare("SELECT COUNT(*) AS count FROM video_likes WHERE video_id = ?");
    const result = await stmt.get(videoId);
    return new Response(JSON.stringify({ likes: result.count }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

// Helper function to retrieve the session user
async function getSessionUser(request, env) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;

    const sessionId = cookieHeader.split(';').find(s => s.trim().startsWith('session-id='))
                                  ?.split('=')[1];
    if (!sessionId) return null;

    const session = await env.SESSION.get(sessionId);
    return session ? JSON.parse(session) : null;
}

function unauthorizedResponse() {
    return new Response("Unauthorized", { status: 403 });
}