import {
	JSDOM
} from 'jsdom';
import {
	togglePostFormVisibility
} from '../forumFormatting.js';

const {
	window
} = new JSDOM('<!doctype html><html><body></body></html>');
global.window = window;

test('togglePostFormVisibility test', () => {
	// Test success verification when hiding post form
	const postFormContainer = document.createElement('div');
	postFormContainer.classList.add('post-form-container');
	document.body.appendChild(postFormContainer);

	// Call togglePostFormVisibility with false to hide the post form
	togglePostFormVisibility(false);

	// Assert that the post form container's display property is 'none'
	expect(postFormContainer.style.display).toBe('none');
});

describe('togglePostFormVisibility test suite', () => {
	test('Test success verification', () => {
		const postFormContainer = document.createElement('div');
		postFormContainer.classList.add('post-form-container');
		document.body.appendChild(postFormContainer);
		togglePostFormVisibility(true);
		expect(postFormContainer.style.display).toBe('block');
	});
});