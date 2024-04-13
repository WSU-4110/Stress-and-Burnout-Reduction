import { v4 as uuidv4 } from 'uuid';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname.split('/').filter(p => p);

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return unauthorizedResponse();
  }

  const sessionData = await env.COOLFROG_SESSIONS.get(sessionCookie);
  if (!sessionData) {
    return unauthorizedResponse();
  }
  const session = JSON.parse(sessionData);

  if (path[0] === 'forums' && path.length === 1) {
    // Render the main forums page
    return await renderForumsPage(session.username, env);
  } else if (path[0] === 'forums' && path.length === 2) {
    // Render a specific topic by its ID
    return await renderTopicPage(path[1], session.username, env);
  }

  return new Response("Resource Not Found", { status: 404 });
}

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return unauthorizedResponse();
  }

  const sessionData = await env.COOLFROG_SESSIONS.get(sessionCookie);
  if (!sessionData) {
    return unauthorizedResponse();
  }
  const session = JSON.parse(sessionData);

  const formData = await request.formData();
  const path = url.pathname.split('/').filter(p => p);

  if (path[0] === 'forums' && path.length === 2 && path[1] === 'add-topic') {
    const title = formData.get('title').trim();
    return addTopic(title, session.username, env);
  } else if (path[0] === 'forums' && path.length === 3 && path[1] === 'delete-topic') {
    const topicId = path[2];
    return deleteTopic(topicId, session.username, env);
  } else if (path[0] === 'forums' && path.length === 3 && path[1] === 'add-post') {
    const topicId = path[2];
    const title = formData.get('title').trim();
    const content = formData.get('content').trim();
    return addPost(topicId, title, content, session.username, env);
  } else if (path[0] === 'forums' && path.length === 3 && path[1] === 'delete-post') {
    const postId = path[2];
    return deletePost(postId, session.username, env);
  }

  return new Response("Not Found", { status: 404 });
}

async function renderForumsPage(username, env) {
  const topics = await fetchTopics(env);
  const topicsHtml = topics.map(topic => `
    <li>
      <a href="/forums/${topic.id}">${topic.title}</a>
      ${username === topic.username ? `<form action="/forums/delete-topic/${topic.id}" method="post"><button type="submit">Delete</button></form>` : ''}
    </li>
  `).join('');

  return new Response(`
    <html>
      <body>
        <h1>Forum Topics</h1>
        <ul>${topicsHtml}</ul>
        <form action="/forums/add-topic" method="post">
          <input type="text" name="title" placeholder="New Topic Title">
          <button type="submit">Add Topic</button>
        </form>
      </body>
    </html>
  `, { headers: {'Content-Type': 'text/html'} });
}

async function renderTopicPage(topicId, username, env) {
  const topic = await fetchTopic(topicId, env);
  const posts = await fetchPosts(topicId, env);
  const postsHtml = posts.map(post => `
    <div>
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      ${username === post.username ? `<button onclick="deletePost('${post.id}')">Delete</button>` : ''}
    </div>
  `).join('');

  return new Response(`
    <html>
      <body>
        <h1>${topic.title}</h1>
        ${postsHtml}
        <form action="/forums/${topicId}/add-post" method="post">
          <input type="text" name="title" placeholder="Post Title">
          <textarea name="content"></textarea>
          <button type="submit">Add Post</button>
        </form>
        <a href="/forums">Back to Topics</a>
      </body>
    </html>
  `, { headers: {'Content-Type': 'text/html'} });
}

async function addTopic(title, username, env) {
  const topicId = uuidv4();
  await env.TOPICS.put(topicId, JSON.stringify({ id: topicId, title, username }));
  return Response.redirect('/forums');
}

async function deleteTopic(topicId, username, env) {
  await env.TOPICS.delete(topicId);
  // Also delete all associated posts
  const posts = await fetchPosts(topicId, env);
  posts.forEach(async post => {
    await env.POSTS.delete(post.id);
  });
  return Response.redirect('/forums');
}

async function addPost(topicId, title, content, username, env) {
  const postId = uuidv4();
  await env.POSTS.put(postId, JSON.stringify({ id: postId, title, content, username, topicId }));
  return Response.redirect(`/forums/${topicId}`);
}

async function deletePost(postId, username, env) {
  await env.POSTS.delete(postId);
  return Response.redirect(`/forums/${topicId}`);
}

async function fetchTopics(env) {
  const topics = [];
  await env.TOPICS.list().keys.forEach(key => {
    topics.push(JSON.parse(env.TOPICS.get(key.name)));
  });
  return topics;
}

async function fetchTopic(topicId, env) {
  return JSON.parse(await env.TOPICS.get(topicId));
}

async function fetchPosts(topicId, env) {
  const posts = [];
  await env.POSTS.list().keys.forEach(key => {
    const post = JSON.parse(env.POSTS.get(key.name));
    if (post.topicId === topicId) {
      posts.push(post);
    }
  });
  return posts;
}

function getSessionCookie(request) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) {
    return null;
  }
  const cookies = cookieHeader.split('; ').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=');
    acc[key] = value;
    return acc;
  }, {});
  return cookies['session-id'];
}

function unauthorizedResponse() {
  return new Response('Unauthorized', { status: 401 });
}