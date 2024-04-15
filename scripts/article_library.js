document.addEventListener('DOMContentLoaded', function() {
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

    if (isAuthenticated()) {
        const userId = getCurrentUserId();
        fetch(`/api/articles?user=${userId}`).then(response => response.json()).then(data => {
            document.querySelectorAll('.article').forEach(article => {
                const articleId = article.getAttribute('data-article-id');
                const ratingContainer = article.querySelector('.rating');
                if (data[articleId]) {
                    updateRatingUI(ratingContainer, parseInt(data[articleId]));
                }
            });
        }).catch(error => console.error(error));
    }

    document.querySelectorAll('.rating .star').forEach(star => {
        star.addEventListener('click', function() {
            if (!isAuthenticated()) {
                alert('Please log in to rate articles.');
                return;
            }

            const rating = this.dataset.value;
            const articleId = this.closest('.article').getAttribute('data-article-id');
            const ratingContainer = this.parentElement;
            const userId = getCurrentUserId();

            updateRatingUI(ratingContainer, rating);

            fetch('/api/articles', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    user: userId,
                    articleId: articleId,
                    rating: rating
                })
            }).then(response => response.json()).then(data => {
                console.log(data.status);  // Log status message
            }).catch(error => console.error("Failed to update rating:", error));
        });
    });
});

function isAuthenticated() {
    return localStorage.getItem('userAuthenticated') === 'true';
}

function getCurrentUserId() {
    return localStorage.getItem('userId');
}

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