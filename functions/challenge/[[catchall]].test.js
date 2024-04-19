import {
	onRequestGet,
	onRequestPost,
	renderChallengesPage,
	renderChallengeTopicPage,
	addTopic,
	deleteTopic,
	acceptChallenge,
	updateChallengeStatus,
	getSessionCookie,
	unauthorizedResponse,
	fetchTopics,
	fetchTopicById,
	fetchPostsForTopic,
	fetchPostsForUser
} from './[[catchall]]';
import {
	jest
} from '@jest/globals';

function createMockRequest(url, method = 'GET', cookies = '', body = new Map()) {
	return {
		url,
		method,
		headers: {
			get: jest.fn().mockImplementation(name => {
				if (name === 'Cookie') return cookies;
				return null;
			})
		},
		formData: () => Promise.resolve(body)
	};
}

function createMockEnv() {
	return {
		COOLFROG_SESSIONS: {
			get: jest.fn()
		},
		COOLFROG_CHALLENGES: {
			prepare: jest.fn().mockReturnValue({
				all: jest.fn().mockResolvedValue({
					results: [{
						title: 'Dummy Topic',
						username: 'testuser',
						id: '123'
					}]
				}),
				bind: jest.fn().mockReturnThis(),
				run: jest.fn().mockResolvedValue(null)
			})
		}
	};
}

describe("HTTP GET request handling", () => {
	it("renders the challenges page for an authenticated user", async () => {
		const request = createMockRequest("https://example.com/challenge", 'GET', 'session-id=valid');
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: 'testuser'
		}));

		const response = await onRequestGet({
			request,
			env
		});
		expect(response.headers.get("Content-Type")).toBe("text/html");
	});

	it("renders a specific challenge page for an authenticated user", async () => {
		const request = createMockRequest("https://example.com/challenge/topic/123", 'GET', 'session-id=valid');
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: 'testuser'
		}));

		const response = await onRequestGet({
			request,
			env
		});
		expect(response.headers.get("Content-Type")).toBe("text/html");
		const text = await response.text();
		expect(text).toContain("Challenges in Dummy Topic");
	});
});

describe("HTTP POST request handling", () => {
	it("adds a new topic when authenticated", async () => {
		const request = createMockRequest("https://example.com/challenge/add-topic", 'POST', 'session-id=valid', new Map([
			['title', 'New Challenge']
		]));
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: 'testuser'
		}));

		const response = await onRequestPost({
			request,
			env
		});
		expect(response.status).toBe(303);
		expect(response.headers.get('Location')).toBe('/challenge');
	});

	it("deletes a topic when authenticated", async () => {
		const request = createMockRequest("https://example.com/challenge/delete-topic/123", 'POST', 'session-id=valid');
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: 'testuser'
		}));

		const response = await onRequestPost({
			request,
			env
		});
		expect(response.status).toBe(204);
	});

	it("accepts a challenge when authenticated", async () => {
		const request = createMockRequest("https://example.com/challenge/topic/123/accept-challenge", 'POST', 'session-id=valid');
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: 'testuser'
		}));

		const response = await onRequestPost({
			request,
			env
		});
		expect(response.status).toBe(303);
		expect(response.headers.get('Location')).toContain('/challenge/topic/123');
	});

	it("updates challenge status when authenticated", async () => {
		const request = createMockRequest("https://example.com/challenge/topic/123/complete-challenge", 'POST', 'session-id=valid', new Map([
			['post_id', 'post123']
		]));
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: 'testuser'
		}));

		const response = await onRequestPost({
			request,
			env
		});
		expect(response.status).toBe(204);
	});
});

describe("Utility Functions", () => {
	it("correctly identifies session cookie", () => {
		const request = createMockRequest("", "", "session-id=12345");
		const cookie = getSessionCookie(request);
		expect(cookie).toBe("12345");
	});

	it("returns unauthorized response when the session is invalid", () => {
		const response = unauthorizedResponse();
		expect(response.status).toBe(403);
		expect(response.text()).resolves.toBe("Unauthorized - Please log in.");
	});
});

describe('Database Interaction Functions', () => {
	const mockTopics = [{
			id: '1',
			title: 'Topic One',
			username: 'user1'
		},
		{
			id: '2',
			title: 'Topic Two',
			username: 'user2'
		}
	];

	const mockPosts = [{
		id: 'post1',
		topic_id: '1',
		username: 'user1',
		title: 'Post One',
		status: 'active',
		post_date: '2021-06-01'
	}];

	let env;

	beforeEach(() => {
		env = createMockEnv();
	});

	it('fetchTopics should fetch all topics sorted by title', async () => {
		env.COOLFROG_CHALLENGES.prepare.mockReturnValue({
			all: jest.fn().mockResolvedValue({
				results: mockTopics
			})
		});

		const topics = await fetchTopics(env);
		expect(topics).toEqual(mockTopics);
		expect(env.COOLFROG_CHALLENGES.prepare).toHaveBeenCalledWith("SELECT id, title, username FROM topics ORDER BY title");
		expect(env.COOLFROG_CHALLENGES.prepare().all).toHaveBeenCalled();
	});

	it('fetchTopicById should fetch a specific topic by id', async () => {
		const topicId = '1';
		env.COOLFROG_CHALLENGES.prepare.mockReturnValue({
			bind: jest.fn().mockReturnThis(),
			all: jest.fn().mockResolvedValue({
				results: [mockTopics[0]]
			})
		});

		const topic = await fetchTopicById(topicId, env);
		expect(topic).toEqual([mockTopics[0]]);
		expect(env.COOLFROG_CHALLENGES.prepare).toHaveBeenCalledWith("SELECT id, title, username FROM topics WHERE id = ?");
		expect(env.COOLFROG_CHALLENGES.prepare().bind).toHaveBeenCalledWith(topicId);
		expect(env.COOLFROG_CHALLENGES.prepare().all).toHaveBeenCalled();
	});

	it('fetchPostsForTopic should fetch all posts for a specific topic', async () => {
		const topicId = '1';
		env.COOLFROG_CHALLENGES.prepare.mockReturnValue({
			bind: jest.fn().mockReturnThis(),
			all: jest.fn().mockResolvedValue({
				results: mockPosts
			})
		});

		const posts = await fetchPostsForTopic(topicId, env);
		expect(posts).toEqual(mockPosts);
		expect(env.COOLFROG_CHALLENGES.prepare).toHaveBeenCalledWith("SELECT id, topic_id, username, title, status, post_date FROM posts WHERE topic_id = ? ORDER BY post_date DESC");
		expect(env.COOLFROG_CHALLENGES.prepare().bind).toHaveBeenCalledWith(topicId);
		expect(env.COOLFROG_CHALLENGES.prepare().all).toHaveBeenCalled();
	});

	it('fetchPostsForUser should fetch all posts for a specific user', async () => {
		const username = 'user1';
		env.COOLFROG_CHALLENGES.prepare.mockReturnValue({
			bind: jest.fn().mockReturnThis(),
			all: jest.fn().mockResolvedValue({
				results: mockPosts
			})
		});

		const posts = await fetchPostsForUser(username, env);
		expect(posts).toEqual(mockPosts);
		expect(env.COOLFROG_CHALLENGES.prepare).toHaveBeenCalled();
		expect(env.COOLFROG_CHALLENGES.prepare().bind).toHaveBeenCalledWith(username);
		expect(env.COOLFROG_CHALLENGES.prepare().all).toHaveBeenCalled();
	});
});