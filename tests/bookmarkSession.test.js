//unit test for bookmarkSession method
// Mocking the required file and methods

jest.mock('../MeditationSession', () => ({
    unbookmarkSession: jest.fn()
}));


const { unbookmarkSession } = require('../MeditationSession');

describe('unbookmarkSession function', () => {
    test('should call unbookmarkSession function', () => {
        // Call the unbookmarkSession function
        unbookmarkSession();
        
        // Expect the unbookmarkSession function to have been called once
        expect(unbookmarkSession).toHaveBeenCalledTimes(1);
    });

    test('should return false when unbookmarking a session', () => {
        // Mocking the unbookmarkSession function to return false
        unbookmarkSession.mockReturnValue(false);

        
        const result = unbookmarkSession();
        
        // Expect the result to be false
        expect(result).toBe(false);
    });


   
});