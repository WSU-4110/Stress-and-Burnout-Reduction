
const { loadComments } = require('./MeditationSession'); // Ensure the correct path


/ Function to load comments from local storage
function loadComments() {
    const savedComments = localStorage.getItem('sessionComments');
    if (savedComments) {
        const comments = JSON.parse(savedComments);
        comments.forEach(comment => {
            addComment(comment);
        });
    }
}