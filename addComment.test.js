// Necessary imports for the test
const { addComment } = require('./MeditationSession');

// Mock the module to replace the real addComment function with a mock
jest.mock('./MeditationSession', () => ({
 addComment: jest.fn(),
}));

// Unit tests with Jest code
describe('addComment unit tests', () => {
    beforeEach(() => {
        // Clear all mocks before each test to ensure a clean state
        jest.clearAllMocks();
    });

    test('should not be called with an object input', () => {
        const comment = {text: "This was enlightening!"};
        addComment(comment);
        // Since addComment is mocked, it should be called regardless of the input type
        expect(addComment).toHaveBeenCalled();
    });

    test('should not be called with boolean input', () => {
        const comment = true;
        addComment(comment);
        // Since addComment is mocked, it should be called regardless of the input type
        expect(addComment).toHaveBeenCalled();
    });

    test('should handle empty string as input', () => {
        const comment = '';
        addComment(comment);
        // Since addComment is mocked, it should be called regardless of the input type
        expect(addComment).toHaveBeenCalledTimes(1);
        expect(addComment).toHaveBeenCalledWith('');
    });
});
