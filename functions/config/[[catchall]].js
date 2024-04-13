import { v4 as uuidv4 } from 'uuid';

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const sessionCookie = getSessionCookie(request);
    let session;

    if (!sessionCookie || !(session = JSON.parse(await env.COOLFROG_SESSIONS.get(sessionCookie)))) {
        return unauthorizedResponse();
    }
    
    if (url.pathname === '/config') {
        return renderConfigPage(session.username, env);
    } else if (url.pathname === '/config/profile') {
        return renderProfilePage(session.username, env);
    } else if (url.pathname === '/config/emails') {
        return renderEmailsPage(session.username, env);
    } else if (url.pathname === '/config/sessions') {
        return renderSessionsPage(session.username, env);
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

    if (url.pathname === "/config/update-profile") {
        const pronouns = formData.get('pronouns').trim();
        const givenNames = formData.get('given_names').trim();
        const lastName = formData.get('last_name').trim();

        if (!givenNames || !lastName) {
            return new Response("Both Given Names and Last Name are required.", { status: 400 });
        }

        return updateProfile(pronouns, givenNames, lastName, session.username, env);
    } else if (url.pathname.startsWith("/config/add-email")) {
        const email = formData.get('email').trim();
        if (await env.COOLFROG_EMAILS.get(email)) {
            return new Response("This email is already in use.", { status: 400 });
        }
        return addEmail(email, session.username, env);
    } else if (url.pathname.startsWith("/config/remove-email/")) {
        const email = url.pathname.split('/')[3];
        return removeEmail(email, session.username, env);
    } else if (url.pathname === "/config/remove-session") {
        const sessionId = formData.get('session_id');
        return removeSession(sessionId, session.username, env);
    } else if (url.pathname === "/config/remove-all-sessions") {
        return removeAllSessions(session.username, env);
    }

    return new Response("Bad Request", { status: 400 });
}

async function renderConfigPage(username, env) {
    const pageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
            <title>Configuration Panel</title>
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
            <div class="container mt-5">
                <h1>Configuration Panel</h1>
                <div class="list-group">
                    <a href="/config/profile" class="list-group-item list-group-item-action">Update My Profile</a>
                    <a href="/config/emails" class="list-group-item list-group-item-action">Update My Emails</a>
                    <a href="/config/sessions" class="list-group-item list-group-item-action">Manage My Sessions</a>
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

    return new Response(pageHtml, { headers: {'Content-Type': 'text/html'} });
}

async function renderProfilePage(username, env) {
    let user = JSON.parse(await env.COOLFROG_USERS.get(username));

    const pageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
            <title>Update Profile</title>
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
            <div class="container mt-5">
                <h1>Update Profile</h1>
                <form method="post" action="/config/update-profile">
                    <div class="mb-3">
                        <label for="pronouns" class="form-label">Pronouns</label>
                        <input type="text" class="form-control" id="pronouns" name="pronouns" value="${user.pronouns}">
                    </div>
                    <div class="mb-3">
                        <label for="given_names" class="form-label">Given Names</label>
                        <input type="text" class="form-control" id="given_names" name="given_names" value="${user.given_names}" required>
                    </div>
                    <div class="mb-3">
                        <label for="last_name" class="form-label">Last Name</label>
                        <input type="text" class="form-control" id="last_name" name="last_name" value="${user.last_name}" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Update</button>
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

async function renderEmailsPage(username, env) {
    let user = JSON.parse(await env.COOLFROG_USERS.get(username));

    const emailsHtml = user.emails.map(email => `
        <tr>
            <td>${email.email}</td>
            <td>${email.verified ? 'Verified' : 'Not Verified'}</td>
            <td>
                <form action="/config/remove-email/${email.email}" method="post">
                    <button type="submit" class="btn btn-danger" ${user.emails.length <= 1 ? "disabled" : ""}>Remove</button>
                </form>
            </td>
        </tr>
    `).join('');

    const pageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
            <title>Update Emails</title>
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
            <div class="container mt-5">
                <h1>Update Emails</h1>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>${emailsHtml}</tbody>
                </table>
                <form method="post" action="/config/add-email">
                    <div class="mb-3">
                        <label for="email" class="form-label">New Email</label>
                        <input type="email" class="form-control" id="email" name="email" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Add Email</button>
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

async function renderSessionsPage(username, env) {
    let user = JSON.parse(await env.COOLFROG_USERS.get(username));

    const sessionsHtml = user.sessions.map(session => `
        <tr>
            <td>${session.sessionId}</td>
            <td>${new Date(session.time_session_creation * 1000).toLocaleString()}</td>
            <td>
                <form action="/config/remove-session" method="post">
                    <input type="hidden" name="session_id" value="${session.sessionId}">
                    <button type="submit" class="btn btn-danger">Remove</button>
                </form>
            </td>
        </tr>
    `).join('');

    const pageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
            <title>Manage Sessions</title>
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
            <div class="container mt-5">
                <h1>Manage Sessions</h1>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Session ID</th>
                            <th>Creation Time</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>${sessionsHtml}</tbody>
                </table>
                <form method="post" action="/config/remove-all-sessions">
                    <button type="submit" class="btn btn-danger">Remove All Sessions</button>
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

async function updateProfile(pronouns, givenNames, lastName, username, env) {
    let user = JSON.parse(await env.COOLFROG_USERS.get(username));
    user.pronouns = pronouns;
    user.given_names = givenNames;
    user.last_name = lastName;
    await env.COOLFROG_USERS.put(username, JSON.stringify(user));
    return new Response(null, { status: 303, headers: { 'Location': '/config/profile' } });
}

async function addEmail(email, username, env) {
    let user = JSON.parse(await env.COOLFROG_USERS.get(username));
    user.emails.push({ email: email, verified: false });
    await env.COOLFROG_USERS.put(username, JSON.stringify(user));
    await env.COOLFROG_EMAILS.put(email, username);
    return new Response(null, { status: 303, headers: { 'Location': '/config/emails' } });
}

async function removeEmail(email, username, env) {
     let user = JSON.parse(await env.COOLFROG_USERS.get(username));
    if (user.emails.length <= 1) {
        return new Response("Cannot remove the last email. At least one email must be associated with the account.", { status: 400 });
    }
    user.emails = user.emails.filter(e => e.email !== email);
    await env.COOLFROG_USERS.put(username, JSON.stringify(user));
    await env.COOLFROG_EMAILS.delete(email);
    return new Response(null, { status: 303, headers: { 'Location': '/config/emails' } });
}

async function removeSession(sessionId, username, env) {
    let user = JSON.parse(await env.COOLFROG_USERS.get(username));
    user.sessions = user.sessions.filter(s => s.sessionId !== sessionId);
    await env.COOLFROG_USERS.put(username, JSON.stringify(user));
    await env.COOLFROG_SESSIONS.delete(sessionId);
    return new Response(null, { status: 303, headers: { 'Location': '/config/sessions' } });
}

async function removeAllSessions(username, env) {
    let user = JSON.parse(await env.COOLFROG_USERS.get(username));
    for (let session of user.sessions) {
        await env.COOLFROG_SESSIONS.delete(session.sessionId);
    }
    user.sessions = [];
    await env.COOLFROG_USERS.put(username, JSON.stringify(user));
    return new Response(null, { status: 303, headers: { 'Location': '/config/sessions' } });
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