import { JSDOM } from 'jsdom';
import { leftButton, rightButton } from '../forumFormatting.js'; // leftButton and rightButton are defined in forumFormatting.js

const { window } = new JSDOM('<!doctype html><html><body></body></html>');
global.window = window;

global.fetch = jest.fn().mockResolvedValue({
  json: () => Promise.resolve({ username: 'testuser' }),
});

describe('Functionality for login and signup', () => {
  test('should change button text and behavior based on user login status', async () => {
    // Simulate user not logged in
    await window.fetch.mockResolvedValueOnce({ json: () => Promise.resolve({}) });

    leftButton.click(); // leftButton.click() triggers the button click event

    expect(leftButton.textContent).toBe('Sign Up');
    expect(rightButton.textContent).toBe('Login');

    // Simulate user logged in
    await window.fetch.mockResolvedValueOnce({ json: () => Promise.resolve({ username: 'testuser' }) });

    leftButton.click();

    expect(leftButton.textContent).toBe('Account');
    expect(rightButton.textContent).toBe('Sign Out of testuser');
  });
});
