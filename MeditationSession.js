class Timer {
    constructor(timerDisplayId, startButtonId, pauseButtonId, resetButtonId, userId) {
        this.timerDisplay = document.getElementById(timerDisplayId);
        this.startButton = document.getElementById(startButtonId);
        this.pauseButton = document.getElementById(pauseButtonId);
        this.resetButton = document.getElementById(resetButtonId);
        this.userId = userId;

        this.timerInterval = null;
        this.startTime = null;
        this.elapsedTime = 0;
        this.isTimerRunning = false;

        // Load timer settings when the object is instantiated
        this.loadTimerSettings();

        this.startButton.addEventListener('click', this.start.bind(this));
        this.pauseButton.addEventListener('click', this.pause.bind(this));
        this.resetButton.addEventListener('click', this.reset.bind(this));
    }

    start() {
        if (!this.isTimerRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.timerInterval = setInterval(this.updateTimer.bind(this), 1000);
            this.isTimerRunning = true;
            // Save timer settings when the timer starts
            this.saveTimerSettings();
        }
    }

    pause() {
        clearInterval(this.timerInterval);
        this.elapsedTime = Date.now() - this.startTime;
        this.isTimerRunning = false;
        // Save timer settings when the timer pauses
        this.saveTimerSettings();
    }

    reset() {
        clearInterval(this.timerInterval);
        this.elapsedTime = 0;
        this.startTime = null;
        this.timerDisplay.textContent = '00:00';
        this.isTimerRunning = false;
        // Save timer settings when the timer resets
        this.saveTimerSettings();
    }

    updateTimer() {
        const currentTime = Math.floor((Date.now() - (this.startTime || 0) + this.elapsedTime) / 1000);
        this.timerDisplay.textContent = this.formatTime(currentTime);
    }

    formatTime(timeInSeconds) {
        if (typeof timeInSeconds !== 'number' || isNaN(timeInSeconds) || timeInSeconds < 0 || timeInSeconds === null || timeInSeconds === undefined) {
            throw new Error('Invalid time');
        }

        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    saveTimerSettings() {
        localStorage.setItem(`timerSettings_${this.userId}`, JSON.stringify({
            startTime: this.startTime,
            elapsedTime: this.elapsedTime,
            isTimerRunning: this.isTimerRunning
        }));
    }

    loadTimerSettings() {
        const timerSettings = JSON.parse(localStorage.getItem(`timerSettings_${this.userId}`));
        if (timerSettings) {
            this.startTime = timerSettings.startTime;
            this.elapsedTime = timerSettings.elapsedTime;
            this.isTimerRunning = timerSettings.isTimerRunning;
            // If timer was running, restart it
            if (this.isTimerRunning) {
                this.start();
            }
        }
    }
}

// Usage (simulated user ID, replace with actual user ID)
const userId = 'user123';
const timer = new Timer('timer', 'start', 'pause', 'reset', userId);

// Simulated user authentication
localStorage.setItem('currentUser', userId);

class BookmarkManager {
    constructor(bookmarkButtonId, unbookmarkButtonId, bookmarkListId, userId) {
        this.bookmarkButton = document.getElementById(bookmarkButtonId);
        this.unbookmarkButton = document.getElementById(unbookmarkButtonId);
        this.bookmarkList = document.getElementById(bookmarkListId);
        this.userId = userId;

        // Check if elements exist before adding event listeners
        if (this.bookmarkButton) {
            this.bookmarkButton.addEventListener('click', this.bookmarkSession.bind(this));
        }
        if (this.unbookmarkButton) {
            this.unbookmarkButton.addEventListener('click', this.unbookmarkSession.bind(this));
        }

        // Load bookmarks when the object is instantiated
        this.loadBookmarks();
    }

    bookmarkSession() {
        const sessionName = prompt('Enter session name to bookmark:');
        if (sessionName) {
            this.addBookmark(sessionName);
            this.saveBookmarks();
        }
    }

    unbookmarkSession() {
        const sessionName = prompt('Enter session name to unbookmark:');
        if (sessionName) {
            this.removeBookmark(sessionName);
            this.saveBookmarks();
        }
    }

    addBookmark(sessionName) {
        const bookmark = document.createElement('li');
        bookmark.textContent = sessionName;
        this.bookmarkList.appendChild(bookmark);
    }

    removeBookmark(sessionName) {
        const bookmarkItems = this.bookmarkList.querySelectorAll('li');
        bookmarkItems.forEach(item => {
            if (item.textContent === sessionName) {
                item.remove();
            }
        });
    }

    saveBookmarks() {
        const bookmarks = [];
        const bookmarkItems = this.bookmarkList.querySelectorAll('li');
        bookmarkItems.forEach(item => {
            bookmarks.push(item.textContent);
        });
        localStorage.setItem(`bookmarks_${this.userId}`, JSON.stringify(bookmarks));
    }

    loadBookmarks() {
        const savedBookmarks = localStorage.getItem(`bookmarks_${this.userId}`);
        if (savedBookmarks) {
            const bookmarks = JSON.parse(savedBookmarks);
            bookmarks.forEach(bookmark => {
                this.addBookmark(bookmark);
            });
        }
    }
}

// Instantiate the BookmarkManager object
const bookmarkManager = new BookmarkManager('bookmark', 'unbookmark', 'bookmark-list', userId);

class ThemeController {
    constructor(themeSwitcherId) {
        this.themeSwitcher = document.getElementById(themeSwitcherId);
        if (this.themeSwitcher) {
            this.themeSwitcher.addEventListener('click', this.toggleTheme.bind(this));
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
    }
}

// Instantiate the ThemeController object
const themeController = new ThemeController('themeSwitcher');

class Search {
    constructor(searchInputId, searchButtonId, sessionClass) {
        this.searchInput = document.getElementById(searchInputId);
        this.searchButton = document.getElementById(searchButtonId);
        this.sessions = document.querySelectorAll(`.${sessionClass}`);
        this.originalSessions = Array.from(this.sessions); // Store original sessions

        // Check if elements exist before adding event listeners
        if (this.searchButton) {
            this.searchButton.addEventListener('click', this.search.bind(this));
        }
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.handleInputChange.bind(this));
        }
    }

    search() {
        const searchQuery = this.searchInput.value.toLowerCase().trim();

        this.sessions.forEach(session => {
            const sessionTitle = session.querySelector('h3').textContent.toLowerCase();
            if (sessionTitle.includes(searchQuery)) {
                session.style.display = 'block';
            } else {
                session.style.display = 'none';
            }
        });
    }

    handleInputChange() {
        const searchQuery = this.searchInput.value.trim();

        if (searchQuery === '') {
            // If search query is empty, show all original sessions
            this.originalSessions.forEach(session => {
                session.style.display = 'block';
            });
        } else {
            // If there's a search query, call the search method to filter sessions
            this.search();
        }
    }
}

