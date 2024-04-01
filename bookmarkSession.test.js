//javascript
const { fireEvent } = require("@testing-library/dom");
require('@testing-library/jest-dom');
jest.mock("@testing-library/dom", () => ({
  ...jest.requireActual("@testing-library/dom"),
  fireEvent: jest.fn(),
}));
const { bookmarkSession, saveBookmarks } = require('./MeditationSession');

let bookmarkList;

beforeEach(() => {
    // Set up the DOM environment
    document.body.innerHTML = '<div id="bookmarks"><ul id="bookmark-list"></ul></div>';
    bookmarkList = document.getElementById('bookmark-list');
});

test('Throws TypeError for invalid sessionName types', () => {
    const invalidInputs = [null, undefined, 123, {}, [], true];
    invalidInputs.forEach(input => {
        expect(() => bookmarkSession(input)).toThrow(TypeError);
    });
});

