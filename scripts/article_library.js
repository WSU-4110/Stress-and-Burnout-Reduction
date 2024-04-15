document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const articles = document.querySelectorAll('.article');

    searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase();
        articles.forEach(article => {
            const title = article.querySelector('h2').textContent.toLowerCase();
            const summary = article.querySelector('p').textContent.toLowerCase();
            article.style.display = (title.includes(searchTerm) || summary.includes(searchTerm)) ? 'block' : 'none';
        });
    });

    document.querySelectorAll('.rating .star').forEach(star => {
        star.addEventListener('click', function() {
            if (!isAuthenticated()) {
                alert("Please log in to rate articles.");
                return;
            }
            const rating = this.dataset.value;
            const articleId = this.closest('.article').getAttribute('data-article-id');

            setArticleRating(articleId, rating);
        });
    });

    if (isAuthenticated()) {
        restoreRatings();
    }
});

function isAuthenticated() {
    return fetch('/api/username')
        .then(response => response.json())
        .then(data => !!data.username)
        .catch(error => {
            console.error("Error checking authentication status.", error);
            return false;
        });
}

async function setArticleRating(articleId, rating) {
    const response = await fetch('/api/articles', {
        method: 'POST',
        body: JSON.stringify({ articleId, rating }),
        headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
        updateRatingUI(document.querySelector(`[data-article-id="${articleId}"] .rating`), rating);
    } else {
        console.error('Failed to set article rating');
    }
}

async function restoreRatings() {
    const userId = await getCurrentUserId();
    document.querySelectorAll('.article').forEach(async article => {
        const articleId = article.getAttribute('data-article-id');
        const ratingResponse = await fetch(`/api/articles?articleId=${articleId}`);
        if (ratingResponse.ok) {
            const { rating } = await ratingResponse.json();
            if (rating) {
                updateRatingUI(article.querySelector('.rating'), parseInt(rating));
            }
        }
    });
}

function getCurrentUserId() {
    return fetch('/api/username')
        .then(response => response.json())
        .then(data => data.username || '')
        .catch(error => {
            console.error("Error fetching user ID.", error);
            return '';
        });
}

function updateRatingUI(ratingContainer, rating) {
    const stars = ratingContainer.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.classList[index < rating ? 'add' : 'remove']('rated');
    });
}