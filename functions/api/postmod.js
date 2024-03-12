export async function onRequestPost({
	request,
	env
}) {
	try {
		const {
			username,
			postID,
			action
		} = await request.json();

		const postDetailsJson = await env.COOLFROG_POSTS.get(postID);
		if (!postDetailsJson) {
			return new Response(JSON.stringify({
				error: 'Post not found'
			}), {
				status: 404
			});
		}

		let postDetails = JSON.parse(postDetailsJson);

		switch (action) {
			case "report":
				return handleReport({
					postDetails,
					postID,
					username,
					env
				});
			case "request":
				return handleRequest({
					postDetails,
					env
				});
			default:
				return new Response(JSON.stringify({
					error: 'Invalid action'
				}), {
					status: 400
				});
		}
	} catch (error) {
		console.error('Error handling postmod request:', error);
		return new Response(JSON.stringify({
			error: 'Internal Server Error'
		}), {
			status: 500
		});
	}
}

async function handleReport({
	postDetails,
	postID,
	username,
	env
}) {
	postDetails.reports = (postDetails.reports || 0) + 1;

	await env.COOLFROG_POSTS.put(postID, JSON.stringify(postDetails));

	if (postDetails.reports === 1) {
		sendMessageToUser(env, postDetails.creator, `Your post "${postID}" has been reported for review.`);
		return new Response(JSON.stringify({
			result: 'Post reported, creator notified.'
		}), {
			status: 200
		});
	}

	if (postDetails.reports > 1 && postDetails.reports <= 3) {
		return new Response(JSON.stringify({
			result: 'Post reported.'
		}), {
			status: 200
		});
	} else if (postDetails.reports > 3) {
		return redirectToEscalate({
			postID,
			env
		});
	}
}

async function handleRequest({
	postDetails,
	env
}) {
	let status = postDetails.status;

	switch (status) {
		case 'visible':
		case 'hidden':
			return new Response(JSON.stringify({
				status,
				postDetails
			}), {
				status: 200
			});
		case 'removed':
			return new Response(JSON.stringify({
				status
			}), {
				status: 200
			});
		default:
			return new Response(JSON.stringify({
				status: 'visible',
				postDetails
			}), {
				status: 200
			});
	}
}

async function sendMessageToUser(env, username, message) {
	const userMessages = await env.COOLFROG_USER_MSGS.get(username) || "[]";
	let messages = JSON.parse(userMessages);
	messages.push({
		message,
		timestamp: new Date().toISOString()
	});
	await env.COOLFROG_USER_MSGS.put(username, JSON.stringify(messages));
}

async function redirectToEscalate({
	postID,
	env
}) {
	const escalateUrl = `https://coolfrog.net/api/postmod-escalate`;
	const response = await fetch(escalateUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			postID
		}),
	});

	if (!response.ok) {
		console.error('Failed to escalate:', await response.text());
		return new Response(JSON.stringify({
			error: 'Failed to escalate'
		}), {
			status: 500
		});
	}

	return new Response(JSON.stringify({
		result: 'Escalation successful'
	}), {
		status: 200
	});
}