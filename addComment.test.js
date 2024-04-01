

// Import the function we're testing
const { addComment } = require('./MeditationSession');

// Jest and @testing-library/jest-dom for assertions
const { cleanup } = require('@testing-library/dom');
require('@testing-library/jest-dom/extend-expect');

describe('addComment function with undefined input', () => {
    let commentsContainer;

    beforeEach(() => {
        // Setup our document body
        document.body.innerHTML = `<div id="commentsContainer"></div>`;
        commentsContainer = document.getElementById('commentsContainer');
    });

    afterEach(() => {
        cleanup();
    });

    test('should not add comments if undefined is passed', () => {
        addComment(undefined);
        expect(commentsContainer).toBeEmptyDOMElement();
    });

    test('should be able to handle subsequent valid comments after an undefined input', () => {
        addComment(undefined);
        const validComment = 'This is a valid comment';
        addComment(validComment);
        expect(commentsContainer.children.length).toBe(1);
        expect(commentsContainer.textContent).toContain(validComment);
    });

    test('should handle adding multiple comments', () => {
        const comments = ['First Comment', 'Second Comment', 'Third Comment'];
        comments.forEach(comment => addComment(comment));

        expect(commentsContainer.children.length).toBe(3);
        comments.forEach(comment => {
            expect(commentsContainer.textContent).toContain(comment);
        });
    });
});
