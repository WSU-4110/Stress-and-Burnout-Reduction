import { v4 as uuidv4 } from 'uuid';

export async function onRequestGet({ request, env }) {
    const sessionCookie = getSessionCookie(request);
    let session;

    if (!sessionCookie || !(session = JSON.parse(await env.COOLFROG_SESSIONS.get(sessionCookie)))) {
        return unauthorizedResponse();
    }

    // Fetch all users and their login streaks
    const leaderboardData = await env.COOLFROG_LEADERBOARD.list();
    let users = await Promise.all(leaderboardData.keys.map(async (key) => ({
        username: key.name,
        streak: parseInt(await env.COOLFROG_LEADERBOARD.get(key.name), 10)
    })));

    // Sort users by login streak
    users.sort((a, b) => b.streak - a.streak);

    // Determine the top user
    const topStreak = Math.max(...users.map(user => user.streak));
    const topUsers = users.filter(user => user.streak === topStreak);
    let topUserDisplay = topUsers.length > 1 ? '[Tied: No Winner]' : `${topUsers[0].username} (${topUsers[0].streak} days)`;

    // Current logged in user's info for display
    const currentUserStreak = users.find(user => user.username === session.username).streak;

    // HTML for the leaderboard page
    const pageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Leaderboard</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
        </head>
        <body>
            <div class="container">
                <h1 class="mt-5">Login Streak Leaderboard</h1>
                <div class="d-flex justify-content-between">
                    <div>
                        <h2>Top Streak: ${topUserDisplay}</h2>
                    </div>
                    <div>
                        <h2>Your Streak: ${currentUserStreak} days</h2>
                    </div>
                </div>
                <table class="table table-hover mt-3">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Login Streak (in days)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr ${user.username === session.username ? 'class="table-primary"' : ''}>
                                <td>${user.username}</td>
                                <td>${user.streak}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `;

    return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
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