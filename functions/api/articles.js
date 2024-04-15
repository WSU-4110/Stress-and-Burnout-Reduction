export async function handleRequest({ request, env }) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/articles')) {
        if (request.method === 'POST') {
            return await setArticleRating(request, env);
        } else if (request.method === 'GET') {
            return await getArticleRating(request, env);
        } else {
            return new Response("Method Not Allowed", { status: 405 });
        }
    }
    return new Response("Not Found", { status: 404 });
}

async function setArticleRating(request, env) {
    const { sessionId, user } = await authenticateUser(request, env);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const data = await request.json();
    const { articleId, rating } = data;
    let ratings = await env.COOLFROG_ARTICLES.get(user, 'json') || {};
    ratings[articleId] = rating;
    await env.COOLFROG_ARTICLES.put(user, JSON.stringify(ratings));
    
    return new Response(JSON.stringify({ success: true }), { headers: {'Content-Type': 'application/json'} });
}

async function getArticleRating(request, env) {
    const { sessionId, user } = await authenticateUser(request, env);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const url = new URL(request.url);
    const articleId = url.searchParams.get("articleId");
    const ratings = await env.COOLFROG_ARTICLES.get(user, 'json');
    const rating = ratings ? ratings[articleId] : null;

    return new Response(JSON.stringify({ rating }), { headers: {'Content-Type': 'application/json'} });
}

async function authenticateUser(request, env) {
    const sessionId = getSessionIdFromRequest(request);
    if (!sessionId) {
        return {};
    }
    const sessionValue = await env.COOLFROG_SESSIONS.get(sessionId);
    return sessionValue ? JSON.parse(sessionValue) : {};
}

export function getSessionIdFromRequest(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
    const sessionCookie = cookies.find(cookie => cookie.startsWith('session-id='));
    return sessionCookie ? sessionCookie.split('=')[1] : null;
}