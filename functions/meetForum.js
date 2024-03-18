import { v4 as uuidv4 } from 'uuid';

// Function for using getAllPosts
export async function getAllMeetupPosts({ env }) {
  const allKeys = await env.COOLFROG_MEETFORUM.list();
  const allPosts = [];
 
  for (const key of allKeys.keys) {
     const post = await env.COOLFROG_MEETFORUM.get(key.name, { type: 'json' });
     allPosts.push(post);
  }
 
  return allPosts;
 };

export async function onRequestMeetupPost({ request, env }) {
 try {
    // Form data getting
    const formData = await request.formData();
    const postTitle = formData.get('postTitle');
    const postContent = formData.get('postContent');
    const postLocation = formData.get('postLocation');
    const postMeetingDate = formData.get('postMeetingDate');

    // Create a post object with 4 attributes so far
    const post = JSON.stringify({
      title: postTitle,
      content: postContent,
      location: postLocation,
      date: postMeetingDate,
    });

    // Generate a unique ID for the post
    const uniqueId = uuidv4();

    // Store the post in the KV namespace
    await env.COOLFROG_MEETFORUM.put(uniqueId, post);

  } catch (error) {
    // Error handling
    console.error("Error:", error);
  }
};