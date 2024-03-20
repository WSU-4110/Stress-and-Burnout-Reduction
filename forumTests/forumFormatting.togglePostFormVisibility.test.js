import { JSDOM } from 'jsdom';
import { togglePostFormVisibility } from '../forumFormatting.js';

const { window } = new JSDOM('<!doctype html><html><body></body></html>');
global.window = window;

describe('togglePostFormVisibility', () => {
  test('should show post form when user is logged in', () => {
    const postFormContainer = document.createElement('div');
    postFormContainer.classList.add('post-form-container');
    document.body.appendChild(postFormContainer);
    togglePostFormVisibility(true);
    expect(postFormContainer.style.display).toBe('block');
  });
});
