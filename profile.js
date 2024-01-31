document.addEventListener('DOMContentLoaded', function () {
    function changeInfo(field) {
        const newValue = prompt(`Enter new ${field}:`);
        
        if (newValue !== null) {
            // Update the value in Local Storage and on the page
            updateProfile(field, newValue);
        }
    }

    function updateProfile(field, newValue) {
        // Retrieve existing user from Local Storage
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

        // Update the user's information
        currentUser[field] = newValue;

        // Store the updated user back in Local Storage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Update the value on the page
        document.getElementById(field).textContent = newValue;
    }

    // Optional: Add event listeners for each title if you want to change information on click
    document.querySelector('.profile-title[data-field="username"]').addEventListener('click', function () {
        changeInfo('username');
    });

    document.querySelector('.profile-title[data-field="name"]').addEventListener('click', function () {
        changeInfo('name');
    });

    document.querySelector('.profile-title[data-field="email"]').addEventListener('click', function () {
        changeInfo('email');
    });

    document.querySelector('.profile-title[data-field="password"]').addEventListener('click', function () {
        changeInfo('password');
    });
});
