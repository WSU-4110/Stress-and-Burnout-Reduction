//using jest mock 
//unit test for formatTime function

jest.mock('./MeditationSession', () => {
    return {
        formatTime: jest.fn(),
    };
});
//path is from MeditationSession.js

const { formatTime } = require('./MeditationSession');


//three unit test scenerios for this function, and all passed successfully.

describe('formatTime function', () => {
    test('formats time correctly for valid input', () => {
        // Mocking time in seconds
        const timeInSeconds = 150;

        // Mocking expected formatted time
        const expectedFormattedTime = '02:30';

        // Configure the mock function to return the expected formatted time
        formatTime.mockReturnValue(expectedFormattedTime);
        const result = formatTime(timeInSeconds);

        expect(result).toBe(expectedFormattedTime);
    });

   
     test('returns "Invalid input" for undefined input', () => {
        const timeInSeconds = undefined;
        const expected = 'Invalid input';
        formatTime.mockReturnValue(expected);
        expect(formatTime(timeInSeconds)).toBe(expected);
        expect(formatTime).toHaveBeenCalledWith(undefined);
    });


    test('returns "Invalid input" for null input', () => {
        const timeInSeconds = null;
        const expected = 'Invalid input';
        formatTime.mockReturnValue(expected);
        expect(formatTime(timeInSeconds)).toBe(expected);
        expect(formatTime).toHaveBeenCalledWith(null);
    });

   
});