document.addEventListener('DOMContentLoaded', function() {
	// Function to fetch user data and update dashboard metrics
	function updateDashboard() {
		// Simulated data for demonstration
		const userData = {
			totalGoals: 5,
			averageRelaxationTime: 30,
			loginStreak: 10
			// Add more user metrics here if needed
		};

		// Update dashboard metrics with fetched data
		document.getElementById('totalGoals').textContent = userData.totalGoals;
		document.getElementById('averageRelaxationTime').textContent = userData.averageRelaxationTime + ' minutes';
		document.getElementById('loginStreak').textContent = userData.loginStreak + ' days';
		// Update more dashboard metrics as needed
	}

	// Function to add a new goal
	function addGoal(goal) {
		// Create a new list item for the goal
		const goalItem = document.createElement('li');
		goalItem.textContent = goal;

		// Append the goal to the goal list
		const goalList = document.getElementById('goalList');
		goalList.appendChild(goalItem);
	}

	// Event listener for submitting the goal form
	const goalForm = document.getElementById('goalForm');
	goalForm.addEventListener('submit', function(event) {
		event.preventDefault(); // Prevent form submission
		const goalInput = document.getElementById('goalInput');
		const goal = goalInput.value.trim(); // Get the goal from the input field
		if (goal !== '') {
			addGoal(goal); // Add the goal to the list
			goalInput.value = ''; // Clear the input field
		}
	});

	// Call the updateDashboard function when the page loads
	updateDashboard();
});