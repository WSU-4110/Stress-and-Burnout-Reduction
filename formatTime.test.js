// formatTime.test.js

const { formatTime } = require('./MeditationSession');

// Mock the necessary DOM elements
const startButton = {
    addEventListener: jest.fn(), // Mock addEventListener function
};

// Pass the mock elements to the function being tested
global.document = {
    getElementById: jest.fn().mockImplementation((id) => {
        if (id === 'start') {
            return startButton;
        }
        return null; // Mock other getElementById calls if needed
    }),
};

test('formatTime formats time correctly', () => {
    expect(formatTime(65)).toBe('01:05');
});