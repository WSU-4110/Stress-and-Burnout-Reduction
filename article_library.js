

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

