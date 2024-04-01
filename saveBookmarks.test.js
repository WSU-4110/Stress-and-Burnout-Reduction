//javascript
// Necessary imports for Jest and the functionality
const { saveBookmarks } = require('./MeditationSession');
const { JSDOM } = require('jsdom');
jest.mock('jest-localstorage-mock');
const { TextEncoder } = require('text-encoding');
global.TextEncoder = TextEncoder;

describe('Unit tests for the saveBookmarks function', () => {
  let document, bookmarkList;

  beforeEach(() => {
    // Mocking a JSDOM instance and the localStorage before each test
    const jsdom = new JSDOM('<!doctype html><html><body><div id="bookmarks"><ul id="bookmark-list"></ul></div></body></html>');
    document = jsdom.window.document;
    global.localStorage = require('jest-localstorage-mock');
    bookmarkList = document.getElementById('bookmark-list');
    localStorage.clear();
  });

  it('should save a list of string bookmarks', () => {
    const bookmarkItems = ['Bookmark 1', 'Bookmark 2'];
    bookmarkItems.forEach(itemText => {
      const li = document.createElement('li');
      li.textContent = itemText;
      bookmarkList.appendChild(li);
    });
    saveBookmarks(bookmarkList);
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarks'));
    expect(savedBookmarks).toEqual(bookmarkItems);
  });

  it('should not save bookmarks if the list is empty', () => {
    saveBookmarks(bookmarkList);
    const savedBookmarks = localStorage.getItem('bookmarks');
    expect(savedBookmarks).toBeNull();
  });
});