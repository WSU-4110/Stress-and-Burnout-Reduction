import { v4 as uuidv4 } from 'uuid';

// Assuming this is within your forum.js file
export async function getAllPosts({ env }) {
  const allKeys = await env.FORUM.list();
  const allPosts = [];
 
  for (const key of allKeys.keys) {
     const post = await env.FORUM.get(key.name, { type: 'json' });
     allPosts.push(post);
  }
 
  return allPosts;
 }

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

  } catch (error) {
    console.error("Error:", error);
    // Error handling
  }

  document.addEventListener('DOMContentLoaded', async function() {
    try {
        const posts = await getAllPosts({ env });
  
        const forumPostsSection = document.getElementById('forum-posts');
  
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'forum-post';
  
            const titleElement = document.createElement('h3');
            titleElement.style.textAlign = 'left';
            titleElement.textContent = post.title;
            postElement.appendChild(titleElement);
  
            const contentElement = document.createElement('p');
            contentElement.style.textAlign = 'left';
            contentElement.textContent = post.content;
            postElement.appendChild(contentElement);
  
            postElement.style.marginBottom = '20px';
  
            forumPostsSection.appendChild(postElement);
        });
    } catch (error) {
        console.error('Failed to fetch and display posts:', error);
    }
  });
};
