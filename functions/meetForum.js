import { v4 as uuidv4 } from 'uuid';

export async function onRequestPost({ request, env }) {
 try {
    // Assuming the request body contains the form data
    const formData = await request.formData();
    const postLocation = formData.get('postTitle');
    const postMeetDetails = formData.get('postContent');

    // Create a post object
    const post = JSON.stringify({
      location: postLocation,
      meetDetails: postMeetDetails,
    });

    // Generate a unique ID for the post
    const uniqueId = uuidv4();

    // Store the post in the KV namespace
    await env.COOLFROG_MEETFORUM.put(uniqueId, post);

  } catch (error) {
    console.error("Error:", error);
    // Error handling
  }
};