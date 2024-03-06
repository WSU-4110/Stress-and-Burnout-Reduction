import { v4 as uuidv4 } from 'uuid';

export async function onRequestPost({ request, env }) {
 try {
    // Form data getting
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
    await env.COOLFROG_FORUM.put(uniqueId, post);

  } catch (error) {
    // Error handling
    console.error("Error:", error);
  }
};