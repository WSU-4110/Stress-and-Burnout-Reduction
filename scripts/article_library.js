document.addEventListener('DOMContentLoaded', async function() {
    // Check if the user is logged in and show pop-up if not
    checkUserLoggedIn();

    // Set up search functionality
    const searchInput = document.getElementById('searchInput');
    const articles = document.querySelectorAll('.article');

    searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase();
        articles.forEach(article => {
            const title = article.querySelector('h2').textContent.toLowerCase();
            const summary = article.querySelector('p').textContent.toLowerCase();
            if (title.includes(searchTerm) || summary.includes(searchTerm)) {
                article.style.display = 'block';
            } else {
                article.style.display = 'none';
            }
        });
    });

    // Event listeners for rating stars
    document.querySelectorAll('.rating .star').forEach(star => {
        star.addEventListener('click', async function() {
            const rating = this.dataset.value;
            const articleId = this.closest('.article').getAttribute('data-article-id');
            const ratingContainer = this.parentElement;

            // Send rating to server
            const response = await fetch('/api/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId, rating })
            });

            if (response.ok) {
                updateRatingUI(ratingContainer, rating);
            } else {
                console.error('Failed to update rating');
            }
        });
    });

    // Restore ratings from server when the page loads
    document.querySelectorAll('.article').forEach(async article => {
        const articleId = article.getAttribute('data-article-id');
        const ratingContainer = article.querySelector('.rating');

        const response = await fetch(`/api/articles?articleId=${articleId}`);
        if (response.ok) {
            const { rating } = await response.json();
            if (rating) {
                updateRatingUI(ratingContainer, parseInt(rating));
            }
        }
    });
});

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

async function checkUserLoggedIn() {
    try {
        const response = await fetch('/api/username');
        const data = await response.json();
        if (!data.username) {
            alert("Please log in to rate articles and access your account.");
        }
    } catch (error) {
        console.error("Error checking login status:", error);
    }
}