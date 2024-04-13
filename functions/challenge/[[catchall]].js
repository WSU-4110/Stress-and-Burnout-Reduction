import { v4 as uuidv4 } from 'uuid';

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const sessionCookie = getSessionCookie(request);
    let session;

    if (!sessionCookie || !(session = JSON.parse(await env.COOLFROG_SESSIONS.get(sessionCookie)))) {
        return unauthorizedResponse();
    }
    
    if (url.pathname === '/challenge') {
        return renderChallengesPage(session.username, env);
    } else if (url.pathname.startsWith('/challenge/topic/')) {
        const topicId = url.pathname.split('/')[3];
        return renderChallengeTopicPage(topicId, session.username, env);
    }

    return new Response("Resource Not Found", { status: 404 });
}

export async function onRequestPost({ request, env }) {
    const url = new URL(request.url);
    const formData = await request.formData();
    const sessionCookie = getSessionCookie(request);
    let session;

    if (!sessionCookie || !(session = JSON.parse(await env.COOLFROG_SESSIONS.get(sessionCookie)))) {
        return unauthorizedResponse();
    }

    if (url.pathname === "/challenge/add-topic") {
        const title = formData.get('title').trim();
        return addTopic(title, session.username, env);
    } else if (url.pathname.startsWith("/challenge/delete-topic/")) {
        const topicId = url.pathname.split('/')[3];
        return deleteTopic(topicId, session.username, env);
    } else if (url.pathname.startsWith("/challenge/topic/") && url.pathname.endsWith('/accept-challenge')) {
        const topicId = url.pathname.split('/')[3];
        return acceptChallenge(topicId, session.username, env);
    } else if (url.pathname.startsWith("/challenge/topic/") && (url.pathname.endsWith('/complete-challenge') || url.pathname.endsWith('/abandon-challenge'))) {
        const postId = formData.get('post_id');
        const newStatus = url.pathname.endsWith('/complete-challenge') ? 'completed' : 'abandoned';
        return updateChallengeStatus(postId, newStatus, session.username, env);
    }

    return new Response("Bad Request", { status: 400 });
}

async function renderChallengesPage(username, env) {
    let topics = await fetchTopics(env);
    let userPosts = await fetchPostsForUser(username, env);

let activeTasksHtml = userPosts.filter(post => post.status === 'active').map(post => `
    <tr>
        <td style="width: 70%;"><a href="/challenge/topic/${post.topic_id}">${post.topic_title}</a></td>
        <td style="width: 30%;">
            <form action="/challenge/topic/${post.topic_id}/complete-challenge" method="post" style="display: inline-block; margin-right: 10px;">
                <input type="hidden" name="post_id" value="${post.id}">
                <button type="submit" class="btn btn-success btn-sm">Complete Challenge</button>
            </form>
            <form action="/challenge/topic/${post.topic_id}/abandon-challenge" method="post" style="display: inline-block;">
                <input type="hidden" name="post_id" value="${post.id}">
                <button type="submit" class="btn btn-danger btn-sm">Abandon Challenge</button>
            </form>
        </td>
    </tr>
`).join('');

let completedTasksHtml = userPosts.filter(post => post.status === 'completed').map(post => `
    <tr>
        <td style="width: 70%;"><a href="/challenge/topic/${post.topic_id}">${post.topic_title}</a></td>
        <td style="width: 30%;">Completed</td>
    </tr>
`).join('');


    const topicsHtml = topics.map(topic => `
        <tr>
            <td style="width: 70%;"><a href="/challenge/topic/${topic.id}">${topic.title}</a></td>
            <td style="width: 20%;">${topic.username}</td>
            <td style="width: 10%;">
                ${username === topic.username ? `<form action="/challenge/delete-topic/${topic.id}" method="post"><button type="submit" class="btn btn-danger">Delete</button></form>` : ''}
            </td>
        </tr>`
    ).join('');

    const pageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
            <title>Challenge Page</title>
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
            <a class="navbar-brand" href="/index.html">
                <img src="/coolfrog.png" alt="logo">
            </a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" 
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item"><a class="nav-link" href="/index.html">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="/forums">Forums</a></li>
                    <li class="nav-item"><a class="nav-link" href="/meetup.html">Meetup Forum</a></li>
                    <li class="nav-item"><a class="nav-link" href="/videopage.html">Video Library</a></li>
                    <li class="nav-item"><a class="nav-link" href="/article_library.html">Article Library</a></li>
                    <li class="nav-item"><a class="nav-link" href="/DailyInteractive/dailyInteractive.html">Daily Interactive</a></li>
                    <li class="nav-item"><a class="nav-link" href="/relaxation-sounds.html">Relaxation Sounds Library</a></li>
                    <li class="nav-item"><a class="nav-link" href="/MeditationSession.html">Meditation Sessions</a></li>
                    <li class="nav-item"><a class="nav-link" href="/timersPage.html">Timers</a></li>
                    <li class="nav-item"><a class="nav-link" href="/WellnessChallenges.html">Wellness Challenges</a></li>
                    <li class="nav-item"><a class="nav-link" href="/dashboard.html">Progress Dashboard</a></li>
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
            <div class="container mt-4">
                <h1>Challenge Topics</h1>
                <h2>Your Active Tasks</h2>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${activeTasksHtml}</tbody>
                </table>
                <h2>Your Completed Tasks</h2>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>${completedTasksHtml}</tbody>
                </table>
                <h2>All Topics</h2>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>${topicsHtml}</tbody>
                </table>
                <form method="post" action="/challenge/add-topic">
                    <input type="text" name="title" placeholder="Enter topic title" class="form-control mb-2" required>
                    <button type="submit" class="btn btn-primary">Add Topic</button>
                </form>
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
  
    return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
}

