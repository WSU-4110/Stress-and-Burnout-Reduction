import { v4 as uuidv4 } from 'uuid';

// Function to send post information to KV forum namespace
export async function onRequestPost({ request, env }) {
  try {
    // Request body contains the form data
    const formData = await request.formData();
    const postTitle = formData.get('postTitle');
    const postContent = formData.get('postContent');
    const postLocation = formData.get('postLocation');
    const postMeetingDate = formData.get('postMeetingDate');
    const postMeetingTime = formData.get('postMeetingTime');

    // Code to get current date and time
    const date = returnDate();
    const time = returnTime();

   if (postLocation == null && postMeetingDate == null) {
    // Create a regular post object
     const post = JSON.stringify({
       title: postTitle,
       content: postContent,
       currentDate: date,
       currentTime: time,
       type: 1, // Signifies a regular post
       deleted: 0, // Signifies the post is deleted or not
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
       currentDate: date,
       currentTime: time,
       date: postMeetingDate,
       time: postMeetingTime,
       type: 2, // Signifies a meetup post
       deleted: 0, // Signifies the post is deleted or not
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

// Function to get current date
export async function returnDate() {
  // Create object for current date
  const currentDate = new Date();

  // Format date to string (Like "April 5, 2024")
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return formattedDate;
}

// Function to get current time
export async function returnTime() {
  // Create object for current time
  const currentDate = new Date();

  // Format time to string (Like "15:30:00")
  const formattedTime = currentDate.toLocaleTimeString('en-US', { 
    hour12: true, // Set formatted time to display with 12 hour and am and pm
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  return formattedTime;
}

// Function to parse meetingDate string into a date format
export async function parseDate(date) {
  // Given date string in the format "month day year"
  const givenDateString = date;

  // Split the string into components
  const parts = givenDateString.split('-');

  // Extract month, day, and year from the components
  const month = parseInt(parts[0]);
  const day = parseInt(parts[1]);
  const year = parseInt(parts[2]);

  // Construct a Date object out of extracted components
  const givenDate = new Date(year + 2000, month - 1, day);

  // Get the current date
  const currentDate = new Date();

  // Compare the given date with the current date
  if (givenDate < currentDate) {
      return 0; // Meeting date has already past
  } else if (givenDate > currentDate) {
      return 1; // Meeting date is in future
  } else {
      return 2; // Meeting date is today
  }
}

// Function for displaying posts in forum.html and meetup.html
export async function getAllPosts({ env }) {
  try {
    const allKeys = await env.COOLFROG_FORUM.list();
    const allPosts = [];
    const allKeysStruct = [];

    for (const key of allKeys.keys) {
      const post = await env.COOLFROG_FORUM.get(key.name, { type: 'json' });
      allPosts.push(post);
      allKeysStruct.push(key.name);
    }

    // Filter posts with type 1 and type 2
    const filteredType1Posts = allPosts.filter(post => post.type === 1);
    const filteredType2Posts = allPosts.filter(post => post.type === 2);

    // Render filtered posts on the general forum webpage
    const generalForumPostsContainer = document.getElementById('general-forum-posts');
    filteredType1Posts.forEach(post => {
      // Checking if post needs to be displayed or not
      if (post.deleted == 0) {
        const postElement = document.createElement('div');
        postElement.classList.add('general-forum-post');
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
        `;
        generalForumPostsContainer.appendChild(postElement);
      }
    });

    // Render filtered posts on the meetup forum webpage
    const meetupForumPostsContainer = document.getElementById('meetup-forum-posts');
    filteredType2Posts.forEach(post => {
      // Checking if post needs to be displayed or not
      if (post.deleted == 0) {
        // Check if post meeting date is in the future
        if (parseDate(post.postMeetingDate) == 1) {
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
        } else if (parseDate(post.postMeetingDate) == 2) {
          // Check if post meeting date is same date as today
          const postElement = document.createElement('div');
          postElement.classList.add('meetup-forum-post');
          postElement.innerHTML = `
              <h3>${post.title}</h3>
              <p>${post.content}</p>
              <p><strong>Location:</strong> ${post.location}</p>
              <p><strong>Time:</strong> ${post.time}</p>
              <p><strong>Date:</strong> ${post.date}</p>
              <p><strong>Date:</strong> This meeting is today! </p> 
          `;
          meetupForumPostsContainer.appendChild(postElement);
        } else if (parseDate(post.postMeetingDate) == 0) {
          // Nothing needs to be done, post is not to be displayed if the meeting date has already passed
        }
      }
    });

  } catch (error) {
    // Error handling for if errors occur
    console.error("Error:", error);
    }
}