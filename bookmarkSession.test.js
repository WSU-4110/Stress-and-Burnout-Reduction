
const { bookmarkSession, saveBookmarks, loadBookmarks } = require('./MeditationSession');


jest.mock('./MeditationSession');


document.body.innerHTML =
  '<ul id="bookmarkList"></ul>';

const localStorageMock = (function() {
    let store = {};
    return {
        getItem: function(key) {
            return store[key] || null;
        },
        setItem: function(key, value) {
            store[key] = value.toString();
        },
        clear: function() {
            store = {};
        }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

Object.defineProperty(window, 'bookmarkList', {
    value: document.getElementById('bookmarkList')
});

describe('bookmarkSession function', () => {
    afterEach(() => {
        // Clean up after each test
        window.bookmarkList.innerHTML = '';
        localStorage.clear();
    });

    test('adds a new session bookmark to the list', () => {
        bookmarkSession('Session 1');
        expect(window.bookmarkList.childNodes.length).toBe(1);
        expect(window.bookmarkList.childNodes[0].textContent).toBe('Session 1');
    });
});

describe('saveBookmarks function', () => {
    afterEach(() => {
        // Clean up after each test
        window.bookmarkList.innerHTML = '';
        localStorage.clear();
    });

    test('saves current bookmarks to localStorage', () => {
        bookmarkSession('Session 1');
        bookmarkSession('Session 2');
        saveBookmarks();
        expect(localStorage.getItem('bookmarks')).toEqual(JSON.stringify(['Session 1', 'Session 2']));
    });
});

describe('loadBookmarks function', () => {
    afterEach(() => {
        // Clean up after each test
        window.bookmarkList.innerHTML = '';
        localStorage.clear();
    });

    test('loads bookmarks from localStorage and adds them to the list', () => {
        localStorage.setItem('bookmarks', JSON.stringify(['Session 1', 'Session 2']));
        loadBookmarks();
        expect(window.bookmarkList.childNodes.length).toBe(2);
        expect(window.bookmarkList.childNodes[0].textContent).toBe('Session 1');
        expect(window.bookmarkList.childNodes[1].textContent).toBe('Session 2');
    });

    test('does nothing if there are no bookmarks in localStorage', () => {
        loadBookmarks();
        expect(window.bookmarkList.childNodes.length).toBe(0);
    });
});
//