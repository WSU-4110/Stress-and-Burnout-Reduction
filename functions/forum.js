import { v4 as uuidv4 } from 'uuid';

// Main driver for code
export async function onRequestPost({ request, env }) {
  sendPost({ request, env });
};

// Function for displaying posts in forum.html and meetup.html
export async function getAllPosts({ env }) {
  try {
    const allKeys = await env.COOLFROG_FORUM.list();
    const allPosts = [];

    for (const key of allKeys.keys) {
      const post = await env.COOLFROG_FORUM.get(key.name, { type: 'json' });
      allPosts.push(post);
    }

    // Filter posts with type 1
    const filteredType1Posts = allPosts.filter(post => post.type === 1);
    const filteredType2Posts = allPosts.filter(post => post.type === 2);

    // Render filtered posts on the general forum webpage
    const generalForumPostsContainer = document.getElementById('general-forum-posts');
    filteredType1Posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('general-forum-post');
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
        `;
        generalForumPostsContainer.appendChild(postElement);
    });

    // Render filtered posts on the meetup forum webpage
    const meetupForumPostsContainer = document.getElementById('meetup-forum-posts');
    filteredType2Posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('meetup-forum-post');
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <p><strong>Location:</strong> ${post.location}</p>
            <p><strong>Time:</strong> ${post.time}</p>
            <p><strong>Date:</strong> ${post.date}</p>
        `;
        meetupForumPostsContainer.appendChild(postElement);
    });

  } catch (error) {
    // Error handling for if errors occur
    console.error("Error:", error);
    }
}

// Function for sending posts and data to forum KV worker
export async function sendPost({ request, env }) {
  try {
    // Request body contains the form data
    const formData = await request.formData();
    const postTitle = formData.get('postTitle');
    const postContent = formData.get('postContent');
    const postLocation = formData.get('postLocation');
    const postMeetingDate = formData.get('postMeetingDate');
    const postMeetingTime = formData.get('postMeetingTime');

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
       time: postMeetingTime,
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
}