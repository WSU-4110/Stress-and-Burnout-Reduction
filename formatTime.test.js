// Import the formatTime function
const { formatTime } = require('./MeditationSession');

// Test cases for the formatTime function
describe('formatTime function', () => {
    test('formats time correctly for 0 seconds', () => {
        expect(formatTime(0)).toBe('00:00');
    });

    test('formats time correctly for less than a minute', () => {
        expect(formatTime(45)).toBe('00:45');
    });

    test('formats time correctly for 1 minute', () => {
        expect(formatTime(60)).toBe('01:00');
    });

    test('formats time correctly for more than 1 minute', () => {
        expect(formatTime(123)).toBe('02:03');
    });
});
