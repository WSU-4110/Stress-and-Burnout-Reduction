// Wait for the DOM to be fully loaded before executing any JavaScript
document.addEventListener("DOMContentLoaded", function () {
    // Function to handle form submission for adding new goals
    function handleGoalFormSubmission(event) {
        event.preventDefault(); // Prevent the default form submission behavior

        // Get the input value from the form
        const newGoalInput = document.querySelector("#goals input[type='text']");
        const newGoalValue = newGoalInput.value.trim();

        // Check if the input value is not empty
        if (newGoalValue !== "") {
            // Create a new list item to display the new goal
            const newGoalListItem = document.createElement("li");
            newGoalListItem.textContent = newGoalValue;

            // Append the new list item to the goals list
            const goalsList = document.querySelector("#goals ul");
            goalsList.appendChild(newGoalListItem);

            // Clear the input field after adding the new goal
            newGoalInput.value = "";
        }
    }

    // Add event listener for form submission to add new goals
    const goalForm = document.querySelector("#goals form");
    goalForm.addEventListener("submit", handleGoalFormSubmission);
});
