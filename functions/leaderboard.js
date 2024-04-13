import { v4 as uuidv4 } from 'uuid';

export async function onRequestGet({ request, env }) {
  // Get session from cookie
  const sessionCookie = getSessionCookie(request);
  let session;

  if (!sessionCookie || !(session = JSON.parse(await env.COOLFROG_SESSIONS.get(sessionCookie)))) {
    return unauthorizedResponse();
  }

  // Get leaderboard data
  const leaderboardData = await env.COOLFROG_LEADERBOARD.list();
  const leaderboardEntries = [];
  let topUser = null;

  // Fetch each value in leaderboardData and create an array of entries
  for (const entry of leaderboardData.keys) {
    const username = await env.COOLFROG_LEADERBOARD.get(entry.name);
    const userDays = parseInt(entry.name);
    leaderboardEntries.push({ username, loginStreak: userDays });

    if (!topUser || topUser.loginStreak < userDays) {
      topUser = { username, loginStreak: userDays };
    }
  }

  // Sort leaderboard by login streak
  leaderboardEntries.sort((a, b) => b.loginStreak - a.loginStreak);
  
  // Render the leaderboard page
  return renderLeaderboardPage(session.username, leaderboardEntries, topUser, env);
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

async function renderLeaderboardPage(currentUser, leaderboardEntries, topUser, env) {
  let currentUserRowHighlighted = '';

  const leaderboardRows = leaderboardEntries.map(entry => {
    const isCurrentUser = entry.username === currentUser;
    const rowClass = isCurrentUser ? 'table-primary' : '';
    if (isCurrentUser) currentUserRowHighlighted = rowClass;
    return `
      <tr class="${rowClass}">
        <td>${entry.username}</td>
        <td>${entry.loginStreak} Days</td>
      </tr>
    `;
  }).join('');

  const pageHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
      <title>Leaderboard</title>
    </head>
    <body>
      <div class="container mt-5">
        <div class="row">
          <div class="col-9">
            <h1>Top User: ${topUser.username}</h1>
            <h2>Streak: ${topUser.loginStreak} Days</h2>
          </div>
          <div class="col-3 text-right">
            <p>Logged in as: <strong>${currentUser}</strong></p>
            <p>Your streak: <strong>${leaderboardEntries.find(entry => entry.username === currentUser).loginStreak} Days</strong></p>
          </div>
        </div>
        <table class="table mt-3">
          <thead class="thead-dark">
            <tr>
              <th>Username</th>
              <th>Login Streak Days</th>
            </tr>
          </thead>
          <tbody>
            ${leaderboardRows}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;

  return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
}