// login.js

document.addEventListener('DOMContentLoaded', function () {
    // Call the checkLoginStatus function when the page loads
    checkLoginStatus();
});

// Variables to track login status and username
let isLoggedIn = false;
let username = '';

// Function to check login status when the page loads
function checkLoginStatus() {
    // Retrieve login status and username from local storage
    isLoggedIn = getLoginStatus();
    username = getLoggedInUsername();

    // Check if the user is logged in and update the page accordingly
    if (isLoggedIn) {
        // User is logged in, update the page for a logged-in user
        updateLoginButton();
    }Om
}

// Function to handle user login/logout
function toggleLogin() {
    if (isLoggedIn) {
        // User is logged in, log them out
        isLoggedIn = false;
        username = '';
        updateLoginButton();
        clearLoginStatus();
    } else {
        // User is not logged in, show login form
        const userInput = prompt('Enter your username:');
        if (userInput) {
            const passwordInput = prompt('Enter your password:');

            // Validate username and password
            if (validateCredentials(userInput, passwordInput)) {
                isLoggedIn = true;
                username = userInput;
                updateLoginButton();
                saveLoginStatus();
            } else {
                alert('Invalid username or password. Please try again.');
            }
        }
    }
}

// Function to validate user credentials
function validateCredentials(inputUsername, inputPassword) {
    // Retrieve existing users from local storage
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];

    // Check if the input credentials match any existing user
    const matchingUser = existingUsers.find(user => user.username === inputUsername && user.password === inputPassword);

    return !!matchingUser;
}

// Function to update the login button text based on login status
function updateLoginButton() {
    const loginButton = document.getElementById('loginButton');
    if (isLoggedIn) {
        loginButton.textContent = `Logout - Logged in as ${username}`;
    } else {
        loginButton.textContent = 'Login';
    }
}

// Function to save login status to local storage
function saveLoginStatus() {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedInUsername', username);
}

// Function to clear login status from local storage
function clearLoginStatus() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUsername');
}

// Function to retrieve login status from local storage
function getLoginStatus() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Function to retrieve logged-in username from local storage
function getLoggedInUsername() {
    return localStorage.getItem('loggedInUsername') || '';
}

// Function to update page content for a logged-in user
function updatePageForLoggedInUser() {
    
}
