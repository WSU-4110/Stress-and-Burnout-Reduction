import { v4 as uuidv4 } from 'uuid';

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const sessionCookie = getSessionCookie(request);
    let session;

    if (!sessionCookie || !(session = JSON.parse(await env.COOLFROG_SESSIONS.get(sessionCookie)))) {
        return unauthorizedResponse();
    }
    
    if (url.pathname === '/dashboard' || url.pathname === '/dashboard/get-weekly') {
        return renderDashboardPage(session.username, env);
    }

    return new Response("Resource Not Found", { status: 404 });
}

async function renderDashboardPage(username, env) {
    let challenges = await getChallengesWithMostActiveMembers(env);
    let weeklyChallenge, dailyChallenge;

    // Determine weekly and daily challenges based on member participation
    if (challenges.length >= 2) {
        weeklyChallenge = challenges[0];
        dailyChallenge = challenges[1];
    } else if (challenges.length === 1) {
        dailyChallenge = challenges[0];
    }

    const weeklyHtml = weeklyChallenge ? await generateChallengeHtml(weeklyChallenge, username, env) : '<td colspan="2">No current weekly challenge</td>';
    const dailyHtml = dailyChallenge ? await generateChallengeHtml(dailyChallenge, username, env) : '<td colspan="2">No current daily challenge</td>';

    const pageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
            <title>Dashboard</title>
        </head>
        <body>
        <div class="container mt-5">
            <h1>Dashboard</h1>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Weekly Challenge</th>
                        <th>Actions</th>
                        <th>Daily Challenge</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        ${weeklyHtml}
                        ${dailyHtml}
                    </tr>
                </tbody>
            </table>
        </div>
        </body>
        </html>
    `;

    return new Response(pageHtml, { headers: { 'Content-Type': 'text/html' } });
}

async function generateChallengeHtml(challenge, username, env) {
    let userPost = await fetchUserPostForTopic(challenge.id, username, env);

    let actionHtml;
    if (userPost) {
        if (userPost.status === "active") {
            actionHtml = `
                <form action="/challenge/topic/${challenge.id}/complete-challenge" method="post" class="d-inline">
                    <button type="submit" class="btn btn-success btn-sm">Complete Challenge</button>
                </form>
                <form action="/challenge/topic/${challenge.id}/abandon-challenge" method="post" class="d-inline">
                    <button type="submit" class="btn btn-danger btn-sm">Abandon Challenge</button>
                </form>
            `;
        } else if (userPost.status === "completed") {
            actionHtml = `<span>Completed</span>`;
        }
    } else {
        actionHtml = `
            <form method="post" action="/challenge/topic/${challenge.id}/accept-challenge">
                <button type="submit" class="btn btn-success">Accept the Challenge</button>
            </form>
        `;
    }

    return `<td><a href="/challenge/topic/${challenge.id}">${challenge.title}</a></td><td>${actionHtml}</td>`;
}

async function fetchUserPostForTopic(topicId, username, env) {
    const stmt = env.COOLFROG_CHALLENGES.prepare("SELECT status FROM posts WHERE topic_id = ? AND username = ?");
    return (await stmt.bind(topicId, username).get()).result;
}

async function getChallengesWithMostActiveMembers(env) {
    const stmt = env.COOLFROG_CHALLENGES.prepare(`
        SELECT topics.id, topics.title, COUNT(posts.id) AS activeCount
        FROM topics
        JOIN posts ON topics.id = posts.topic_id AND posts.status = 'active'
        GROUP BY topics.id
        ORDER BY activeCount DESC
        LIMIT 2
    `);
    return (await stmt.all()).results;
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