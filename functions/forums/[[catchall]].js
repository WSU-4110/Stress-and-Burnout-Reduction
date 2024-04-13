export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const session = getSessionFromRequest(request);

    if (!session) {
      return unauthorizedResponse();
    }

    if (url.pathname === "/forums" && request.method === "GET") {
      return await renderForumsPage(session, env);
    } else if (url.pathname === "/forums/add-topic" && request.method === "POST") {
      return await addTopic(request, session, env);
    } else if (url.pathname.startsWith("/forums/delete-topic/") && request.method === "DELETE") {
      const topicId = url.pathname.split('/')[3];
      return await deleteTopic(topicId, session, env);
    } else {
      return new Response("Not Found", { status: 404 });
    }
  }
};

async function renderForumsPage(session, env) {
  let topics = await fetchTopics(env);
  
  const topicsHtml = topics.map(topic => `
    <tr>
      <td>${topic.title}</td>
      <td>${topic.username}</td>
      <td>${session.username === topic.username ? `<button class="btn btn-danger" onClick="deleteTopic('${topic.id}')">Delete</button>` : ''}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
      <title>Forum Topics</title>
    </head>
    <body>
      <div class="container mt-4">
        <h1>Forum Topics</h1>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Title</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>${topicsHtml}</tbody>
        </table>
        <form id="newTopicForm" class="mb-3">
          <div class="form-group">
            <label for="title">Topic Title:</label>
            <input type="text" id="title" class="form-control">
          </div>
          <button type="button" class="btn btn-primary" onclick="addTopic()">Add Topic</button>
        </form>
      </div>
      <script>
        async function addTopic() {
          const title = document.getElementById('title').value;
          await fetch('/forums/add-topic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({title})
          });
          window.location.reload();
        }

        async function deleteTopic(id) {
          await fetch('/forums/delete-topic/' + id, { method: 'DELETE' });
          window.location.reload();
        }
      </script>
    </body>
    </html>
  `;

  return new Response(html, { headers: {'Content-Type': 'text/html'} });
}

async function addTopic(request, session, env) {
  const { title } = await request.json();
  const stmt = env.FORUM_DB.prepare("INSERT INTO topics (title, username) VALUES (?, ?)");
  await stmt.bind(title, session.username).run();
  return new Response(null, { status: 303, headers: { 'Location': '/forums' } });
}

async function deleteTopic(topicId, session, env) {
  const topic = await getTopic(topicId, env);
  if (session.username !== topic.username) {
    return new Response("Unauthorized to delete this topic", { status: 403 });
  }

  const stmt = env.FORUM_DB.prepare("DELETE FROM topics WHERE id = ?");
  await stmt.bind(topicId).run();
  return new Response(null, { status: 204 });
}

async function fetchTopics(env) {
  const stmt = env.FORUM_DB.prepare("SELECT id, title, username FROM topics");
  return await stmt.all();
}

async function getTopic(topicId, env) {
  const stmt = env.FORUM_DB.prepare("SELECT id, title, username FROM topics WHERE id = ?");
  return await stmt.bind(topicId).get();
}

function getSessionFromRequest(request) {
  const cookie = request.headers.get("Cookie");
  return cookie ? JSON.parse(cookie.split('=')[1]) : null;
}

function unauthorizedResponse() {
  return new Response("Unauthorized", {status: 403, headers: {'Content-Type': 'text/plain'}});
}