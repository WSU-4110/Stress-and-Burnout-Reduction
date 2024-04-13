import { v4 as uuidv4 } from 'uuid';

async function onRequestGet({ request, env }) {
    const sessionCookie = getSessionCookie(request);
    let session, user;

    if (!sessionCookie || !(session = JSON.parse(await env.COOLFROG_SESSIONS.get(sessionCookie)))) {
        return unauthorizedResponse();
    }

    user = JSON.parse(await env.COOLFROG_USERS.get(session.username));
    if (!user) {
        return unauthorizedResponse("User data not found.");
    }

    const leaderboardData = await getAllLeaderboardData(env);
    const topUser = leaderboardData.sort((a, b) => b.streak - a.streak)[0];
    
    return generateLeaderboardPage(user, topUser, leaderboardData);
}

function getSessionCookie(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim().split('='));
    return Object.fromEntries(cookies)['session-id'];
}

function unauthorizedResponse(message = "Unauthorized - Please log in.") {
    return new Response(message, { status: 403, headers: { 'Content-Type': 'text/plain' } });
}

async function getAllLeaderboardData(env) {
    const leaderboardList = await env.COOLFROG_LEADERBOARD.list();
    const data = await Promise.all(
        leaderboardList.keys.map(async key => {
            const username = await env.COOLFROG_LEADERBOARD.get(key.name);
            return { username: username, streak: parseInt(key.name) };
        })
    );
    return data;
}

function generateLeaderboardPage(currentUser, topUser, leaderboardData) {
    const leaderboardHtml = leaderboardData.map(user => `
        <tr${currentUser.username === user.username ? ' class="table-primary"' : ''}>
            <td>${user.username}</td>
            <td>${user.streak}</td>
        </tr>
    `).join('');

    const pageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Leaderboard</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    padding-top: 5rem;
                    padding-bottom: 3rem;
                }
                .top-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="top-info">
                    <div>
                        <h2 class="mb-0">Top User</h2>
                        <p><strong>${topUser.username}</strong> with a streak of <strong>${topUser.streak} days</strong></p>
                    </div>
                    <div class="text-end">
                        <h4 class="mb-0">Your Streak</h4>
                        <p><strong>${currentUser.username}</strong>: ${currentUser.login_streak_days} days</p>
                    </div>
                </div>
                <h3>Leaderboard</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Streak</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${leaderboardHtml}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `;

    return new Response(pageHtml, { headers: { 'Content-Type': 'text/html' }});
}

export default {
    async fetch(request, env, ctx) {
        if (request.method.toUpperCase() === "GET") {
            return await onRequestGet({ request, env });
        }

        return new Response("Method Not Allowed", { status: 405 });
    }
};