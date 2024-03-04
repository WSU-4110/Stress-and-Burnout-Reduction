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

    // Set last sign-in time
    user.time_last_sign_in = currentTime;

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

document.addEventListener({env}, function () {

  // Functionality for login and signup
  const leftButton = document.getElementById('leftButton');
  const rightButton = document.getElementById('rightButton');

  fetch('/api/username')
    .then(response => response.json())
    .then(data => {
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
    })
    .catch(error => {
      console.error("Error fetching username:", error);
      leftButton.textContent = 'Sign Up';
      leftButton.onclick = function () { window.location.href = '/signup'; };
      rightButton.textContent = 'Login';
      rightButton.onclick = function () { window.location.href = '/login'; };
    });

    // Functionality for submitting a new post
    document.addEventListener('DOMContentLoaded', function () {
        const postForm = document.getElementById('postForm');
        postForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission
    
        const postTitle = document.getElementById('postTitle').value;
        const postContent = document.getElementById('postContent').value;
    
        // Convert post to JSON string for KV storage
        const post = JSON.stringify({
            title: postTitle,
            content: postContent,
            // Add other relevant fields like author, timestamp, etc.
        });
    
        // Store the post directly in the KV namespace (not recommended)
        env.COOLFROG_FORUM.put(generateUniqueId(), post)
            .then(() => {
            // Success handling (e.g., display success message)
            })
            .catch(error => {
            console.error("Error storing post:", error);
            // Error handling (e.g., display error message)
            });
        });
    });
});

// Function to generate a unique identifier
function generateUniqueId() {
  return Math.random().toString(36).substring(2, 10);
}

// Function to get all posts from server (already asynchronous)
export async function getAllPosts({ env }) {
  // Retrieve all posts from KV
  const allKeys = await env.COOLFROG_FORUM.list();
  const allPosts = [];

  for (const key of allKeys.keys) {
    const post = await env.COOLFROG_FORUM.get(key.name, { type: 'json' });
    allPosts.push(post);
  }

  return allPosts;
}

// Attach functions to the window object to make them globally accessible
window.createNewPage = createNewPage;
window.getAllPosts = getAllPosts;
