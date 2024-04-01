const { fireEvent } = require("@testing-library/dom");
require('@testing-library/jest-dom');

// Mocks
const saveBookmarks = jest.fn();
const sessionName = "Test Session";
let bookmarkList;

// Set up DOM environment for testing
document.body.innerHTML = `<ul id="bookmarkList"></ul>`;
bookmarkList = document.getElementById('bookmarkList');

// Mocks and helper functions
global.document.createElement = jest.fn().mockImplementation((tag) => {
    return {
        textContent: '',
        appendChild: jest.fn(),
    };
});

global.document.getElementById = jest.fn().mockReturnValue(bookmarkList);

// The function to test
function bookmarkSession(sessionName) {
    const bookmark = document.createElement('li');
    bookmark.textContent = sessionName;
    bookmarkList.appendChild(bookmark);
    saveBookmarks(); // Save bookmarks to local storage
}

describe('bookmarkSession functionality', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        saveBookmarks.mockClear();
        global.document.createElement.mockClear();
        bookmarkList.innerHTML = ''; // Clear the bookmark list
    });

    test('Function creates a bookmark and appends to the list', () => {
        // Act
        bookmarkSession(sessionName);

        // Assert
        expect(global.document.createElement).toHaveBeenCalledWith('li');
        expect(bookmarkList.children.length).toBe(1);
        expect(bookmarkList.firstChild.textContent).toBe(sessionName);
    });

    test('Function calls saveBookmarks to save the session to local storage', () => {
        // Act
        bookmarkSession(sessionName);

        // Assert
        expect(saveBookmarks).toHaveBeenCalledTimes(1);
    });

    test('Executes correctly with multiple sessions', () => {
        // Arrange
        const sessionNames = ["Session 1", "Session 2", "Session 3"];

        // Act
        sessionNames.forEach(name => bookmarkSession(name));

        // Assert
        expect(bookmarkList.children.length).toBe(sessionNames.length);
        sessionNames.forEach((name, index) => {
            expect(bookmarkList.children[index].textContent).toBe(name);
        });
    });

    test('Handles empty session name gracefully', () => {
        // Act
        bookmarkSession('');

        // Assert
        expect(bookmarkList.children.length).toBe(0); // No bookmarks should be added
        expect(saveBookmarks).toHaveBeenCalledTimes(1);
    });

    test('Throws if sessionName is not a string', () => {
        // Act and Assert for each invalid input
        const invalidInputs = [null, undefined, 123, {}, [], true];
        invalidInputs.forEach(input => {
            const act = () => bookmarkSession(input);
            expect(act).toThrow(TypeError);
        });
    });
});
