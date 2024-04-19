import {
	onRequestGet,
	getSessionCookie,
	unauthorizedResponse
} from './leaderboard';
import {
	jest
} from '@jest/globals';

function createMockRequest(headers = {}, cookie = '') {
	return {
		headers: {
			get: jest.fn().mockImplementation(name => {
				if (name === 'Cookie') return cookie;
				return headers[name];
			})
		}
	};
}

function createMockEnv() {
	return {
		COOLFROG_SESSIONS: {
			get: jest.fn()
		},
		COOLFROG_LEADERBOARD: {
			get: jest.fn(),
			list: jest.fn()
		}
	};
}

describe("onRequestGet", () => {
	it("should return unauthorized response if no session cookie is present", async () => {
		const request = createMockRequest();
		const env = createMockEnv();
		const result = await onRequestGet({
			request,
			env
		});
		expect(result.status).toBe(403);
		expect(await result.text()).toBe("Unauthorized - Please log in.");
	});

	it("should return a populated leaderboard when session is valid", async () => {
		const request = createMockRequest({}, 'session-id=valid-session-id');
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: "user1"
		}));
		env.COOLFROG_LEADERBOARD.list.mockResolvedValue({
			keys: [{
				name: "user1"
			}, {
				name: "user2"
			}]
		});
		env.COOLFROG_LEADERBOARD.get.mockImplementation(name => Promise.resolve(name === "user1" ? "2" : "1"));

		const result = await onRequestGet({
			request,
			env
		});

		expect(result.headers.get('Content-Type')).toBe('text/html');
		const responseBody = await result.text();
		expect(responseBody).toContain("Login Streak Leaderboard");
		expect(responseBody).toContain("user1");
		expect(responseBody).toContain("user2");
	});
});

describe("getSessionCookie", () => {
	it("should return the session id from cookie", () => {
		const request = createMockRequest({}, 'session-id=abc123; other-cookie=value');
		expect(getSessionCookie(request)).toBe('abc123');
	});

	it("should return null if no session cookie is present", () => {
		const request = createMockRequest();
		expect(getSessionCookie(request)).toBeNull();
	});
});

describe("unauthorizedResponse", () => {
	it("should return a response indicating the user is unauthorized", () => {
		const result = unauthorizedResponse();
		expect(result.status).toBe(403);
		expect(result.headers.get('Content-Type')).toBe('text/plain');
		expect(result.text()).resolves.toBe("Unauthorized - Please log in.");
	});
});