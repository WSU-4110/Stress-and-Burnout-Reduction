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

        // Display other user information (name, email, password)
        document.getElementById('name').textContent = user.name;
        document.getElementById('email').textContent = user.email;
        document.getElementById('password').textContent = user.password;
    }

    // Function to retrieve logged-in username from Local Storage
    function getLoggedInUsername() {
        return localStorage.getItem('loggedInUsername') || '';
    }
});

// Function to change username
function changeUsername() {
    const newUsername = prompt('Enter your new username:');
    
    // Validate the new username 
    if (newUsername) {
        // Update the displayed username
        document.getElementById('username').textContent = newUsername;

        // Update the username in Local Storage if needed
        updateUsernameInLocalStorage(newUsername);
    }
}

// Function to change name
function changeName() {
    const newName = prompt('Enter your new name:');

    // Validate the new name 
    if (newName) {
        // Update the displayed name
        document.getElementById('name').textContent = newName;

        // Update the name in Local Storage if needed
        updateNameInLocalStorage(newName);
    }
}

// Function to change email
function changeEmail() {
    const newEmail = prompt('Enter your new email:');

    // Validate the new email 
    if (newEmail) {
        // Update the displayed email
        document.getElementById('email').textContent = newEmail;

        // Update the email in Local Storage if needed
        updateEmailInLocalStorage(newEmail);
    }
}

// Function to change password
function changePassword() {
    const newPassword = prompt('Enter your new password:');

    // Validate the new password 
    if (newPassword) {
        // Update the displayed password 
        document.getElementById('password').textContent = newPassword;

        // Update the password in Local Storage if needed
        updatePasswordInLocalStorage(newPassword);
    }
}

// Functions to update data in Local Storage (you can customize these based on your storage structure)
function updateUsernameInLocalStorage(newUsername) {
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    const loggedInUsername = localStorage.getItem('loggedInUsername');

    // Update the username for the logged-in user in the local storage
    const updatedUsers = existingUsers.map(user => {
        if (user.username === loggedInUsername) {
            user.username = newUsername;
        }
        return user;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('loggedInUsername', newUsername);
}

// Function to update name in Local Storage
function updateNameInLocalStorage(newName) {
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    const loggedInUsername = localStorage.getItem('loggedInUsername');

    // Update the name for the logged-in user in the local storage
    const updatedUsers = existingUsers.map(user => {
        if (user.username === loggedInUsername) {
            user.name = newName;
        }
        return user;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));
}

// Function to update email in Local Storage
function updateEmailInLocalStorage(newEmail) {
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    const loggedInUsername = localStorage.getItem('loggedInUsername');

    // Update the email for the logged-in user in the local storage
    const updatedUsers = existingUsers.map(user => {
        if (user.username === loggedInUsername) {
            user.email = newEmail;
        }
        return user;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));
}

// Function to update password in Local Storage
function updatePasswordInLocalStorage(newPassword) {
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    const loggedInUsername = localStorage.getItem('loggedInUsername');

    // Update the password for the logged-in user in the local storage
    const updatedUsers = existingUsers.map(user => {
        if (user.username === loggedInUsername) {
            user.password = newPassword;
        }
        return user;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));
}