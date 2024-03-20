import { JSDOM } from 'jsdom';
import { toggleFixedHeader } from '../forumFormatting.js';

const { window } = new JSDOM('<!doctype html><html><body></body></html>');
global.window = window;

describe('DOMContentLoaded event listener', () => {
  test('should trigger toggleFixedHeader function on DOMContentLoaded event', () => {
    const header = document.createElement('header');
    header.classList.add('fixed-header');
    document.body.appendChild(header);

    window.scrollY = 100;
    expect(header.classList.contains('fixed')).toBe(false); // Class should not contain 'fixed'

    window.dispatchEvent(new window.Event('DOMContentLoaded'));
    expect(header.classList.contains('fixed')).toBe(true); // Class should contain 'fixed'
  });
});
