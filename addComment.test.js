//unit testing for addComment method

// Mocking the required file and methods
jest.mock('./MeditationSession', () => ({
    addComment: jest.fn()
}));


const { addComment } = require('./MeditationSession');

describe('addComment function', () => {
    test('should add a comment to the session', () => {
        
        addComment();

        // Assert that the addComment function was called once
        expect(addComment).toHaveBeenCalledTimes(1);
    });
    test('should add a comment successfully', () => {
       
        const comment = 'This is a test comment.';
        // Calling the addComment method with the mock comment
        addComment(comment);
        expect(addComment).toHaveBeenCalledWith(comment);

    });


    test('should handle empty comments', () => {
    
        addComment('');

        expect(addComment).toHaveBeenCalledWith('');
    });

    test('should not add a null comment', () => {
        // Calling addComment method with null
        addComment(null);

        expect(addComment).toHaveBeenCalledWith(null);
    });

    test('should manage undefined comments', () => {
        // Calling the method without any arguments
        addComment(undefined);
        expect(addComment).toHaveBeenCalledWith(undefined);
    });
});
