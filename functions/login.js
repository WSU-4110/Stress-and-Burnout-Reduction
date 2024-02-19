import { v4 as uuidv4 } from 'uuid';
import { pbkdf2Sync } from 'node:crypto';

export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();
    const email = formData.get('email').trim();
    const rawPassword = formData.get('password');

    const username = await env.COOLFROG_EMAILS.get(email);
    if (!username) {
        return responseForRetry('Incorrect email or password.');
    }
  
    const userData = await env.COOLFROG_USERS.get(username);
    if (!userData) {
        return responseForRetry('Incorrect email or password.');
    }

    const user = JSON.parse(userData);
    const hashedPassword = pbkdf2Sync(rawPassword, user.salt, 1000, 64, 'sha256').toString('hex');
    if (hashedPassword !== user.password) {
        return responseForRetry('Incorrect email or password.');
    }

    // Passwords match, create a new session
    const sessionId = uuidv4();
    const currentTime = Math.floor(Date.now() / 1000);
    const sessionData = {
        username: user.username,
        time_session_creation: currentTime,
    };

    await env.COOLFROG_SESSIONS.put(sessionId, JSON.stringify(sessionData));

    // Set the session-id cookie and redirect to account page
    const headers = {
      'Set-cookie': `session-id=${sessionId}; Path=/; HttpOnly`,
      'Content-Type': 'text/html',
    };
    return new Response(`<html><head><title>Login Successful</title></head><body><p>Login Successful. Redirecting...</p><script>window.location.href = '/account';</script></body></html>`, { status: 200, headers: headers});

  } catch (error) {
    console.error('Login error:', error);
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}

function responseForRetry(message) {
  const retryResponseHTML = `
      <html>
        <head>
          <title>Login Failed</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
        </head>
        <body>
          <div class="container text-center p-5">
            <h2>${message}</h2>
            <p>Please wait, you'll be able to retry in a few seconds.</p>
            <button id="retryButton" class="btn btn-primary mt-3" disabled>Retry</button>
            <script>
              setTimeout(function() {
                document.getElementById('retryButton').disabled = false;
                document.getElementById('retryButton').innerText = 'Retry Now';
                document.getElementById('retryButton').onclick = function() {
                  window.location.href = '/login';
                };
              }, 5000);
            </script>
          </div>
        </body>
      </html>`;
  return new Response(retryResponseHTML, { status: 400, headers: { "Content-Type": "text/html" }});
}