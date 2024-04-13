import { v4 as uuidv4 } from 'uuid';

export async function onRequestGet({ request, env }) {
  try {
    const sessionCookie = getSessionCookie(request);
    let session;

    if (!sessionCookie || !(session = JSON.parse(await env.COOLFROG_SESSIONS.get(sessionCookie)))) {
        return unauthorizedResponse();
    }

    const leaderboard = await env.COOLFROG_LEADERBOARD.list();
    const users = await Promise.all(
      leaderboard.keys.map(async key => ({
        username: await env.COOLFROG_LEADERBOARD.get(key.name),
        streak: key.name
      }))
    );
    
    users.sort((a, b) => b.streak - a.streak);  // Sort users by streak in descending order

    const topUser = users.length > 0 ? users[0] : null;
    const isTied = users.filter(u => u.streak === topUser.streak).length > 1;
    const currentUser = users.find(u => u.username === session.username);

    const pageHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
        <title>Leaderboard</title>
        <style>
          .highlight { background-color: #f2f2f2; }
          .top-right { position: fixed; top: 10px; right: 10px; }
          .top-left { position: fixed; top: 10px; left: 10px; }
        </style>
      </head>
      <body>
        <div class="top-right">
          Current User: ${session.username} (Streak: ${currentUser.streak} days)
        </div>
        <div class="top-left">
          Top User: ${isTied ? "[Tied: No Winner]" : `${topUser.username} (Streak: ${topUser.streak} days)`}
        </div>
        <div class="container mt-5">
          <h1>Leaderboard</h1>
          <table class="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Login Streak (days)</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr class="${u.username === session.username ? 'highlight' : ''}">
                  <td>${u.username}</td>
                  <td>${u.streak}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
  } catch (error) {
    console.error('Error generating leaderboard page:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

function getSessionCookie(request) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim().split('='));
  return Object.fromEntries(cookies)['session-id'];
}

function unauthorizedResponse() {
  return new Response("Unauthorized - Please log in.", {status: 403, headers: {'Content-Type': 'text/plain'}});
}