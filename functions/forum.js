import { v4 as uuidv4 } from 'uuid';

export async function onRequestPost({ request, env }) {
 try {
    const leftButton = document.getElementById('leftButton');
    const rightButton = document.getElementById('rightButton');

    const response = await fetch('/api/username');
    const data = await response.json();

    if (data.username) {
      leftButton.textContent = 'Account';
      leftButton.onclick = function () { window.location.href = '/account'; };

      rightButton.textContent = `Sign Out of ${data.username}`;
      rightButton.onclick = function () { window.location.href = '/signout'; };
    } else {
      leftButton.textContent = 'Sign Up';
      leftButton.onclick = function () { window.location.href = '/signup'; };
      rightButton.textContent = 'Login';
      rightButton.onclick = function () { window.location.href = '/login'; };
    }

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
