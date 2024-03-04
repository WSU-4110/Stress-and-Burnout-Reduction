export async function onRequestPost({ request, env }) {

  // Functionality for login and signup
  const leftButton = document.getElementById('leftButton');
  const rightButton = document.getElementById('rightButton');

  fetch('/api/username')
      .then(response => response.json())
      .then(data => {
          if (data.username) {
              leftButton.textContent = 'Account';
              leftButton.onclick = function () { window.location.href = '/account'; };

              // Dynamically use the username in the 'Sign Out' button text
              rightButton.textContent = `Sign Out of ${data.username}`;
              rightButton.onclick = function () { window.location.href = '/signout'; };
          } else {
              leftButton.textContent = 'Sign Up';
              leftButton.onclick = function () { window.location.href = '/signup'; };
              rightButton.textContent = 'Login';
              rightButton.onclick = function () { window.location.href = '/login'; };
          }

          // Functionality for submitting a new post
          const postForm = document.getElementById('postForm');
          postForm.addEventListener('submit', function (event) {
              event.preventDefault(); // Prevent the default form submission

              const postTitle = document.getElementById('postTitle').value;
              const postContent = document.getElementById('postContent').value;

              // Convert post to JSON string for KV storage
              const post = JSON.stringify({
                  title: postTitle,
                  content: postContent,
                  // Add other relevant fields like author, timestamp, etc.
              });

              // Store the post directly in the KV namespace (not recommended)
              env.COOLFROG_FORUM.put(generateUniqueId(), post)
                  .then(() => {
                      // Success handling (e.g., display success message)
                  })
                  .catch(error => {
                      console.error("Error storing post:", error);
                      // Error handling (e.g., display error message)
                  });
          });

      })
      .catch(error => {
          console.error("Error fetching username:", error);
          leftButton.textContent = 'Sign Up';
          leftButton.onclick = function () { window.location.href = '/signup'; };
          rightButton.textContent = 'Login';
          rightButton.onclick = function () { window.location.href = '/login'; };
      });
  // Function to generate a unique identifier
  function generateUniqueId() {
    return Math.random().toString(36).substring(2, 10);
  }

  // Function to get all posts from server (already asynchronous)
  async function getAllPosts({env}) {
    // Retrieve all posts from KV
    const allKeys = await env.COOLFROG_FORUM.list();
    const allPosts = [];

    for (const key of allKeys.keys) {
        const post = await env.COOLFROG_FORUM.get(key.name, { type: 'json' });
        allPosts.push(post);
    }

    return allPosts;
  }
};