export async function onRequestPost({
	request,
	env
}) {
	try {
		const {
			postID
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

		const escalateThreshold = 5;
		const reports = postDetails.reports || 0;

		if (reports > escalateThreshold) {
			return escalateToDead({
				postID,
				env
			});
		} else if (reports > 3) {
			postDetails.status = 'hidden';
			await env.COOLFROG_POSTS.put(postID, JSON.stringify(postDetails));
			return new Response(JSON.stringify({
				result: 'Post hidden due to reports.'
			}), {
				status: 200
			});
		} else {
			return new Response(JSON.stringify({
				error: 'Not enough reports to escalate or hide.'
			}), {
				status: 400
			});
		}
	} catch (error) {
		console.error('Error processing escalation request:', error);
		return new Response(JSON.stringify({
			error: 'Internal Server Error'
		}), {
			status: 500
		});
	}
}

async function escalateToDead({
	postID,
	env
}) {
	const escalateUrl = `https://coolfrog.net/api/postmod-dead`;
	try {
		const response = await fetch(escalateUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				postID
			}),
		});

		if (response.ok) {
			return new Response(JSON.stringify({
				result: 'Escalated to deletion process.'
			}), {
				status: 200
			});
		} else {
			const errorText = await response.text();
			console.error('Failed to escalate to deletion:', errorText);
			return new Response(JSON.stringify({
				error: 'Failed to escalate to deletion step.'
			}), {
				status: response.status
			});
		}
	} catch (error) {
		console.error('Failed to call escalate to deletion endpoint:', error);
		return new Response(JSON.stringify({
			error: 'Failed to escalate due to network or server error.'
		}), {
			status: 500
		});
	}
}