export async function onRequest({
	request,
	env
}) {
	let url = new URL(request.url);
	if (url.pathname === '/api/articles') {
		switch (request.method) {
			case 'POST':
				return await setArticleRating(request, env);
			case 'GET':
				return await getArticleRating(request, env);
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

async function setArticleRating(request, env) {
	const {
		sessionId
	} = getSessionIdFromRequest(request);
	if (!sessionId) {
		return new Response(JSON.stringify({
			error: 'Session ID missing'
		}), {
			status: 401
		});
	}

	const sessionValue = await env.COOLFROG_SESSIONS.get(sessionId);
	if (!sessionValue) {
		return new Response(JSON.stringify({
			error: 'Invalid session'
		}), {
			status: 403
		});
	}

	const userData = JSON.parse(sessionValue);
	const body = await request.json();
	const {
		articleId,
		rating
	} = body;

	let userRatings = await env.COOLFROG_ARTICLES.get(userData.username) || "{}";
	userRatings = JSON.parse(userRatings);
	userRatings[articleId] = rating;

	await env.COOLFROG_ARTICLES.put(userData.username, JSON.stringify(userRatings));

	return new Response(null, {
		status: 204
	}); // No content to send back
}

async function getArticleRating(request, env) {
	const {
		sessionId
	} = getSessionIdFromRequest(request);
	if (!sessionId) {
		return new Response(JSON.stringify({
			error: 'Session ID missing'
		}), {
			status: 401
		});
	}

	const sessionValue = await env.COOLFROG_SESSIONS.get(sessionId);
	if (!sessionValue) {
		return new Response(JSON.stringify({
			error: 'Invalid session'
		}), {
			status: 403
		});
	}

	const userData = JSON.parse(sessionValue);
	const url = new URL(request.url);
	const articleId = url.searchParams.get("articleId");

	const userRatings = await env.COOLFROG_ARTICLES.get(userData.username) || "{}";
	const rating = JSON.parse(userRatings)[articleId];

	return new Response(JSON.stringify({
		rating
	}), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
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