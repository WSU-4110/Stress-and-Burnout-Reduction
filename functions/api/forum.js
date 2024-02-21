addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  async function handleRequest(request) {
    try {
      // Extract data from the incoming request
      const requestBody = await request.json();
      const { title, content } = requestBody;
  
      // Generate a unique identifier for the new page
      const pageId = generateUniqueId();
  
      // Store the data in Cloudflare KV storage
      await COOLFROG_FORUM.put(pageId, JSON.stringify({ title, content }));
  
      // Return the unique identifier for the new page
      return new Response(JSON.stringify({ pageId }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error) {
      console.error('Error handling forum request:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
  
  // Function to generate a unique identifier
  function generateUniqueId() {
    return Math.random().toString(36).substring(2, 10);
  }