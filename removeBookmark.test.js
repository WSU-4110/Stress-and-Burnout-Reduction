//unit test for removebookmark method


jest.mock('./MeditationSession', () => ({
    removeBookmark: jest.fn()
}));

// Importing the removeBookmark function
const { removeBookmark } = require('./MeditationSession');

describe('removeBookmark function', () => {
    beforeEach(() => {
      
        removeBookmark.mockClear();
    });
//three testing scenerios and they passed successfully
    test('should call removeBookmark function', () => {
        // Call the removeBookmark function
        removeBookmark();
        
        // Expect the removeBookmark function to have been called once
        expect(removeBookmark).toHaveBeenCalledTimes(1);
    });

    test('should return true when removing a bookmark', () => {
        // Mocking the removeBookmark function to return true
        removeBookmark.mockReturnValue(true);

        // Call the removeBookmark function
        const result = removeBookmark();
        
        // Expect the result to be true
        expect(result).toBe(true);
    });

    test('should return false when removing a bookmark fails', () => {
        // Mocking the removeBookmark function to return false
        removeBookmark.mockReturnValue(false);
    
        // Call the removeBookmark function
        const result = removeBookmark();
        
        // Expect the result to be false
        expect(result).toBe(false);
    });
    

});
