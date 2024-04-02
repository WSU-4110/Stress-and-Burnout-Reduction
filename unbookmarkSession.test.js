// Necessary imports for jest unit testing
const { unbookmarkSession, saveBookmarks } = require('./MeditationSession');

const { fireEvent } = require("@testing-library/dom");
require('@testing-library/jest-dom');
jest.mock("@testing-library/dom");

//unit tests for unbookmarkSession function and it passed successfully.
describe("Tests for unbookmarkSession functionality", () => {
  
  let bookmarkList;

  beforeEach(() => {
    document.body.innerHTML = '<div id="bookmarks"><ul id="bookmark-list"></ul></div>';
    bookmarkList = document.getElementById('bookmark-list');
  });

  test.each([null, undefined, 123, {}, [], true])(
    'Throws TypeError when sessionName is of invalid type: %p',
    (invalidInput) => {
      expect(() => unbookmarkSession(invalidInput)).toThrow(TypeError);
    }
  );

 
});
