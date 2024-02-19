import { v4 as uuidv4 } from 'uuid';
import { pbkdf2Sync } from 'node:crypto';

// Simple CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Adjust this to restrict the origin as necessary
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// Options handler for preflight requests
function handleOptions(request) {
    if (request.headers.get("Origin") !== null &&
        request.headers.get("Access-Control-Request-Method") !== null &&
        request.headers.get("Access-Control-Request-Headers") !== null) {
        // Handle CORS pre-flight request.
        return new Response(null, {
            headers: corsHeaders
        });
    } else {
        // Handle standard OPTIONS request.
        return new Response(null, {
            headers: {
                "Allow": "POST, OPTIONS",
            }
        });
    }
}

export async function onRequestPost({ request, env }) {
  if (request.method === "OPTIONS") {
    return handleOptions(request);
  }
  
  try {
    const formData = await request.formData();
    const username = formData.get('username').trim().toLowerCase();
    const rawPassword = formData.get('password');

    // Check if username is already taken
    const existingUser = await env.COOLFROG_USERS.get(username);
    if (existingUser) {
      return new Response("Username already exists", { status: 400, headers: corsHeaders });
    }

    // User data handling
    const currentTime = Math.floor(Date.now() / 1000);
    const salt = uuidv4(); // Using UUID as salt
    const hashedPassword = pbkdf2Sync(rawPassword, salt, 1000, 64, 'sha256').toString('hex');
    
    // Building user object
    const user = {
      uid: uuidv4(),
      username: username,
      pronouns: formData.get('pronouns').trim(),
      given_names: formData.get('given_names').trim(),
      last_name: formData.get('last_name').trim(),
      emails: [{
        email: formData.get('email').trim(),
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

    // Store the data in KV
    await env.COOLFROG_USERS.put(username, JSON.stringify(user));

    // Respond to the client
    return new Response("User created successfully", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Signup error:", error);
    return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}