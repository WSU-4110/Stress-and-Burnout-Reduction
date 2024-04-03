class Timer {
    constructor(timerDisplayId, startButtonId, pauseButtonId, resetButtonId) {
        this.timerDisplay = document.getElementById(timerDisplayId);
        this.startButton = document.getElementById(startButtonId);
        this.pauseButton = document.getElementById(pauseButtonId);
        this.resetButton = document.getElementById(resetButtonId);

        this.timerInterval = null;
        this.startTime = null;
        this.elapsedTime = 0;
        this.isTimerRunning = false;

        this.startButton.addEventListener('click', this.start.bind(this));
        this.pauseButton.addEventListener('click', this.pause.bind(this));
        this.resetButton.addEventListener('click', this.reset.bind(this));
    }

    start() {
        if (!this.isTimerRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.timerInterval = setInterval(this.updateTimer.bind(this), 1000);
            this.isTimerRunning = true;
        }
    }

    pause() {
        clearInterval(this.timerInterval);
        this.elapsedTime = Date.now() - this.startTime;
        this.isTimerRunning = false;
    }

    reset() {
        clearInterval(this.timerInterval);
        this.elapsedTime = 0;
        this.startTime = null; // Resetting start time to null
        this.timerDisplay.textContent = '00:00'; // Resetting timer display to 00:00
        this.isTimerRunning = false;
    }

    updateTimer() {
        const currentTime = Math.floor((Date.now() - (this.startTime || 0) + this.elapsedTime) / 1000); // Ensuring startTime is not null
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
}


class BookmarkManager {
    constructor(bookmarkButtonId, unbookmarkButtonId, bookmarkListId) {
        this.bookmarkButton = document.getElementById(bookmarkButtonId);
        this.unbookmarkButton = document.getElementById(unbookmarkButtonId);
        this.bookmarkList = document.getElementById(bookmarkListId);

        this.bookmarkButton.addEventListener('click', this.bookmarkSession.bind(this));
        this.unbookmarkButton.addEventListener('click', this.unbookmarkSession.bind(this));

        this.loadBookmarks();
    }

    bookmarkSession() {
        const sessionName = prompt('Enter session name to bookmark:');
        if (sessionName) {
            const bookmark = document.createElement('li');
            bookmark.textContent = sessionName;
            this.bookmarkList.appendChild(bookmark);
            this.saveBookmarks();
        }
    }

    saveBookmarks() {
        const bookmarks = [];
        const bookmarkItems = this.bookmarkList.querySelectorAll('li');
        bookmarkItems.forEach(item => {
            bookmarks.push(item.textContent);
        });
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }

    loadBookmarks() {
        const savedBookmarks = localStorage.getItem('bookmarks');
        if (savedBookmarks) {
            const bookmarks = JSON.parse(savedBookmarks);
            bookmarks.forEach(bookmark => {
                this.bookmarkSession(bookmark);
            });
        }
    }

    unbookmarkSession() {
        const sessionName = prompt('Enter session name to unbookmark:');
        if (sessionName) {
            const bookmarkItems = this.bookmarkList.querySelectorAll('li');
            bookmarkItems.forEach(item => {
                if (item.textContent === sessionName) {
                    item.remove();
                    this.saveBookmarks();
                }
            });
        }
    }
}

class ThemeController {
    constructor(themeSwitcherId) {
        this.themeSwitcher = document.getElementById(themeSwitcherId);
        this.themeSwitcher.addEventListener('click', this.toggleTheme.bind(this));
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
    }
}

class Search {
    constructor(searchInputId, searchButtonId, sessionClass) {
        this.searchInput = document.getElementById(searchInputId);
        this.searchButton = document.getElementById(searchButtonId);
        this.sessions = document.querySelectorAll(`.${sessionClass}`);
        this.originalSessions = Array.from(this.sessions); // Store original sessions

        this.searchButton.addEventListener('click', this.search.bind(this));
        this.searchInput.addEventListener('input', this.handleInputChange.bind(this));
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


class CommentManager {
    constructor() {
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

        localStorage.setItem('sessionComments', JSON.stringify(comments));
    }

    loadComments() {
        const savedComments = localStorage.getItem('sessionComments');

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

const commentManager = new CommentManager();

// Usage
const timer = new Timer('timer', 'start', 'pause', 'reset');
const bookmarkManager = new BookmarkManager('bookmark', 'unbookmark', 'bookmark-list');
const themeController = new ThemeController('themeSwitcher');
const search = new Search('searchInput', 'searchButton', 'session');
