
// Listen for DOMContentLoaded event to ensure the document is fully loaded before executing the code
document.addEventListener('DOMContentLoaded', function () {
    // Get the search input element and all articles on the page
    const searchInput = document.getElementById('searchInput');
    const articles = document.querySelectorAll('.article');

    // Add an event listener to the search input to detect input changes
    searchInput.addEventListener('input', function () {
        // Convert the search term to lowercase for case-insensitive comparison
        const searchTerm = searchInput.value.toLowerCase();

        // Iterate over each article to check if its title or summary contains the search term
        articles.forEach(article => {
            // Get the title and summary of the current article, converted to lowercase
            const title = article.querySelector('h2').textContent.toLowerCase();
            const summary = article.querySelector('p').textContent.toLowerCase();
            
            // If the title or summary contains the search term, display the article; otherwise, hide it
            if (title.includes(searchTerm) || summary.includes(searchTerm)) {
                article.style.display = 'block';
            } else {
                article.style.display = 'none';
            }
        });
    });
});



// Function to check if the user is authenticated
function isAuthenticated() {
    return localStorage.getItem('userAuthenticated') === 'true';
}

// Function to get the current user's identifier (e.g., user ID)
function getCurrentUserId() {
    return localStorage.getItem('userId');
}

// Add event listeners to star elements for rating articles
document.querySelectorAll('.rating .star').forEach(star => {
    star.addEventListener('click', function() {
        const rating = this.dataset.value;
        const articleId = this.closest('.article').getAttribute('data-article-id'); // Assuming each article has a unique ID
        const ratingContainer = this.parentElement;

        if (isAuthenticated()) {
            const userId = getCurrentUserId();
            // Save rating locally (in localStorage) associated with the user and article ID
            localStorage.setItem(`user_${userId}_article_${articleId}_rating`, rating);
            // Update UI to reflect the rating (e.g., change star colors)
            updateRatingUI(ratingContainer, rating);
        } else {
            // Handle case where user is not authenticated
            alert('Please sign in to rate articles.');
            // Optionally, redirect the user to the sign-in page
            // window.location.href = '/sign-in';
        }
    });
});

// Function to update UI to reflect the rating
function updateRatingUI(ratingContainer, rating) {
    const stars = ratingContainer.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('rated');
        } else {
            star.classList.remove('rated');
        }
    });
}

// Restore ratings from localStorage when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (isAuthenticated()) {
        const userId = getCurrentUserId();
        document.querySelectorAll('.article').forEach(article => {
            const articleId = article.getAttribute('data-article-id');
            const ratingContainer = article.querySelector('.rating');
            const savedRating = localStorage.getItem(`user_${userId}_article_${articleId}_rating`);
            if (savedRating) {
                updateRatingUI(ratingContainer, parseInt(savedRating));
            }
        });
    }
});
