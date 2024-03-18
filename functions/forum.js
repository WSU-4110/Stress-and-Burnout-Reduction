import { v4 as uuidv4 } from 'uuid';

// Function for using getAllPosts
export async function getAllPosts({ env }) {
  const allKeys = await env.COOLFROG_FORUM.list();
  const allPosts = [];
 
  for (const key of allKeys.keys) {
     const post = await env.COOLFROG_FORUM.get(key.name, { type: 'json' });
     allPosts.push(post);
  }
 
  return allPosts;
 };

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
    // Without ctx.waitUntil(), your fetch() to Cloudflare's
    // logging service may or may not complete
    ctx.waitUntil(postLog(err.toString()));
    const stack = JSON.stringify(err.stack) || err;
    // Copy the response and initialize body to the stack trace
    response = new Response(stack, response);
    // Add the error stack into a header to find out what happened
    response.headers.set("X-Debug-stack", stack);
    response.headers.set("X-Debug-err", err);
    return response;
  }
};