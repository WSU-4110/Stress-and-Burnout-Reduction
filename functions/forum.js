import { v4 as uuidv4 } from 'uuid';

// Function for retreiving post data from regular forum KV worker
export async function getAllPosts({ env }) {
  const allKeys = await env.COOLFROG_FORUM.list();
  const allPosts = [];

  for (const key of allKeys.keys) {
    const post = await env.COOLFROG_FORUM.get(key.name, { type: 'json' });
    allPosts.push(post);
  }

  return allPosts;
};

// Function to fetch and filter posts with type 1
async function displayForumPosts({ env }) {
  const posts = await getAllPosts({ env });

  // Filter posts with type 1
  const filteredPosts = posts.filter(post => post.type === 1);

  // Render filtered posts on the webpage
  const forumPostsContainer = document.getElementById('forum-posts');
  filteredPosts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.classList.add('forum-post');
      postElement.innerHTML = `
          <h3>${post.title}</h3>
          <p>${post.content}</p>
      `;
      forumPostsContainer.appendChild(postElement);
  });
}

// Check if the request is a GET request to /forum route and call displayForumPosts
export async function onRequestGet({ env }) {
  try {
    // Call displayForumPosts
    await displayForumPosts({ env });
  } catch (error) {
    console.error("Error:", error);
    // Error handling
  }
}

// Function for sending post data to regular forum KV worker
export async function onRequestPost({ request, env }) {
  try {
     // Request body contains the form data
     const formData = await request.formData();
     const postTitle = formData.get('postTitle');
     const postContent = formData.get('postContent');
     const postLocation = formData.get('postLocation');
     const postMeetingDate = formData.get('postMeetingDate');
 
    if (postLocation == null && postMeetingDate == null) {
      const post = JSON.stringify({
        title: postTitle,
        content: postContent,
        type: 1, // Signifies a regular post
      });
      
      // Generate a unique ID for the post
      const uniqueId = uuidv4();
      
      // Store the post in the KV namespace
      await env.COOLFROG_FORUM.put(uniqueId, post);
      
      // After storing the post, redirect to the regular forum
      return new Response('Forum post created successfully!', {
        status: 302,
        headers: {
          location: '/forum'
        },
      });

    } else {
      // Create a meetup post object
      const post = JSON.stringify({
        title: postTitle,
        content: postContent,
        location: postLocation,
        date: postMeetingDate,
        type: 2, // Signifies a meetup post
      });

      // Generate a unique ID for the post
      const uniqueId = uuidv4();
  
      // Store the post in the KV namespace
      await env.COOLFROG_FORUM.put(uniqueId, post);

      // After storing the post, redirect to the meetup forum
      return new Response('Meetup post created successfully!', {
        status: 302,
        headers: {
          location: '/meetup'
        },
      });
    }

  } catch (error) {
     console.error("Error:", error);
     // Error handling
  }
};