const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const bookmarkButton = document.getElementById('bookmark');
const unbookmarkButton = document.getElementById('unbookmark');
const themeSwitcher = document.getElementById('themeSwitcher');
const bookmarksContainer = document.getElementById('bookmarks');
const bookmarkList = document.getElementById('bookmark-list');
const sessionLinks = document.querySelectorAll('.session-link');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const sessions = document.querySelectorAll('.session');
const commentInput = document.getElementById('commentInput');
const submitCommentBtn = document.getElementById('submitComment');
const commentsContainer = document.getElementById('commentsContainer');

let timerInterval;
let startTime;
let elapsedTime = 0;
let isTimerRunning = false;

function formatTime(timeInSeconds) {
    if (typeof timeInSeconds !== 'number' || isNaN(timeInSeconds) || timeInSeconds < 0 || timeInSeconds === null || timeInSeconds === undefined) {
        throw new Error('Invalid time');
    }

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateTimer() {
    const currentTime = Math.floor((Date.now() - startTime + elapsedTime) / 1000);
    timerDisplay.textContent = formatTime(currentTime);
}

function startTimer() {
    startTime = Date.now() - elapsedTime; // Update start time when starting
    timerInterval = setInterval(updateTimer, 1000);
    isTimerRunning = true;
}

function pauseTimer() {
    clearInterval(timerInterval);
    if (isTimerRunning) {
        elapsedTime = Date.now() - startTime;
        isTimerRunning = false;
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    elapsedTime = 0;
    startTime = Date.now(); // Reset start time as well
    updateTimer(); // Update timer display to show 00:00
    isTimerRunning = false;
}

// Session bookmarks
function bookmarkSession(sessionName) {
    const bookmark = document.createElement('li');
    bookmark.textContent = sessionName;
    bookmarkList.appendChild(bookmark);
    saveBookmarks(); // Save bookmarks to local storage
}

function saveBookmarks() {
    const bookmarks = [];
    const bookmarkItems = bookmarkList.querySelectorAll('li');
    bookmarkItems.forEach(item => {
        bookmarks.push(item.textContent);
    });
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

function loadBookmarks() {
    const savedBookmarks = localStorage.getItem('bookmarks');
    if (savedBookmarks) {
        const bookmarks = JSON.parse(savedBookmarks);
        bookmarks.forEach(bookmark => {
            bookmarkSession(bookmark);
        });
    }
}

// Load bookmarks when the page loads
window.addEventListener('load', function() {
    loadBookmarks();
});

// Function to unbookmark a session
function unbookmarkSession(sessionName) {
    const bookmarkItems = bookmarkList.querySelectorAll('li');
    bookmarkItems.forEach(item => {
        if (item.textContent === sessionName) {
            item.remove(); // Remove the session from the bookmarked list
            saveBookmarks(); // Save updated bookmarks to local storage
        }
    });
}

// Event listeners
if (startButton) {
    startButton.addEventListener('click', function() {
        if (!isTimerRunning) {
            startTimer();
        }
    });
}

if (pauseButton) {
    pauseButton.addEventListener('click', function() {
        pauseTimer();
    });
}

if (resetButton) {
    resetButton.addEventListener('click', function() {
        resetTimer();
    });
}

if (bookmarkButton) {
    bookmarkButton.addEventListener('click', function() {
        const sessionName = prompt('Enter session name to bookmark:');
        if (sessionName) {
            bookmarkSession(sessionName);
        }
    });
}

if (unbookmarkButton) {
    unbookmarkButton.addEventListener('click', function() {
        const sessionName = prompt('Enter session name to unbookmark:');
        if (sessionName) {
            unbookmarkSession(sessionName);
        }
    });
}

if (themeSwitcher) {
    themeSwitcher.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
    });
}

// Event listener for session links
if (sessionLinks) {
    sessionLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const session = link.closest('.session');
            document.querySelectorAll('.session').forEach(s => s.classList.remove('active'));
            session.classList.add('active');
        });
    });
}

if (searchButton) {
    searchButton.addEventListener('click', function() {
        const searchQuery = searchInput.value.toLowerCase().trim();

        sessions.forEach(session => {
            const sessionTitle = session.querySelector('h3').textContent.toLowerCase();
            if (sessionTitle.includes(searchQuery)) {
                session.style.display = 'block';
            } else {
                session.style.display = 'none';
            }
        });
    });
}

// Reset the search when the input field is cleared
if (searchInput) {
    searchInput.addEventListener('input', function() {
        if (searchInput.value.trim() === '') {
            sessions.forEach(session => {
                session.style.display = 'block';
            });
        }
    });
}

// Event listener for submitting a comment
if (submitCommentBtn) {
    submitCommentBtn.addEventListener('click', function() {
        const commentText = commentInput.value.trim();
        if (commentText !== '') {
            addComment(commentText);
            saveCommentsToLocalStorage();
            commentInput.value = ''; // Clear the input field after submitting
        }
    });
}

// Function to add a new comment to the comments container
function addComment(commentText) {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.innerHTML = `<i>${commentText}</i>`;
    
    // Adding delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function() {
        deleteComment(commentElement);
    });
    
    commentElement.appendChild(deleteButton);
    commentsContainer.appendChild(commentElement);
}
// Function to delete a comment
function deleteComment(commentElement) {
    commentElement.remove();
    saveCommentsToLocalStorage();
}

// Function to save comments to local storage
function saveCommentsToLocalStorage() {
    const comments = [];
    commentsContainer.querySelectorAll('.comment').forEach(comment => {
        comments.push(comment.textContent);
    });
    localStorage.setItem('sessionComments', JSON.stringify(comments));
}

// Function to load comments from local storage
function loadComments() {
    const savedComments = localStorage.getItem('sessionComments');
    if (savedComments) {
        const comments = JSON.parse(savedComments);
        comments.forEach(comment => {
            addComment(comment);
        });
    }
}

// Load comments when the page loads
loadComments();

// Exporting functions
module.exports = {
    formatTime,
    bookmarkSession,
    saveBookmarks,
    loadBookmarks,
    unbookmarkSession,
    addComment,
    saveCommentsToLocalStorage,
    loadComments
};