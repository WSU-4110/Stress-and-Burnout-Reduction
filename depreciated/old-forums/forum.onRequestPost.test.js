import {
	onRequestPost
} from './forum.js';

import {
	jest
} from "@jest/globals";

const mockEnv = {
	COOLFROG_FORUM: {
		put: jest.fn(),
	},
};

const mockRequest = {
	formData: jest.fn().mockResolvedValue({
		get: jest.fn(key => {
			if (key === 'postLocation') return null;
			if (key === 'postMeetingDate') return null;
			return 'Test Data';
		}),
	}),
};

test('Test success verification', async () => {
	const response = await onRequestPost({
		request: mockRequest,
		env: mockEnv
	});
	expect(mockEnv.COOLFROG_FORUM.put).toHaveBeenCalled();
	expect(response.status).toBe(302);
	expect(response.headers.get('location')).toBe('/forum'); // Use get method and lower-case 'location'
});