import { v4 as uuidv4 } from 'uuid';

export async function onRequestPost({ request, env }) {
 try {
    // Assuming the request body contains the form data
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

    // Return a success response
    return new Response('Post submitted successfully', { status: 200 
  });

  } catch (error) {
    console.error("Error:", error);
    // Error handling
  }

  // Function to get all posts from server
  async function getAllPosts({env}) {
    const allKeys = await env.COOLFROG_FORUM.list();
    const allPosts = [];

    for (const key of allKeys.keys) {
      const post = await env.COOLFROG_FORUM.get(key.name, { type: 'json' });
      allPosts.push(post);
    }

    return allPosts;
  }
};
