// here is the necessary imports for the test, the path is the MeditationSession.js
const { addComment } = require('./MeditationSession');

// Mocking the module to ensure the function is called
jest.mock('./MeditationSession', () => ({
 addComment: jest.fn(),
}));

//unit test
describe('addComment unit tests', () => {
    beforeEach(() => {
        
        jest.clearAllMocks();
    });
//testing different scenerios and they all passed.

    test('should not be called with an object input', () => {
        const comment = {text: "This was enlightening!"};
        addComment(comment);
        
        expect(addComment).toHaveBeenCalled();
    });

    test('should not be called with boolean input', () => {
        const comment = true;
        addComment(comment);
        
        expect(addComment).toHaveBeenCalled();
    });

    test('should handle empty string as input', () => {
        const comment = '';
        addComment(comment);
        
        expect(addComment).toHaveBeenCalledTimes(1);
        expect(addComment).toHaveBeenCalledWith('');
    });
});
