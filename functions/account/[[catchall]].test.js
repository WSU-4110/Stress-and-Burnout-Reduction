import {
	onRequestGet,
	renderAccountPage,
	unauthorizedResponse,
	getSessionCookie,
	generateChallengeHtml,
	getChallengesWithMostActiveMembers,
	fetchPostsForUserInTopic
} from './[[catchall]]';
import {
	jest
} from '@jest/globals';

function createMockRequest(url, method = 'GET', cookies = '') {
	return {
		url,
		method,
		headers: {
			get: jest.fn().mockImplementation(name => {
				if (name === 'Cookie') return cookies;
				return null;
			})
		}
	};
}

function createMockEnv() {
	return {
		COOLFROG_SESSIONS: {
			get: jest.fn()
		},
		COOLFROG_CHALLENGES: {
			prepare: jest.fn().mockImplementation(() => {
				return {
					all: jest.fn().mockResolvedValue({
						results: []
					}),
					bind: jest.fn().mockReturnThis(),
					run: jest.fn().mockResolvedValue(null)
				};
			})
		}
	};
}

describe("onRequestGet", () => {
	it("should return unauthorized response if session cookie is missing", async () => {
		const request = createMockRequest("https://example.com/account", "GET");
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(null);

		const response = await onRequestGet({
			request,
			env
		});
		expect(response.status).toBe(403);
		expect(await response.text()).toBe("Unauthorized - Please log in.");
	});

	it("should return 404 if path is incorrect", async () => {
		const request = createMockRequest("https://example.com/unknownPath", "GET", 'session-id=valid');
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: 'user'
		}));

		const response = await onRequestGet({
			request,
			env
		});
		expect(response.status).toBe(404);
	});

	it("should handle account page rendering correctly", async () => {
		const request = createMockRequest("https://example.com/account", "GET", 'session-id=valid');
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: 'user'
		}));

		const response = await onRequestGet({
			request,
			env
		});
		expect(response.headers.get("Content-Type")).toBe("text/html");
	});
});

describe("renderAccountPage", () => {
	it("should render account page HTML correctly", async () => {
		const username = "testuser";
		const env = createMockEnv();
		const response = await renderAccountPage(username, env);
		expect(response.headers.get("Content-Type")).toBe("text/html");
	});
});

describe("getSessionCookie", () => {
	it("should extract session cookie correctly", () => {
		const request = createMockRequest("https://example.com/account", "GET", "session-id=abc123; other=value");
		const cookie = getSessionCookie(request);
		expect(cookie).toBe("abc123");
	});

	it("should return null if no session cookie is present", () => {
		const request = createMockRequest("https://example.com/account", "GET");
		const cookie = getSessionCookie(request);
		expect(cookie).toBeNull();
	});
});

describe("unauthorizedResponse", () => {
	it("should return the correct unauthorized response", () => {
		const response = unauthorizedResponse();
		expect(response.status).toBe(403);
		expect(response.headers.get("Content-Type")).toBe("text/plain");
	});
});

describe("renderAccountPage extended tests", () => {
	it("handles multiple challenges correctly", async () => {
		const username = "testuser";
		const env = createMockEnv();
		const fakeChallenges = [{
				id: '1',
				title: 'Weekly Challenge',
				members: 20
			},
			{
				id: '2',
				title: 'Daily Challenge',
				members: 15
			}
		];
		env.COOLFROG_CHALLENGES.prepare.mockImplementation(() => ({
			all: jest.fn().mockResolvedValue({
				results: fakeChallenges
			}),
			bind: jest.fn().mockReturnThis()
		}));
		const response = await renderAccountPage(username, env);
		expect(response.headers.get("Content-Type")).toBe("text/html");
		const html = await response.text();
		expect(html).toContain("Weekly Challenge");
		expect(html).toContain("Daily Challenge");
	});
});

describe("generateChallengeHtml tests", () => {
	it("renders the accept challenge button for new challenges", async () => {
		const env = createMockEnv();
		const challenge = {
			id: "1",
			title: "New Year Challenge"
		};
		env.COOLFROG_CHALLENGES.prepare.mockImplementation(() => ({
			all: jest.fn().mockResolvedValue({
				results: []
			}),
			bind: jest.fn().mockReturnThis()
		}));
		const html = await generateChallengeHtml(challenge, "testuser", env);
		expect(html).toContain("Accept Challenge");
	});
});

describe("fetchPostsForUserInTopic", () => {
	it("retrieves posts for a specific user and topic", async () => {
		const username = "testuser";
		const topicId = "123";
		const env = createMockEnv();
		const mockPosts = [{
			id: "post1",
			topic_id: topicId,
			username: username,
			title: "Post Title",
			status: "active"
		}];
		env.COOLFROG_CHALLENGES.prepare.mockReturnValue({
			bind: jest.fn().mockReturnThis(),
			all: jest.fn().mockResolvedValue({
				results: mockPosts
			})
		});

		const posts = await fetchPostsForUserInTopic(username, topicId, env);
		expect(posts).toEqual(mockPosts);
		expect(env.COOLFROG_CHALLENGES.prepare).toHaveBeenCalled();
		expect(env.COOLFROG_CHALLENGES.prepare().bind).toHaveBeenCalledWith(username, topicId);
		expect(env.COOLFROG_CHALLENGES.prepare().all).toHaveBeenCalled();
	});
});

describe("getChallengesWithMostActiveMembers", () => {
	it("retrieves challenges sorted by active member count", async () => {
		const env = createMockEnv();
		const mockChallenges = [{
				id: "1",
				title: "Challenge 1",
				activeCount: 20
			},
			{
				id: "2",
				title: "Challenge 2",
				activeCount: 15
			}
		];
		env.COOLFROG_CHALLENGES.prepare.mockReturnValue({
			all: jest.fn().mockResolvedValue({
				results: mockChallenges
			})
		});

		const challenges = await getChallengesWithMostActiveMembers(env);
		expect(challenges).toEqual(mockChallenges);
		expect(env.COOLFROG_CHALLENGES.prepare).toHaveBeenCalled();
		expect(env.COOLFROG_CHALLENGES.prepare().all).toHaveBeenCalled();
	});
});