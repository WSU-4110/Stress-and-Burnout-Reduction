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

		postDetails.status = 'removed';

		await env.COOLFROG_POSTS.put(postID, JSON.stringify(postDetails));

		await notifyModerators(env, postID, postDetails);

		return new Response(JSON.stringify({
			result: 'Post marked as removed and moderators notified.'
		}), {
			status: 200
		});

	} catch (error) {
		console.error('Error processing removal request:', error);
		return new Response(JSON.stringify({
			error: 'Internal Server Error'
		}), {
			status: 500
		});
	}
}

async function notifyModerators(env, postID, postDetails) {

	const message = {
		postID: postID,
		alert: `Post with ID ${postID} has been removed for exceeding report thresholds.`,
		timestamp: new Date().toISOString(),
		contentPreview: postDetails.content.slice(0, 100)
	};

	for (const modUsername of env.COOLFROG_MOD_LIST) {
		let modMessagesJson = await env.COOLFROG_MOD_MSGS.get(modUsername) || "[]";
		let modMessages = JSON.parse(modMessagesJson);

		modMessages.push(message);
		await env.COOLFROG_MOD_MSGS.put(modUsername, JSON.stringify(modMessages));
	}
}