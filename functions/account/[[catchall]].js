import {
	v4 as uuidv4
} from 'uuid';

export async function onRequestGet({
	request,
	env
}) {
	const url = new URL(request.url);
	const sessionCookie = getSessionCookie(request);
	let session;

	if (!sessionCookie || !(session = JSON.parse(await env.COOLFROG_SESSIONS.get(sessionCookie)))) {
		return unauthorizedResponse();
	}

	if (url.pathname === '/account' || url.pathname === '/account/get-weekly') {
		return renderAccountPage(session.username, env);
	}

	return new Response("Resource Not Found", {
		status: 404
	});
}

async function renderAccountPage(username, env) {
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
            <title>Account</title>
    <style>
        body {
            padding-top: 80px; /* Padding to ensure content isn't hidden behind fixed header */
        }
        .fixed-header {
            position: fixed;
            top: 0;
            width: 100%;
            z-index: 1000;
        }
        .navbar-brand img {
            height: 40px;
        }
    </style>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            function toggleFixedHeader() {
                const header = document.querySelector('.fixed-header');
                if (window.scrollY > header.offsetTop) {
                    header.classList.add('fixed-top', 'bg-dark', 'navbar-dark');
                } else {
                    header.classList.remove('fixed-top', 'bg-dark', 'navbar-dark');
                }
            }
            window.addEventListener('scroll', toggleFixedHeader);
        });
    </script>
        </head>
        <body>
    <header class="fixed-header navbar navbar-expand-lg navbar-light bg-light">
        <div class="container">
            <a class="navbar-brand" href="/index">
                <img src="/cdn/coolfrog.png" alt="logo">
            </a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" 
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item"><a class="nav-link" href="/index">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="/forums">Forums</a></li>
                    <li class="nav-item"><a class="nav-link" href="/meetups">Meetups</a></li>
                    <li class="nav-item"><a class="nav-link" href="/videopage">Videos</a></li>
                    <li class="nav-item"><a class="nav-link" href="/article_library">Articles</a></li>
                    <li class="nav-item"><a class="nav-link" href="/dailyInteractive">Daily Interactive</a></li>
                    <li class="nav-item"><a class="nav-link" href="/relaxation-sounds">Relaxation Sounds</a></li>
                    <li class="nav-item"><a class="nav-link" href="/MeditationSession">Meditation Sessions</a></li>
                    <li class="nav-item"><a class="nav-link" href="/timersPage">Timers</a></li>
                    <li class="nav-item"><a class="nav-link" href="/WellnessChallenges">Wellness Challenges</a></li>
                </ul>
            </div>
        </div>
    </header>
    <div class="container mt-5">
        <div class="row justify-content-end">
            <div class="col-auto">
                <button id="leftButton" class="btn btn-primary btn-lg">Sign Up</button>
                <button id="rightButton" class="btn btn-secondary btn-lg">Login</button>
            </div>
        </div>
        <div class="container mt-5">
            <h1>Account</h1>
            <table class="table table-hover" style="table-layout: fixed;">
                <thead>
                    <tr>
                        <th style="width: 20%;">Challenge Type</th>
                        <th>Challenge Title</th>
                        <th style="width: 30%;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Weekly Challenge</th>
                        ${weeklyHtml}
                    </tr>
                    <tr>
                        <th>Daily Challenge</th>
                        ${dailyHtml}
                    </tr>
                </tbody>
            </table>
			
			<div class="mt-4">
                <a href="/challenge" class="btn btn-primary btn-lg btn-block">User Created Challenges</a>
                <a href="/config" class="btn btn-secondary btn-lg btn-block">Account Config</a>
                <a href="/leaderboard" class="btn btn-info btn-lg btn-block">Login Streak Leaderboard</a>
                <a href="/goals" class="btn btn-success btn-lg btn-block">Goal Tracker</a>
            </div>
			
        </div>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const leftButton = document.getElementById('leftButton');
            const rightButton = document.getElementById('rightButton');

            fetch('/api/username').then(response => response.json()).then(data => {
                if (data.username) {
                    leftButton.textContent = 'Account';
                    leftButton.onclick = function () { window.location.href = '/account'; };
                    rightButton.textContent = 'Sign Out of ' + data.username;
                    rightButton.onclick = function () { window.location.href = '/signout'; };
                } else {
                    leftButton.textContent = 'Sign Up';
                    leftButton.onclick = function () { window.location.href = '/signup'; };
                    rightButton.textContent = 'Login';
                    rightButton.onclick = function () { window.location.href = '/login'; };
                }
            }).catch(error => {
                console.error("Error fetching username:", error);
                leftButton.textContent = 'Sign Up';
                leftButton.onclick = function () { window.location.href = '/signup'; };
                rightButton.textContent = 'Login';
                rightButton.onclick = function () { window.location.href = '/login'; };
            });
        });
    </script>
        </body>
        </html>
    `;

	return new Response(pageHtml, {
		headers: {
			'Content-Type': 'text/html'
		}
	});
}

async function generateChallengeHtml(challenge, username, env) {
	const userPosts = await fetchPostsForUserInTopic(username, challenge.id, env);
	let actionHtml;

	// Default action for users who have not yet accepted or whose last action has been abandoned
	actionHtml = `<form method="POST" action="/challenge/topic/${challenge.id}/accept-challenge">
        <button type="submit" class="btn btn-success">Accept Challenge</button>
    </form>`;

	// If there are user posts, evaluate the latest post's status
	if (userPosts.length > 0) {
		const userPost = userPosts[0]; // Assume the latest post is relevant

		if (userPost.status === 'active') {
			actionHtml = `
                <form action="/challenge/topic/${userPost.topic_id}/complete-challenge" method="POST" style="display:inline-block;">
                    <input type="hidden" name="post_id" value="${userPost.id}">
                    <button type="submit" class="btn btn-success">Complete</button>
                </form>
                <form action="/challenge/topic/${userPost.topic_id}/abandon-challenge" method="POST" style="display:inline-block;">
                    <input type="hidden" name="post_id" value="${userPost.id}">
                    <button type="submit" class="btn btn-danger">Abandon</button>
                </form>
            `;
		} else if (userPost.status === 'completed') {
			actionHtml = '<span>Completed</span>';
		}
	}

	return `<td><a href="/challenge/topic/${challenge.id}">${challenge.title}</a></td><td>${actionHtml}</td>`;
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

async function fetchPostsForUserInTopic(username, topicId, env) {
	const stmt = env.COOLFROG_CHALLENGES.prepare(`
        SELECT id, topic_id, username, title, status
        FROM posts
        WHERE username = ? AND topic_id = ?
        ORDER BY post_date DESC
    `);
	return (await stmt.bind(username, topicId).all()).results;
}

function getSessionCookie(request) {
	const cookieHeader = request.headers.get('Cookie');
	if (!cookieHeader) return null;
	const cookies = cookieHeader.split(';').map(cookie => cookie.trim().split('='));
	return Object.fromEntries(cookies)['session-id'];
}

function unauthorizedResponse() {
	return new Response("Unauthorized - Please log in.", {
		status: 403,
		headers: {
			'Content-Type': 'text/plain'
		}
	});
}