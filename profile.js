document.addEventListener('DOMContentLoaded', function () {
    // Call the function to load and display the user profile
    loadUserProfile();

    // Function to load and display the user profile
    function loadUserProfile() {
        // Retrieve logged-in username from Local Storage
        const loggedInUsername = getLoggedInUsername();

        // If a username is found, load the corresponding user profile
        if (loggedInUsername) {
            // Retrieve existing users from Local Storage
            const existingUsers = JSON.parse(localStorage.getItem('users')) || [];

            // Find the user with the logged-in username
            const loggedInUser = existingUsers.find(user => user.username === loggedInUsername);

            if (loggedInUser) {
                // Display user information on the page
                displayUserProfile(loggedInUser);
            }
        }
    }

    // Function to display user information on the page
    function displayUserProfile(user) {
        // Display the username
        document.getElementById('username').textContent = user.username;

        // Display other user information (name, email, password) as needed
        document.getElementById('name').textContent = user.name;
        document.getElementById('email').textContent = user.email;
        document.getElementById('password').textContent = user.password;
    }

    // Function to retrieve logged-in username from Local Storage
    function getLoggedInUsername() {
        return localStorage.getItem('loggedInUsername') || '';
    }

    // Function to change username
    function changeUsername() {
        // Get user input for new username
        
    }

    // Function to change name
    function changeName() {
        
    }

    // Function to change email
    function changeEmail() {
        
    }

    // Function to change password
    function changePassword() {
        
    }
});
