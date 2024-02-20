export async function onRequestGet({ request, env }) {
  try {
    const sessionId = getSessionIdFromRequest(request);
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID missing from cookies' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const sessionValue = await env.COOLFROG_SESSIONS.get(sessionId);
    if (!sessionValue) {
      return new Response(JSON.stringify({ error: 'Session not found' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const sessionData = JSON.parse(sessionValue);
    return new Response(JSON.stringify({ username: sessionData.username }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('API username error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

function getSessionIdFromRequest(request) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const sessionIdCookie = cookies.find(cookie => cookie.startsWith('session-id='));
  
  if (!sessionIdCookie) return null;
  
  const sessionId = sessionIdCookie.split('=')[1];
  return sessionId;
}