// formatTime.test.js
const { formatTime } = require('./MeditationSession');

// Mock the DOM environment
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

// Your test suites and cases
describe('formatTime', () => {
    test('formats time correctly', () => {
        expect(formatTime(70)).toBe('01:10');
        expect(formatTime(3600)).toBe('60:00');
        expect(formatTime(65)).toBe('01:05');
        expect(formatTime(5)).toBe('00:05');
    });

    test('handles negative time', () => {
        expect(formatTime(-70)).toBe('00:00');
    });

    test('handles large time values', () => {
        expect(formatTime(9999999)).toBe('166666:39');
    });

    // Add more test cases as needed
});
