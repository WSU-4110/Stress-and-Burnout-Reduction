document.addEventListener('DOMContentLoaded', function() {
	const header = document.querySelector('.fixed-header');
	const postFormContainer = document.querySelector('.post-form-container');

	// Function to add or remove the 'fixed' class based on scroll position
	function toggleFixedHeader() {
		if (window.scrollY > header.offsetTop) {
			header.classList.add('fixed');
		} else {
			header.classList.remove('fixed');
		}
	}

	// Function to toggle visibility of post form based on user login status
	function togglePostFormVisibility(isUserLoggedIn) {
		postFormContainer.style.display = isUserLoggedIn ? 'block' : 'none';
	}

	// Listen for the scroll event and call the toggleFixedHeader function
	window.addEventListener('scroll', toggleFixedHeader);

	// Fetch user login status and toggle post form visibility
	fetch('/api/username')
		.then(response => response.json())
		.then(data => {
			if (data.username) {
				togglePostFormVisibility(true);

				const leftButton = document.getElementById('leftButton');
				const rightButton = document.getElementById('rightButton');
				leftButton.textContent = 'Account';
				leftButton.onclick = function() {
					window.location.href = '/account';
				};
				rightButton.textContent = `Sign Out of ${data.username}`;
				rightButton.onclick = function() {
					window.location.href = '/signout';
				};
			} else {
				togglePostFormVisibility(false);

				const leftButton = document.getElementById('leftButton');
				const rightButton = document.getElementById('rightButton');
				leftButton.textContent = 'Sign Up';
				leftButton.onclick = function() {
					window.location.href = '/signup';
				};
				rightButton.textContent = 'Login';
				rightButton.onclick = function() {
					window.location.href = '/login';
				};
			}
		})
		.catch(error => {
			console.error("Error fetching username:", error);
			togglePostFormVisibility(false);

			const leftButton = document.getElementById('leftButton');
			const rightButton = document.getElementById('rightButton');
			leftButton.textContent = 'Sign Up';
			leftButton.onclick = function() {
				window.location.href = '/signup';
			};
			rightButton.textContent = 'Login';
			rightButton.onclick = function() {
				window.location.href = '/login';
			};
		});
});

// Functionality for login and signup
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');

fetch('/api/username')
	.then(response => response.json())
	.then(data => {
		if (data.username) {
			leftButton.textContent = 'Account';
			leftButton.onclick = function() {
				window.location.href = '/account';
			};

			// Dynamically use the username in the 'Sign Out' button text
			rightButton.textContent = `Sign Out of ${data.username}`;
			rightButton.onclick = function() {
				window.location.href = '/signout';
			};
		} else {
			leftButton.textContent = 'Sign Up';
			leftButton.onclick = function() {
				window.location.href = '/signup';
			};
			rightButton.textContent = 'Login';
			rightButton.onclick = function() {
				window.location.href = '/login';
			};
		}
	})
	.catch(error => {
		console.error("Error fetching username:", error);
		leftButton.textContent = 'Sign Up';
		leftButton.onclick = function() {
			window.location.href = '/signup';
		};
		rightButton.textContent = 'Login';
		rightButton.onclick = function() {
			window.location.href = '/login';
		};
	});