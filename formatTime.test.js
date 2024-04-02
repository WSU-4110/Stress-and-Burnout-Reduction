

//unit testing for formatTime function. i have done several tests for different scenerios and all of them passed.
const { formatTime } = require('./MeditationSession');
const { test, expect } = require('@jest/globals');

// unit testing for Positive scenerios and it passed successfully
test('formats time correctly for 0 seconds', () => {
    const timeInSeconds = 0;
    const formattedTime = formatTime(timeInSeconds);
    expect(formattedTime).toBe('00:00');
});

test('formats time correctly for under a minute', () => {
    const timeInSeconds = 45;
    const formattedTime = formatTime(timeInSeconds);
    expect(formattedTime).toBe('00:45');
});

test('formats time correctly for exact one minute', () => {
    const timeInSeconds = 60;
    const formattedTime = formatTime(timeInSeconds);
    expect(formattedTime).toBe('01:00');
});

test('formats time correctly for minutes and seconds', () => {
    const timeInSeconds = 125;
    const formattedTime = formatTime(timeInSeconds);
    expect(formattedTime).toBe('02:05');
});

test('formats time correctly for exactly one hour', () => {
    const timeInSeconds = 3600;
    const formattedTime = formatTime(timeInSeconds);
    expect(formattedTime).toBe('60:00');
});

test('formats time correctly for hours and minutes and seconds', () => {
    const timeInSeconds = 3665;
    const formattedTime = formatTime(timeInSeconds);
    expect(formattedTime).toBe('61:05');
});

// unit testing for Negative scenerios and passed successfully
test('throws an error for negative inputs', () => {
    const timeInSeconds = -10;
    expect(() => formatTime(timeInSeconds)).toThrow('Invalid time');
});

test('throws an error for non-numeric inputs', () => {
    const timeInSeconds = 'a string';
    expect(() => formatTime(timeInSeconds)).toThrow('Invalid time');
});

test('throws an error for null input', () => {
    const timeInSeconds = null;
    expect(() => formatTime(timeInSeconds)).toThrow('Invalid time');
});

test('throws an error for undefined input', () => {
    const timeInSeconds = undefined;
    expect(() => formatTime(timeInSeconds)).toThrow('Invalid time');
});

// now for  Edge cases and passed successfully
test('formats time correctly for large numbers', () => {
    const timeInSeconds = 86400; // 24 hours
    const formattedTime = formatTime(timeInSeconds);
    expect(formattedTime).toBe('1440:00');
});

test('formats time correctly for non-integer values rounding down', () => {
    const timeInSeconds = 59.999; // Should round down
    const formattedTime = formatTime(timeInSeconds);
    expect(formattedTime).toBe('00:59');
});

test('formats time correctly for non-integer values rounding up', () => {
    const timeInSeconds = 120.5; // Beyond the range to round up in seconds
    const formattedTime = formatTime(timeInSeconds);
    expect(formattedTime).toBe('02:00');
});
