ocument.addEventListener('DOMContentLoaded', function () {
    const COOLFROG_FORUM = coolfrog.forum;

    addEventListener('fetch', event => {
        event.respondWith(handleRequest(event.request));
    });

    async function handleRequest(request) {
        try {
            if (request.method === 'GET') {
                // If it's a GET request, retrieve and return all posts from KV
                const allPosts = await getAllPosts();
                return new Response(JSON.stringify(allPosts), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 200,
                });
            } else if (request.method === 'POST') {
                // If it's a POST request, store the new post in KV
                const requestBody = await request.json();
                const { title, content } = requestBody;

                const newPost = { title, content, timestamp: Date.now() };

                // Generate a unique identifier for the new post
                const postId = generateUniqueId();

                // Store the new post in KV
                await COOLFROG_FORUM.put(postId, JSON.stringify(newPost));

                // Return the unique identifier for the new post
                return new Response(JSON.stringify({ postId }), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 200,
                });
            } else {
                // Handle other HTTP methods as needed
                return new Response('Method Not Allowed', { status: 405 });
            }
        } catch (error) {
            console.error('Error handling forum request:', error);
            return new Response('Internal Server Error', { status: 500 });
        }
    }

    async function getAllPosts() {
        // Retrieve all posts from KV
        const allKeys = await COOLFROG_FORUM.list();
        const allPosts = [];

        for (const key of allKeys.keys) {
            const post = await COOLFROG_FORUM.get(key.name, { type: 'json' });
            allPosts.push(post);
        }

        return allPosts;
    }

    // Function to generate a unique identifier
    function generateUniqueId() {
        return Math.random().toString(36).substring(2, 10);
    }
});