export async function onRequest(context) {
	const {
		request,
		env
	} = context;
	let url = new URL(request.url);

	if (url.pathname === '/api/likes') {
		switch (request.method) {
			case 'POST':
				return await toggleLike(request, env);
			case 'GET':
				return await getLikes(request, env);
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
	const videoId = body.videoId;

	const userLikesKey = userData.username;
	const videoLikesKey = `_${videoId}`;

	const userLikesData = await env.COOLFROG_LIKES.get(userLikesKey) || "{}";
	const userLikes = JSON.parse(userLikesData);
	const liked = userLikes[videoId];

	let videoLikesCount = parseInt(await env.COOLFROG_LIKES.get(videoLikesKey)) || 0;

	if (liked) {
		delete userLikes[videoId];
		videoLikesCount = Math.max(0, videoLikesCount - 1);
	} else {
		userLikes[videoId] = true;
		videoLikesCount += 1;
	}

	await env.COOLFROG_LIKES.put(userLikesKey, JSON.stringify(userLikes));
	await env.COOLFROG_LIKES.put(videoLikesKey, videoLikesCount.toString());

	return new Response(JSON.stringify({
		likes: videoLikesCount,
		liked: !liked
	}), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

async function getLikes(request, env) {
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
	const videoId = url.searchParams.get("videoId");

	const userLikesData = await env.COOLFROG_LIKES.get(userData.username) || "{}";
	const userLikes = JSON.parse(userLikesData);
	const liked = !!userLikes[videoId];

	const videoLikesCount = parseInt(await env.COOLFROG_LIKES.get(`_${videoId}`)) || 0;

	return new Response(JSON.stringify({
		likes: videoLikesCount,
		liked
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