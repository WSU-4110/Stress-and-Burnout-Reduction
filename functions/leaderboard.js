import { v4 as uuidv4 } from 'uuid';

export async function onRequestGet({ request, env }) {
  // Check for session
  const sessionCookie = getSessionCookie(request);
  let session;

  if (!sessionCookie || !(session = await env.COOLFROG_SESSIONS.get(sessionCookie))) {
      return unauthorizedResponse();
  }

  // List all users and their streaks
  const allUsers = await env.COOLFROG_LEADERBOARD.list();
  const usersStreaks = await Promise.all(
    allUsers.keys.map(async (key) => ({
      username: key.name,
      streak: parseInt(await env.COOLFROG_LEADERBOARD.get(key.name), 10)
    }))
  );

  // Sort by streak, descending
  usersStreaks.sort((a, b) => b.streak - a.streak);

  // Determine the top user
  let topUser = '';
  if (usersStreaks.length > 0) {
    if (usersStreaks[0].streak === usersStreaks[1]?.streak) {
      topUser = '[Tied: No Winner]';
    } else {
      topUser = `${usersStreaks[0].username} (${usersStreaks[0].streak} days)`;
    }
  }

  // Current user's info
  const currentUser = usersStreaks.find(user => user.username === session.username);

  const pageHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Leaderboard</title>
        <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
        <style>
          .highlight {
            font-weight: bold;
            color: blue;
          }
        </style>
    </head>
    <body>
      <div class="container p-3">
        <div class="row">
          <div class="col-md-8">
            <h1>Top User: ${topUser}</h1>
            <table class="table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Login Streak (days)</th>
                </tr>
              </thead>
              <tbody>
                ${usersStreaks.map(user => `
                  <tr class="${user.username === session.username ? 'highlight' : ''}">
                    <td>${user.username}</td>
                    <td>${user.streak}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="col-md-4 text-right">
            <h3>Logged in as: ${session.username}</h3>
            <p>Your Streak: ${currentUser?.streak || 0} days</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
}

function getSessionCookie(request) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, val] = cookie.split('=').map(c => c.trim());
    acc[key] = val;
    return acc;
  }, {});
  return cookies['session-id'];
}

function unauthorizedResponse() {
  return new Response("Unauthorized - Please log in.", {status: 403, headers: {'Content-Type': 'text/plain'}});
}