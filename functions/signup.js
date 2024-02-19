import { v4 as uuidv4 } from 'uuid';
import { pbkdf2Sync } from 'node:crypto';

export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();
    const username = formData.get('username').trim().toLowerCase();
    const email = formData.get('email').trim();
    const rawPassword = formData.get('password');

    // Checking if the user or email already exists
    const existingUser = await env.COOLFROG_USERS.get(username);
    const existingEmail = await env.COOLFROG_EMAILS.get(email);
    if (existingUser || existingEmail) {
      const retryResponseHTML = `
        <html>
          <head>
            <title>Username or Email Exists</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
            <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
          </head>
          <body>
            <div class="container text-center p-5">
              <h2>Username or Email already exists</h2>
              <p>Please wait, you'll be able to retry in a few seconds.</p>
              <button id="retryButton" class="btn btn-primary mt-3" disabled>Retry</button>
              <script>
                setTimeout(function() {
                  document.getElementById('retryButton').disabled = false;
                  document.getElementById('retryButton').innerText = 'Retry Now';
                  document.getElementById('retryButton').onclick = function() {
                    window.location.href = '/signup';
                  };
                }, 5000);
              </script>
            </div>
          </body>
        </html>`;
      return new Response(retryResponseHTML, { status: 400, headers: { "Content-Type": "text/html" }});
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    const salt = uuidv4();
    const hashedPassword = pbkdf2Sync(rawPassword, salt, 1000, 64, 'sha256').toString('hex');
    const user = {
      uid: uuidv4(),
      username: username,
      pronouns: formData.get('pronouns').trim(),
      given_names: formData.get('given_names').trim(),
      last_name: formData.get('last_name').trim(),
      emails: [{
        email: email,
        verified: false,
      }],
      sessions: null,
      password: hashedPassword,
      salt: salt,
      profile_picture_url: null,
      role: "User",
      time_creation: currentTime,
      time_last_sign_in: null,
      time_recovery_sent: null,
      time_password_set: currentTime,
      time_marked_for_deletion: null,
    };

    // Put operations for the user in COOLFROG_USERS and email in COOLFROG_EMAILS namespace
    await env.COOLFROG_USERS.put(username, JSON.stringify(user));
    await env.COOLFROG_EMAILS.put(email, username);

    const successResponseHTML = `
      <html>
        <head>
          <title>Account Created</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
          <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
        </head>
        <body>
          <div class="container text-center p-5">
            <h2>Account Created Successfully!</h2>
            <button class="btn btn-success mt-3" onclick="window.location.href='/login'">Go to Login</button>
          </div>
        </body>
      </html>`;
    return new Response(successResponseHTML, { status: 200, headers: { "Content-Type": "text/html" }});
  } catch (error) {
    console.error("Signup error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}