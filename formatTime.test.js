// Import the formatTime function
const { formatTime } = require('../MeditationSession');

// Describe the test suite for the formatTime function
describe('formatTime', () => {
    // Test case: Format time less than a minute
    test('formats time less than a minute correctly', () => {
        // Arrange
        const timeInSeconds = 30;

        // Act
        const formattedTime = formatTime(timeInSeconds);

        // Assert
        expect(formattedTime).toBe('00:30');
    });

    // Test case: Format time exactly one minute
    test('formats time exactly one minute correctly', () => {
        // Arrange
        const timeInSeconds = 60;

        // Act
        const formattedTime = formatTime(timeInSeconds);

        // Assert
        expect(formattedTime).toBe('01:00');
    });

    // Test case: Format time greater than one minute
    test('formats time greater than one minute correctly', () => {
        // Arrange
        const timeInSeconds = 123;

        // Act
        const formattedTime = formatTime(timeInSeconds);

        // Assert
        expect(formattedTime).toBe('02:03');
    });

    // Add more test cases as needed
});