async function renderChallengeTopicPage(topicId, username, env) {
    let topic = (await fetchTopicById(topicId, env))[0];
    let posts = await fetchPostsForTopic(topicId, env);
    let userPost = posts.find(p => p.username === username);

    const postsHtml = posts.map(post => `
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>@${post.username} - ${post.status} - ${post.title}</span>
                ${(username === post.username && post.status === 'active') ? `
                <div>
                    <form action="/challenge/topic/${topicId}/complete-challenge" method="post" class="d-inline mb-0">
                        <input type="hidden" name="post_id" value="${post.id}">
                        <button type="submit" class="btn btn-success btn-sm">Complete Challenge</button>
                    </form>
                    <form action="/challenge/topic/${topicId}/abandon-challenge" method="post" class="d-inline mb-0">
                        <input type="hidden" name="post_id" value="${post.id}">
                        <button type="submit" class="btn btn-danger btn-sm">Abandon Challenge</button>
                    </form>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');

    const actionButton = (!userPost || userPost.status === 'abandoned') ? 
        `<form method="post" action="/challenge/topic/${topicId}/accept-challenge">
            <button type="submit" class="btn btn-success">Accept the Challenge</button>
        </form>` : '';

    const pageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
            <title>Challenges in ${topic.title}</title>
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
            <a class="navbar-brand" href="/index.html">
                <img src="/coolfrog.png" alt="logo">
            </a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" 
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item"><a class="nav-link" href="/index.html">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="/forums">Forums</a></li>
                    <li class="nav-item"><a class="nav-link" href="/meetup.html">Meetup Forum</a></li>
                    <li class="nav-item"><a class="nav-link" href="/videopage.html">Video Library</a></li>
                    <li class="nav-item"><a class="nav-link" href="/article_library.html">Article Library</a></li>
                    <li class="nav-item"><a class="nav-link" href="/DailyInteractive/dailyInteractive.html">Daily Interactive</a></li>
                    <li class="nav-item"><a class="nav-link" href="/relaxation-sounds.html">Relaxation Sounds Library</a></li>
                    <li class="nav-item"><a class="nav-link" href="/MeditationSession.html">Meditation Sessions</a></li>
                    <li class="nav-item"><a class="nav-link" href="/timersPage.html">Timers</a></li>
                    <li class="nav-item"><a class="nav-link" href="/WellnessChallenges.html">Wellness Challenges</a></li>
                    <li class="nav-item"><a class="nav-link" href="/dashboard.html">Progress Dashboard</a></li>
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
            <div class="container mt-5">
                <h1>${topic.title}</h1>
                <a href="/challenge" class="btn btn-primary mb-3">Back to Topics</a>
                ${postsHtml}
                ${actionButton}
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

    return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
}

async function addTopic(title, username, env) {
    const stmt = env.COOLFROG_CHALLENGES.prepare("INSERT INTO topics (id, title, username) VALUES (?, ?, ?)");
    await stmt.bind(uuidv4(), title, username).run();
    return new Response(null, { status: 303, headers: { 'Location': '/challenge' } });
}

async function deleteTopic(topicId, username, env) {
    const stmt = env.COOLFROG_CHALLENGES.prepare("DELETE FROM topics WHERE id = ? AND username = ?");
    await stmt.bind(topicId, username).run();
    return new Response(null, { status: 204 });
}

async function acceptChallenge(topicId, username, env) {
    const stmt = env.COOLFROG_CHALLENGES.prepare("INSERT INTO posts (id, topic_id, username, title, status, post_date) VALUES (?, ?, ?, ?, ?, ?)");
    const now = new Date().toISOString();
    const title = `${username} has accepted the challenge`;
    await stmt.bind(uuidv4(), topicId, username, title, 'active', now).run();
    return new Response(null, { status: 303, headers: { 'Location': `/challenge/topic/${topicId}` } });
}

async function updateChallengeStatus(postId, newStatus, username, env) {
    const updateStmt = env.COOLFROG_CHALLENGES.prepare("UPDATE posts SET title = ?, status = ?, post_date = ? WHERE id = ? AND username = ?");
    const now = new Date().toISOString();
    const title = `${username} has ${newStatus} the challenge`;
    await updateStmt.bind(title, newStatus, now, postId, username).run();
    return new Response(null, { status: 204 });
}

async function fetchTopics(env) {
    const stmt = env.COOLFROG_CHALLENGES.prepare("SELECT id, title, username FROM topics ORDER BY title");
    return (await stmt.all()).results;
}

async function fetchTopicById(topicId, env) {
    const stmt = env.COOLFROG_CHALLENGES.prepare("SELECT id, title, username FROM topics WHERE id = ?");
    return (await stmt.bind(topicId).all()).results;
}

async function fetchPostsForTopic(topicId, env) {
    const stmt = env.COOLFROG_CHALLENGES.prepare("SELECT id, topic_id, username, title, status, post_date FROM posts WHERE topic_id = ? ORDER BY post_date DESC");
    return (await stmt.bind(topicId).all()).results;
}

async function fetchPostsForUser(username, env) {
    const stmt = env.COOLFROG_CHALLENGES.prepare(`
        SELECT p.id, p.topic_id, p.title as post_title, t.title as topic_title, p.status 
        FROM posts p 
        INNER JOIN topics t ON p.topic_id = t.id 
        WHERE p.username = ? 
        ORDER BY p.post_date DESC
    `);
    return (await stmt.bind(username).all()).results;
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