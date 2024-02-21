// functions/forumWorker.js
import { savePost, fetchAllPosts, updateLikes } from './coolfrog.forum';

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === 'POST') {
        // Handle posting a new post
        if (pathname === '/api/post') {
            return handlePost(request);
        }

        // Handle like/dislike actions
        if (pathname.startsWith('/api/post/')) {
            return handleLikeDislike(request);
        }
    } else if (request.method === 'GET') {
        // Handle fetching all posts
        if (pathname === '/api/posts') {
            return handleGetPosts(request);
        }
    }

    return new Response('Not Found', { status: 404 });
}

async function handlePost(request) {
    try {
        // Validate user is logged in
        const username = await checkLoggedIn(request);

        // Your existing code for handling post
        const formData = await request.json();
        const postId = await savePost(formData, username);

        // Return the new post data
        const postData = { id: postId, ...formData };
        return new Response(JSON.stringify(postData), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error handling post:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

async function handleGetPosts(request) {
    try {
        // Fetch and return all posts from your data store (KV worker)
        const posts = await fetchAllPosts();

        return new Response(JSON.stringify(posts), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error handling get posts:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

async function handleLikeDislike(request) {
    try {
        // Validate user is logged in
        const username = await checkLoggedIn(request);

        // Your existing code for handling like/dislike
        const { pathname } = new URL(request.url);
        const [, postId, action] = pathname.split('/');
        const updatedLikes = await updateLikes(postId, action, username);

        // Return the updated like/dislike count
        return new Response(JSON.stringify({ likes: updatedLikes }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error handling like/dislike:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

// Helper function to check if the user is logged in
async function checkLoggedIn(request, env) {
    try {
        // Check for the session ID in cookies
        const sessionIdCookie = request.headers.get('Cookie')?.match(/session-id=([^;]+)(;|$)/)?.[1];

        if (!sessionIdCookie) {
            // If session ID not found, user is not logged in
            throw new Error('User not logged in');
        }

        // Validate the session ID against your data store (KV worker)
        const sessionData = await env.COOLFROG_SESSIONS.get(sessionIdCookie);

        if (!sessionData) {
            // If session not found, user is not logged in
            throw new Error('User not logged in');
        }

        // If all checks pass, return the username
        const { username } = JSON.parse(sessionData);
        return username;
    } catch (error) {
        // Handle errors
        throw new Error('User not logged in');
    }
}
