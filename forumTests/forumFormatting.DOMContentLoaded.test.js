import { JSDOM } from 'jsdom';
import { toggleFixedHeader } from '../forumFormatting.js';

const { window } = new JSDOM('<!doctype html><html><body></body></html>');
global.window = window;

test('Test success verification', () => {
  const header = document.createElement('header');
  header.classList.add('fixed-header');
  document.body.appendChild(header);

  window.scrollY = 0; // Set scroll position to 0
  expect(header.classList.contains('fixed')).toBe(false); // Class should not contain 'fixed'

  window.dispatchEvent(new window.Event('DOMContentLoaded')); // Trigger DOMContentLoaded event
  expect(header.classList.contains('fixed')).toBe(false); // Class should still not contain 'fixed' after DOMContentLoaded
});

describe('DOMContentLoaded test suite', () => {
  test('Test success verification', () => {
    const header = document.createElement('header');
    header.classList.add('fixed-header');
    document.body.appendChild(header);

    window.scrollY = 100;
    expect(header.classList.contains('fixed')).toBe(false); // Class should not contain 'fixed'

    window.dispatchEvent(new window.Event('DOMContentLoaded'));
    expect(header.classList.contains('fixed')).toBe(true); // Class should contain 'fixed'
  });
});
