
//javascript
// Necessary imports
const { describe, beforeEach, test, expect } = require('@jest/globals');
const { resetTimer } = require('./MeditationSession');

// Mock data or dependencies setup
let mockContext = {};

describe("Testing resetTimer function from MeditationSession", () => {

  beforeEach(() => {
    // Reset mock context before each test
    mockContext = {
      startTime: 0,
      elapsedTime: 0,
      isRunning: false
    };
  });

  test("It should reset the timer accurately", () => {
    // Setting up a non-initial state
    mockContext.startTime = 5;
    mockContext.elapsedTime = 100;
    mockContext.isRunning = true;

    resetTimer(mockContext); // Act - Reset timer with given context

    // Assert - Check if the context has been reset correctly
    expect(mockContext.startTime).toBe(0);
    expect(mockContext.elapsedTime).toBe(0);
    expect(mockContext.isRunning).toBe(false);
  });

  test("It should handle null context gracefully", () => {
    // Calling resetTimer with null to test its error handling
    const result = resetTimer(null);

    // Assert - Expect no return (or handling) indicating graceful handling of a null context
    expect(result).toBeUndefined();
  });

  test("It should not mutate context if it's already at initial state", () => {
    const initialState = {
      startTime: 0,
      elapsedTime: 0,
      isRunning: false
    };

    // Act - Trying to reset an already reset context
    resetTimer(mockContext); 

    // Assert - Expecting no change to the context since it was already reset
    expect(mockContext).toEqual(initialState);
  });

  test("It should be idempotent", () => {
    // Setup context with non-initial values
    mockContext.startTime = 5;
    mockContext.elapsedTime = 100;
    mockContext.isRunning = true;

    // Act - Reset timer twice
    resetTimer(mockContext); // First reset
    const afterFirstReset = { ...mockContext };
    resetTimer(mockContext); // Second reset, should result in no change

    // Assert - The context should remain unchanged after the second reset showing idempotency
    expect(mockContext).toEqual(afterFirstReset);
  });

});
//