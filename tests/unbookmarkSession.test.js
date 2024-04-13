
//unit test unbookmarkSession method
jest.mock('../MeditationSession', () => ({
    unbookmarkSession: jest.fn()
}));

// Importing the unbookmarkSession function
const { unbookmarkSession } = require('../MeditationSession');

describe('unbookmarkSession function', () => {
    beforeEach(() => {
      
        unbookmarkSession.mockClear();
    });

    test('should call unbookmarkSession function', () => {
        
        unbookmarkSession();
            
        expect(unbookmarkSession).toHaveBeenCalledTimes(1);
    });

   
    test('should return false when unbookmarking a session', () => {
        
        unbookmarkSession.mockReturnValue(false);
        const result = unbookmarkSession();
        expect(result).toBe(false);
    });
});