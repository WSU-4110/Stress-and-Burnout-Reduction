// Function for retreiving post data from regular forum KV worker
export async function getAllPosts({ env }) {
    const allKeys = await env.COOLFROG_FORUM.list();
    const allPosts = [];
  
    for (const key of allKeys.keys) {
      const post = await env.COOLFROG_FORUM.get(key.name, { type: 'json' });
      allPosts.push(post);
    }
  
    return allPosts;
  };