const { saveBookmarks } = require('./MeditationSession');

describe('saveBookmarks function', () => {
  it('should save bookmarks to localStorage', () => {
    // Mocking bookmarkList and localStorage
    const bookmarkList = document.createElement('ul');
    document.body.appendChild(bookmarkList);

    // Adding some bookmark items
    const bookmarkItems = ['Bookmark 1', 'Bookmark 2', 'Bookmark 3'];
    bookmarkItems.forEach(itemText => {
      const li = document.createElement('li');
      li.textContent = itemText;
      bookmarkList.appendChild(li);
    });

    // Mocking localStorage.setItem
    global.localStorage.setItem = jest.fn();

    // Calling the function
    saveBookmarks();

    // Retrieving the bookmarks saved in localStorage
    const savedBookmarks = JSON.parse(global.localStorage.setItem.mock.calls[0][1]);

    // Expectations
    expect(savedBookmarks).toHaveLength(3);
    expect(savedBookmarks).toContain('Bookmark 1');
    expect(savedBookmarks).toContain('Bookmark 2');
    expect(savedBookmarks).toContain('Bookmark 3');
  });
});