// Instantiate the Search object
const search = new Search('searchInput', 'searchButton', 'session');


class CommentManager {
    constructor(userId) {
        this.userId = userId;
        this.initializeCommentSections();
        this.bindSubmitButtons();
        window.addEventListener('load', this.loadComments.bind(this));
    }

    initializeCommentSections() {
        const sessions = document.querySelectorAll('.session');
        sessions.forEach((session, index) => {
            const commentInput = session.querySelector(`#commentInput${index + 1}`);
            const submitButton = session.querySelector(`#submitComment${index + 1}`);
            const commentsContainer = session.querySelector(`#commentsContainer${index + 1}`);

            submitButton.addEventListener('click', () => {
                this.addComment(commentInput, commentsContainer);
            });
        });
    }

    addComment(commentInput, commentsContainer) {
        const commentText = commentInput.value.trim();

        if (commentText !== '') {
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');
            commentElement.innerHTML = `<i>${commentText}</i>`;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                commentElement.remove();
                this.saveCommentsToLocalStorage();
            });

            commentElement.appendChild(deleteButton);
            commentsContainer.appendChild(commentElement);
            this.saveCommentsToLocalStorage();
            commentInput.value = '';
        }
    }

    saveCommentsToLocalStorage() {
        const sessions = document.querySelectorAll('.session');
        const comments = [];

        sessions.forEach((session, index) => {
            const commentsContainer = session.querySelector(`#commentsContainer${index + 1}`);
            commentsContainer.querySelectorAll('.comment').forEach(comment => {
                comments.push(comment.textContent);
            });
        });

        localStorage.setItem(`sessionComments_${this.userId}`, JSON.stringify(comments));
    }

    loadComments() {
        const savedComments = localStorage.getItem(`sessionComments_${this.userId}`);

        if (savedComments) {
            const comments = JSON.parse(savedComments);

            const sessions = document.querySelectorAll('.session');
            let commentIndex = 0;

            sessions.forEach((session, index) => {
                const commentsContainer = session.querySelector(`#commentsContainer${index + 1}`);
                commentsContainer.innerHTML = ''; // Clear existing comments

                for (let i = commentIndex; i < comments.length; i++) {
                    const commentElement = document.createElement('div');
                    commentElement.classList.add('comment');
                    commentElement.innerHTML = `<i>${comments[i]}</i>`;

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.addEventListener('click', () => {
                        commentElement.remove();
                        this.saveCommentsToLocalStorage();
                    });

                    commentElement.appendChild(deleteButton);
                    commentsContainer.appendChild(commentElement);

                    commentIndex++;
                }
            });
        }
    }
}

const currentUser = localStorage.getItem('currentUser');
if (currentUser) {
    const commentManager = new CommentManager(currentUser);
}
