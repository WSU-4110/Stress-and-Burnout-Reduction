// api/forum.js

// Import necessary functions from forum.js
import { createForumPost, updateLikesDislikes } from '../forum';

// Endpoint to create a new forum post
export async function onCreateForumPost(request) {
    try {
        const formData = await request.formData();
        const title = formData.get('title');
        const content = formData.get('content');

        const postId = await createForumPost(title, content);

        return new Response(JSON.stringify({ postId }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error creating forum post:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

// Endpoint to update likes/dislikes for a forum post
export async function onUpdateLikesDislikes(request) {
    try {
        const { postId, action } = await request.json();

        const updatedLikes = await updateLikesDislikes(postId, action);

        return new Response(JSON.stringify({ likes: updatedLikes }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating likes/dislikes:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

// Endpoint to fetch forum posts
export async function onFetchForumPosts(request) {
    try {
        // Logic to fetch forum posts
        const forumPosts = await fetchForumPostsFromDatabase();

        return new Response(JSON.stringify(forumPosts), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching forum posts:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

// Function to fetch forum posts from the database (KV store)
export async function fetchForumPostsFromDatabase() {
    try {
        // COOLFROG_FORUM is KV namespace for forum posts
        const forumPosts = await COOLFROG_FORUM.get('all_posts');

        if (!forumPosts) {
            // If no forum posts found, return an empty array or handle accordingly
            return [];
        }

        // Parse the JSON data stored in KV
        return JSON.parse(forumPosts);
    } catch (error) {
        console.error('Error fetching forum posts from the database:', error);
        throw new Error('Failed to fetch forum posts');
    }
}