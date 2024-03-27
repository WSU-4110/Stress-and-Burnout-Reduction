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

// Function to load and display posts
async function loadPosts() {
  try {
      const allPosts = await getAllPosts({}); // Call getAllPosts function to retrieve posts

      // Get the section where forum posts will be displayed
      const forumPostsSection = document.getElementById('forum-posts');

      // Iterate over each post and display type 1 posts only
      allPosts.forEach(post => {
          if (post.type === 1) {
              const postElement = document.createElement('div');
              postElement.classList.add('post');

              // Create HTML structure for each type 1 post
              postElement.innerHTML = `
                  <h3>${post.title}</h3>
                  <p>${post.content}</p>
                  <p>Type: Regular</p>
                  <hr>
              `;

              // Append the post element to the forum posts section
              forumPostsSection.appendChild(postElement);
          }
      });
  } catch (error) {
      console.error('Error fetching posts:', error.message);
  }
}

// Call loadPosts function when DOM content is loaded
document.addEventListener('DOMContentLoaded', loadPosts);

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