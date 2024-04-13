import { v4 as uuidv4 } from 'uuid';
import { pbkdf2Sync } from 'node:crypto';

export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();
    const email = formData.get('email').trim();
    const rawPassword = formData.get('password');

    const usernameKey = await env.COOLFROG_EMAILS.get(email);
    if (!usernameKey) {
        return responseForRetry('Incorrect email or password.');
    }

    let user = await env.COOLFROG_USERS.get(usernameKey);
    if (!user) {
        return responseForRetry('Incorrect email or password.');
    }

    user = JSON.parse(user);
    const hashedPassword = pbkdf2Sync(rawPassword, user.salt, 1000, 64, 'sha256').toString('hex');
    if (hashedPassword !== user.password) {
        return responseForRetry('Incorrect email or password.');
    }

    // Passwords match, update user info for a new session
    const sessionId = uuidv4();
    const currentTime = Math.floor(Date.now() / 1000);

    // Login streak logic
    if (user.time_last_sign_in) {
        if (currentTime - user.time_last_sign_in >= 86400) {
            if (currentTime - user.time_last_sign_in < 172800) {
                user.login_streak_days = (user.login_streak_days || 0) + 1;
            } else {
                user.login_streak_days = 1; // More than one day missed, reset streak
            }
            user.time_last_sign_in = currentTime; // Update the last login time
        }
    } else {
        user.login_streak_days = 1; // Initialize if it's their first login
        user.time_last_sign_in = currentTime;
    }

    // Update the leaderboard (or initialize if first entry)
    await env.COOLFROG_LEADERBOARD.put(user.login_streak_days.toString(), user.username);

    // Add or update the sessions array in the user object
    if (!user.sessions) user.sessions = [];
    user.sessions.push({
        sessionId: sessionId,
        time_session_creation: currentTime,
    });

    // Update user in COOLFROG_USERS with the new session and last sign-in time
    await env.COOLFROG_USERS.put(usernameKey, JSON.stringify(user));
    
    // Also store the session information in COOLFROG_SESSIONS
    const sessionData = {
        username: user.username,
        time_session_creation: currentTime,
    };
    await env.COOLFROG_SESSIONS.put(sessionId, JSON.stringify(sessionData));

    // Set the session-id cookie and redirect to an account page
    const headers = {
      'Set-Cookie': `session-id=${sessionId}; Path=/; HttpOnly`,
      'Content-Type': 'text/html',
    };
    return new Response(`<html><head><title>Login Successful</title></head><body><p>Login Successful. Redirecting...</p><script>window.location.href = '/account';</script></body></html>`, { status: 200, headers});

  } catch (error) {
    console.error('Login error:', error);
    return new Response('Internal Server Error', { status: 500 });
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