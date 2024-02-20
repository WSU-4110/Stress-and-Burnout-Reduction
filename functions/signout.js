export async function onRequest({ request, env }) {
  try {
    // Attempt to retrieve the session-id from the request cookies
    const sessionIdCookie = request.headers.get('Cookie')?.match(/session-id=([^;]+)(;|$)/)?.[1];

    if (!sessionIdCookie) {
      // If not found, direct the user back or to a login page
      return redirectToLogin('No session found.');
    }

    // Retrieve session data from COOLFROG_SESSIONS
    const sessionData = await env.COOLFROG_SESSIONS.get(sessionIdCookie);

    if (!sessionData) {
      // If session not found, possibly already signed out
      return redirectToLogin('Session not found or already signed out.');
    }

    const { username } = JSON.parse(sessionData);

    // Remove the session from the COOLFROG_SESSIONS
    await env.COOLFROG_SESSIONS.delete(sessionIdCookie);

    // Now update the user data in COOLFROG_USERS
    const userDataKey = username; // or however you map usernames to user data keys
    const userDataJSON = await env.COOLFROG_USERS.get(userDataKey);

    if (userDataJSON) {
      let userData = JSON.parse(userDataJSON);

      // Filter out the session to remove
      userData.sessions = userData.sessions.filter(session => session.sessionId !== sessionIdCookie);

      // Update the user data in COOLFROG_USERS
      await env.COOLFROG_USERS.put(userDataKey, JSON.stringify(userData));
    }

    // Delete the session-id cookie by setting an expired date
    const headers = {
      'Set-Cookie': 'session-id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
      'Location': '/login', // or wherever you want to redirect after logout
    };

    return new Response('Redirecting to login...', {
      status: 302,
      headers: headers,
    });
  } catch (error) {
    console.error('Sign out error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

function redirectToLogin(message) {
  return new Response(
    `<html>
      <head>
        <title>Redirecting...</title>
        <meta http-equiv="refresh" content="5;url=/login">
      </head>
      <body>
        <p>${message} Redirecting to login...</p>
      </body>
    </html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}