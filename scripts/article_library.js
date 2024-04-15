document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to star elements for rating articles
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

    // Restore ratings from server when the page is loaded
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