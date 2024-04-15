export async function onRequest({ request, env }) {
    let url = new URL(request.url);

    if (request.method === 'POST') {
        return await setArticleRating(request, env);
    } else if (request.method === 'GET') {
        return await getArticleRating(request, env);
    } else {
        return new Response("Method Not Allowed", { status: 405 });
    }
}

async function setArticleRating(request, env) {
    const { user, articleId, rating } = await request.json();
    const key = `user_${user}_ratings`;
    let userData = await env.COOLFROG_ARTICLES.get(key);
    userData = userData ? JSON.parse(userData) : {};
    userData[articleId] = rating;
    await env.COOLFROG_ARTICLES.put(key, JSON.stringify(userData));
    return new Response(JSON.stringify({status: "Rating updated successfully."}), {status: 200});
}

async function getArticleRating(request, env) {
    const url = new URL(request.url);
    const user = url.searchParams.get('user');
    const articleId = url.searchParams.get('articleId');
    const key = `user_${user}_ratings`;
    const userData = await env.COOLFROG_ARTICLES.get(key);
    if (userData) {
        const ratings = JSON.parse(userData);
        const rating = ratings[articleId] || 0;
        return new Response(JSON.stringify({rating: rating}), {status: 200});
    }
    return new Response("No ratings found for this user.", {status: 404});
}