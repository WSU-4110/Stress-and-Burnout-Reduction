import {
	v4 as uuidv4
} from 'uuid';

export async function onRequestGet({
	request,
	env
}) {
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

export function getSessionCookie(request) {
	const cookieHeader = request.headers.get('Cookie');
	if (!cookieHeader) return null;
	const cookies = cookieHeader.split(';').map(cookie => cookie.trim().split('='));
	return Object.fromEntries(cookies)['session-id'];
}

export function unauthorizedResponse() {
	return new Response("Unauthorized - Please log in.", {
		status: 403,
		headers: {
			'Content-Type': 'text/plain'
		}
	});
}