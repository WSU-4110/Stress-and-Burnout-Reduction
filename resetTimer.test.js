// Necessary imports for the jest testing
const { jest: jestGlobal } = require('@jest/globals');

// seting up the Globals for the test environment
let timerInterval;
let elapsedTime;
let isTimerRunning;
const updateTimer = jestGlobal.fn();

//  unit test for resetTimer function
function resetTimer() {
    clearInterval(timerInterval);
    elapsedTime = 0;
    isTimerRunning = false;
    updateTimer();
}

// Unit tests for some test scenerios and they all passed successfully
describe('resetTimer functionality tests', () => {
    beforeEach(() => {
        jestGlobal.useFakeTimers();
        timerInterval = setInterval(() => {}, 1000); // mocking an active interval

        // Mocking values
        elapsedTime = 100; // assume 100 milliseconds have elapsed
        isTimerRunning = true; // assume the timer was running
        updateTimer.mockClear(); // Clear mock history
    });
    
    afterEach(() => {
        jestGlobal.clearAllTimers();
    });

    test('should clear the interval for timerInterval', () => {
        const initialTimerCount = jestGlobal.getTimerCount();
        resetTimer();
        expect(jestGlobal.getTimerCount()).toBeLessThan(initialTimerCount);
    });

    test('elapsedTime should be reset to 0', () => {
        resetTimer();
        expect(elapsedTime).toBe(0);
    });
    
    test('isTimerRunning should be set to false', () => {
        resetTimer();
        expect(isTimerRunning).toBeFalsy();
    });

    test('should call updateTimer once', () => {
        resetTimer();
        expect(updateTimer).toHaveBeenCalledTimes(1);
    });

    test('updateTimer should not be called before resetTimer', () => {
        expect(updateTimer).not.toHaveBeenCalled();
    });

    test('should handle cases when timerInterval is not defined', () => {
        // Clearing timerInterval to simulate it being undefined
        clearInterval(timerInterval);
        timerInterval = undefined;
        expect(() => resetTimer()).not.toThrow();
    });

    test('should not break if resetTimer is called multiple times', () => {
        expect(() => {
            resetTimer();
            resetTimer();
        }).not.toThrow();
        expect(updateTimer).toHaveBeenCalledTimes(2);
    });
});
