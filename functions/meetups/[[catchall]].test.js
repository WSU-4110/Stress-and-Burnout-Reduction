import {
	onRequestGet,
	onRequestPost,
	renderForumsPage,
	renderTopicPage,
	addTopic,
	deleteTopic,
	addPost,
	deletePost,
	fetchTopicsByEmailGroup,
	fetchTopicById,
	fetchPostsForTopic,
	getSessionCookie,
	unauthorizedResponse
} from './[[catchall]]';
import {
	jest
} from '@jest/globals';

function createMockRequest(method, url, cookies = '', body = new Map()) {
	return {
		method,
		url: new URL(url),
		headers: {
			get: jest.fn((name) => {
				if (name === 'Cookie') return cookies;
				return null;
			})
		},
		formData: () => Promise.resolve(body)
	};
}

function createMockEnv() {
	const stmtMock = {
		bind: jest.fn().mockReturnThis(),
		all: jest.fn().mockResolvedValue({
			results: []
		}),
		run: jest.fn().mockResolvedValue(undefined)
	};

	return {
		COOLFROG_MEETUPS: {
			prepare: jest.fn(() => stmtMock)
		},
		COOLFROG_SESSIONS: {
			get: jest.fn()
		},
		COOLFROG_USERS: {
			get: jest.fn().mockResolvedValue(JSON.stringify({
				username: "testUser",
				emails: [{
						email: "test@example.com"
					},
					{
						email: "test@anotherexample.com"
					}
				]
			}))
		}
	};
}

describe('HTTP Request Handlers', () => {
	const env = createMockEnv();

	describe('GET Request Handler', () => {
		it('should return unauthorized response if no valid session', async () => {
			const request = createMockRequest("GET", "https://example.com/meetups", "");
			env.COOLFROG_SESSIONS.get.mockResolvedValueOnce(null);
			const response = await onRequestGet({
				request,
				env
			});
			expect(response.status).toBe(403);
		});



		it('should handle /meetups route correctly', async () => {
			const request = createMockRequest("GET", "https://example.com/meetups", "session-id=validSession");
			env.COOLFROG_SESSIONS.get = jest.fn((sessionId) => {
				if (sessionId === "validSession") {
					return Promise.resolve(JSON.stringify({
						username: "testUser"
					}));
				} else {
					return Promise.resolve(null);
				}
			});
			const response = await onRequestGet({
				request,
				env
			});
			expect(response.status).toBe(200); // Check for 200 OK status
			expect(response.headers.get('Content-Type')).toMatch(/html/); // The Content-Type should include html
		});

		it('should return 404 on unknown routes', async () => {
			const request = createMockRequest("GET", "https://example.com/unknown", "session-id=validSession");
			env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
				username: 'testUser'
			}));
			const response = await onRequestGet({
				request,
				env
			});
			expect(response.status).toBe(404);
		});
	});

	describe('POST Request Handler', () => {
		it('returns unauthorized response if no valid session', async () => {
			const request = createMockRequest("POST", "https://example.com/meetups/add-topic", "");
			env.COOLFROG_SESSIONS.get.mockResolvedValueOnce(null);
			const response = await onRequestPost({
				request,
				env
			});
			expect(response.status).toBe(403);
		});
	});
});

describe('Utility Functions', () => {
	it('getSessionCookie returns correct cookie', () => {
		const request = createMockRequest("GET", "https://example.com", "session-id=cookieValue");
		const cookie = getSessionCookie(request);
		expect(cookie).toBe('cookieValue');
	});

	it('unauthorizedResponse returns correct response', () => {
		const response = unauthorizedResponse();
		expect(response.status).toBe(403);
	});
});

describe('Database Interaction Functions', () => {
	const env = createMockEnv();
	const username = 'testUser';

	it('addTopic inserts topic into database', async () => {
		await addTopic('new meetup', 'test@example.com', 'A great meetup', 'Online', 'https://example-link.com', '2021-09-09T12:00', username, env);
		expect(env.COOLFROG_MEETUPS.prepare().run).toHaveBeenCalled();
	});

	it('deleteTopic deletes topic from database', async () => {
		await deleteTopic('topicId123', username, env);
		expect(env.COOLFROG_MEETUPS.prepare().run).toHaveBeenCalled();
	});

	it('addPost adds a post to a topic', async () => {
		await addPost('New Post Title', 'Post content', 'topicId123', username, env);
		expect(env.COOLFROG_MEETUPS.prepare().run).toHaveBeenCalled();
	});

	it('deletePost deletes a post', async () => {
		await deletePost('postId123', 'topicId123', username, env);
		expect(env.COOLFROG_MEETUPS.prepare().run).toHaveBeenCalled();
	});

	it('fetchTopicsByEmailGroup fetches topics by email group', async () => {
		await fetchTopicsByEmailGroup('example.com', env);
		expect(env.COOLFROG_MEETUPS.prepare().all).toHaveBeenCalled();
	});

	it('fetchTopicById fetches a single topic by ID', async () => {
		await fetchTopicById('topicId123', env);
		expect(env.COOLFROG_MEETUPS.prepare().all).toHaveBeenCalled();
	});

	it('fetchPostsForTopic fetches posts for a given topic ID', async () => {
		await fetchPostsForTopic('topicId123', env);
		expect(env.COOLFROG_MEETUPS.prepare().all).toHaveBeenCalled();
	});
});