addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Check if request is for the username API
  const url = new URL(request.url);
  if (url.pathname === "/api/username") {
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = getCookieValue(cookieHeader, "session-id");
    
    if (sessionId) {
      // Attempt to fetch session data from KV
      const sessionData = await COOLFROG_SESSIONS.get(sessionId);
      if (sessionData) {
        // Session is valid, parse the stored JSON to get the username
        const data = JSON.parse(sessionData);
        return new Response(JSON.stringify({ username: data.username }), { status: 200, headers: { "Content-Type": "application/json" }});
      }
    }
    // If sessionId not found or sessionData not available, return an error or empty user.
    return new Response(JSON.stringify({ username: null}), { status: 200, headers: { "Content-Type": "application/json" }});
  }

  return new Response('Not found', { status: 404 });
}

// Utility function to parse cookies and extract a specific one
function getCookieValue(cookieHeader, cookieName) {
  let matches = cookieHeader?.match('(^|;)\\s*' + cookieName + '\\s*=\\s*([^;]+)');
  return matches ? matches.pop() : null;
}