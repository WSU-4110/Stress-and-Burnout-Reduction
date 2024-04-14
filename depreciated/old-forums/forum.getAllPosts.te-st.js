import {
	getAllPosts
} from '../functions/forum.js';

const mockEnv = {
	COOLFROG_FORUM: {
		list: jest.fn().mockResolvedValue({
			keys: [{
				name: 'post1'
			}, {
				name: 'post2'
			}]
		}),
		get: jest.fn().mockResolvedValue({
			title: 'Test Post',
			content: 'Test Content'
		}),
	},
};

test('getAllPosts test', async () => {
	const result = await getAllPosts({
		env: mockEnv
	});

	// Verify that getAllPosts returns an array
	expect(Array.isArray(result)).toBe(true);

	// Verify the length of the result array
	expect(result.length).toBe(2); // Since we mocked two posts in the environment

	// Verify the structure of each post in the result array
	expect(result[0]).toHaveProperty('title');
	expect(result[0]).toHaveProperty('content');
	expect(result[1]).toHaveProperty('title');
	expect(result[1]).toHaveProperty('content');
});

describe('getAllPosts test suite', () => {
	test('Test success verification', async () => {
		const result = await getAllPosts({
			env: mockEnv
		});
		expect(result).toEqual([{
			title: 'Test Post',
			content: 'Test Content'
		}, {
			title: 'Test Post',
			content: 'Test Content'
		}]);
	});
});