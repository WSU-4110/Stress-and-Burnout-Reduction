// functions/forum.js
import { savePost, fetchAllPosts, updateLikes } from './coolfrog.forum';

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

// Function to create a new forum post
export async function createForumPost(title, content) {
    try {
        // Validate user is logged in
        const username = await checkLoggedIn(request);

        // Logic to create a new forum post
        const postId = await createPostInDatabase(username, title, content);

        // Return the new post ID
        return postId;
    } catch (error) {
        console.error('Error creating forum post:', error);
        throw new Error('Failed to create forum post');
    }
}

// Function to update likes/dislikes for a forum post
export async function updateLikesDislikes(postId, action) {
    try {
        // Validate user is logged in
        const username = await checkLoggedIn(request);

        // Logic to update likes/dislikes for the specified post
        const updatedLikes = await updateLikesInDatabase(postId, action, username);

        // Return the updated like/dislike count
        return updatedLikes;
    } catch (error) {
        console.error('Error updating likes/dislikes:', error);
        throw new Error('Failed to update likes/dislikes');
    }
}

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
async function checkLoggedIn(request) {
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
        // Handle errors or redirect the user to the login page
        throw new Error('User not logged in');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const leftButton = document.getElementById('leftButton');
    const rightButton = document.getElementById('rightButton');
    fetchForumPosts();

    fetch('/api/username').then(response => response.json()).then(data => {
        if (data.username) {
            leftButton.textContent = 'Account';
            leftButton.onclick = function () { window.location.href = '/account'; };
            // Dynamically use the username in the 'Sign Out' button text
            rightButton.textContent = `Sign Out of ${data.username}`;
            rightButton.onclick = function () { window.location.href = '/signout'; };
        } else {
            leftButton.textContent = 'Sign Up';
            leftButton.onclick = function () { window.location.href = '/signup'; };
            rightButton.textContent = 'Login';
            rightButton.onclick = function () { window.location.href = '/login'; };
        }
    }).catch(error => {
        console.error("Error fetching username:", error);
        leftButton.textContent = 'Sign Up';
        leftButton.onclick = function () { window.location.href = '/signup'; };
        rightButton.textContent = 'Login';
        rightButton.onclick = function () { window.location.href = '/login'; };
    });

    async function fetchForumPosts() {
        try {
            const response = await fetch('/api/forum/posts');
            const forumPosts = await response.json();

            // Clear existing posts
            const forumPostsContainer = document.getElementById('forum-posts');
            forumPostsContainer.innerHTML = '';

            // Append new posts
            forumPosts.forEach(post => {
                const postElement = createPostElement(post);
                forumPostsContainer.appendChild(postElement);
            });
        } catch (error) {
            console.error('Error fetching forum posts:', error);
        }
    }
            
    function createPostElement(post) {
        // Create a new post element
        const postElement = document.createElement('div');
        postElement.classList.add('forum-post');

        // Title
        const titleElement = document.createElement('h2');
        titleElement.textContent = post.title;
        postElement.appendChild(titleElement);

        // Content
        const contentElement = document.createElement('p');
        contentElement.textContent = post.content;
        postElement.appendChild(contentElement);

        // Likes
        const likesElement = document.createElement('span');
        likesElement.textContent = `Likes: ${post.likes}`;
        postElement.appendChild(likesElement);

        // Dislikes
        const dislikesElement = document.createElement('span');
        dislikesElement.textContent = `Dislikes: ${post.dislikes}`;
        postElement.appendChild(dislikesElement);

        // Link to view comments
        const commentsLink = document.createElement('a');
        commentsLink.href = `/forum/${post.id}/comments`;
        commentsLink.textContent = 'View Comments';
        postElement.appendChild(commentsLink);

        return postElement;
    }
});