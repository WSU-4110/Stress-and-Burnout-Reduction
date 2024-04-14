import {
	JSDOM
} from 'jsdom';
import {
	toggleFixedHeader
} from '../forumFormatting.js';

const {
	window
} = new JSDOM('<!doctype html><html><body></body></html>');
global.window = window;

test('toggleFixedHeader test', async () => {
	// Call the loginAndSignup function
	const result = loginAndSignup();
});

describe('toggleFixedHeader test suite', () => {
	test('Test success verification', () => {
		const header = document.createElement('header');
		header.classList.add('fixed-header');
		document.body.appendChild(header);
		window.scrollY = 100; // Example scroll position
		toggleFixedHeader();
		expect(header.classList.contains('fixed')).toBe(true);
	});
});