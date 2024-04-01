//adding neccessary library
//using jest mock

const { fireEvent } = require("@testing-library/dom");
require('@testing-library/jest-dom');

jest.mock("@testing-library/dom", () => ({
  ...jest.requireActual("@testing-library/dom"),
  fireEvent: jest.fn(),
}));
//path is from MeditationSession.js
const { bookmarkSession, saveBookmarks } = require('./MeditationSession');

let bookmarkList;

beforeEach(() => {
    // Seting up the DOM environment
    document.body.innerHTML = '<div id="bookmarks"><ul id="bookmark-list"></ul></div>';
    bookmarkList = document.getElementById('bookmark-list');
});
//a unit test for bookmarkSession function , and it passed.
test('Throws TypeError for invalid sessionName types', () => {
    const invalidInputs = [null, undefined, 123, {}, [], true];
    invalidInputs.forEach(input => {
        expect(() => bookmarkSession(input)).toThrow(TypeError);
    });
});

