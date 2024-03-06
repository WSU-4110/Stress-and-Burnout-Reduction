export async function onRequestPost({ request, env }) {
    try {
        // Capture form data
        const formData = await request.formData();
        const postTitle = formData.get('postTitle');
        const postContent = formData.get('postContent');

        // Create a post object
        const post = JSON.stringify({
            title: postTitle,
            content: postContent,
        });

        // Generate a unique ID for the post
        const uniqueId = uuidv4();

        // Store the post in the KV namespace
        await env.COOLFROG_MEETFORUM.put(uniqueId, post);

        console.log("Post submitted successfully");

    } catch (error) {
        //Handle errors
        console.error("Error:", error);
        console.log(error);
    }
};