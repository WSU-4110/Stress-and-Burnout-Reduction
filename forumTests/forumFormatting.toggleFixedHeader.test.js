import { JSDOM } from 'jsdom';
import { toggleFixedHeader } from '../forumFormatting.js';

const { window } = new JSDOM('<!doctype html><html><body></body></html>');
global.window = window;

describe('toggleFixedHeader', () => {
  test('should add "fixed" class when scroll position is greater than header offset', () => {
    const header = document.createElement('header');
    header.classList.add('fixed-header');
    document.body.appendChild(header);
    window.scrollY = 100; // Example scroll position
    toggleFixedHeader();
    expect(header.classList.contains('fixed')).toBe(true);
  });
});
