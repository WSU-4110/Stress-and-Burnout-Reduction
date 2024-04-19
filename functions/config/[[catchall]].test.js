import {
	onRequestGet,
	onRequestPost,
	renderConfigPage,
	renderProfilePage,
	renderEmailsPage,
	renderSessionsPage,
	updateProfile,
	addEmail,
	removeEmail,
	removeSession,
	removeAllSessions,
	getSessionCookie,
	unauthorizedResponse
} from './[[catchall]]';
import {
	jest
} from '@jest/globals';

function createMockRequest(url, method, cookies = '', body = {}) {
	return {
		url: `https://example.com${url}`,
		method,
		headers: {
			get: jest.fn((name) => {
				if (name === 'Cookie') return cookies;
				if (name === 'Content-Type') return 'application/json';
				return null;
			})
		},
		formData: () => Promise.resolve(new Map(Object.entries(body)))
	};
}

function createMockEnv() {
	return {
		COOLFROG_SESSIONS: {
			get: jest.fn((sessionId) => Promise.resolve(JSON.stringify({
				username: 'testuser'
			}))),
			delete: jest.fn(() => Promise.resolve()),
			put: jest.fn(() => Promise.resolve())
		},
		COOLFROG_USERS: {
			get: jest.fn((username) => Promise.resolve(JSON.stringify({
				username,
				pronouns: 'they/them',
				given_names: 'Jane',
				last_name: 'Doe',
				emails: [{
					email: 'jane@example.com',
					verified: true
				}],
				sessions: [{
					sessionId: 'session1',
					time_session_creation: Date.now() / 1000
				}]
			}))),
			put: jest.fn(() => Promise.resolve())
		},
		COOLFROG_EMAILS: {
			get: jest.fn(() => Promise.resolve('testuser')),
			put: jest.fn(() => Promise.resolve()),
			delete: jest.fn(() => Promise.resolve())
		}
	};
}

describe("HTTP request handling", () => {
	describe("onRequestGet", () => {
		it("should handle navigation to config pages correctly", async () => {
			const env = createMockEnv();
			let request = createMockRequest('/config', 'GET', 'session-id=valid123');
			env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
				username: 'user1'
			}));

			let response = await onRequestGet({
				request,
				env
			});
			expect(response.status).toBe(200);
			expect(await response.text()).toContain("Configuration Panel");

			request = createMockRequest('/config/profile', 'GET', 'session-id=valid123');
			response = await onRequestGet({
				request,
				env
			});
			expect(response.status).toBe(200);
			expect(await response.text()).toContain("Update Profile");
		});
	});

	describe("onRequestPost", () => {
		it("should handle user profile updates", async () => {
			const env = createMockEnv();
			const request = createMockRequest('/config/update-profile', 'POST', 'session-id=valid123', {
				pronouns: 'they/them',
				given_names: 'Jane',
				last_name: 'Doe'
			});
			env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
				username: 'user1'
			}));
			env.COOLFROG_USERS.put.mockResolvedValue();

			const response = await onRequestPost({
				request,
				env
			});
			expect(response.status).toBe(303);
			expect(response.headers.get('Location')).toBe('/config/profile');
		});
	});
});

describe("Rendering functions", () => {
	it("renders the configuration page correctly", async () => {
		const username = 'user1';
		const env = createMockEnv();
		env.COOLFROG_USERS.get.mockResolvedValue(JSON.stringify({
			username,
			pronouns: 'they/them',
			given_names: 'Jane',
			last_name: 'Doe',
			emails: [{
				email: 'jane@example.com',
				verified: true
			}],
			sessions: [{
				sessionId: 'session1',
				time_session_creation: 1622544000
			}]
		}));

		const response = await renderConfigPage(username, env);
		expect(response.headers.get('Content-Type')).toBe('text/html');
		const text = await response.text();
		expect(text).toContain("Configuration Panel");
	});
});

describe("Utility functions", () => {
	it("correctly extracts session IDs", () => {
		const request = createMockRequest('', '', 'session-id=12345');
		const sessionCookie = getSessionCookie(request);
		expect(sessionCookie).toBe("12345");
	});

	it("provides correct unauthorized response", () => {
		const response = unauthorizedResponse();
		expect(response.status).toBe(403);
		expect(response.headers.get('Content-Type')).toBe('text/plain');
	});
});

describe("renderProfilePage", () => {
	it("renders the profile page correctly", async () => {
		const env = createMockEnv();
		const username = 'user1';
		env.COOLFROG_USERS.get.mockResolvedValue(JSON.stringify({
			pronouns: 'they/them',
			given_names: 'Jane',
			last_name: 'Doe'
		}));

		const response = await renderProfilePage(username, env);
		expect(response.headers.get('Content-Type')).toBe('text/html');
		const text = await response.text();
		expect(text).toContain('Update Profile');
		expect(text).toContain('Jane');
		expect(text).toContain('Doe');
		expect(text).toContain('they/them');
	});
});

describe("renderEmailsPage", () => {
	it("renders the emails management page correctly", async () => {
		const env = createMockEnv();
		const username = 'user1';
		env.COOLFROG_USERS.get.mockResolvedValue(JSON.stringify({
			emails: [{
				email: 'jane@example.com',
				verified: true
			}]
		}));

		const response = await renderEmailsPage(username, env);
		expect(response.headers.get('Content-Type')).toBe('text/html');
		const text = await response.text();
		expect(text).toContain('Update Emails');
		expect(text).toContain('jane@example.com');
		expect(text).toContain('Verified');
	});
});

describe("renderSessionsPage", () => {
	it("renders the sessions management page correctly", async () => {
		const env = createMockEnv();
		const username = 'user1';
		env.COOLFROG_USERS.get.mockResolvedValue(JSON.stringify({
			sessions: [{
				sessionId: '123',
				time_session_creation: Date.now() / 1000
			}]
		}));

		const response = await renderSessionsPage(username, env);
		expect(response.headers.get('Content-Type')).toBe('text/html');
		const text = await response.text();
		expect(text).toContain('Manage Sessions');
		expect(text).toContain('123');
	});
});

describe("User Config Operations", () => {
	const env = createMockEnv();
	const username = 'user1';

	it("updates user profile successfully", async () => {
		env.COOLFROG_USERS.get.mockResolvedValue(JSON.stringify({
			username
		}));
		const response = await updateProfile('they/them', 'Jane', 'Doe', username, env);
		expect(env.COOLFROG_USERS.put).toHaveBeenCalled();
		expect(response.status).toBe(303);
	});

	it("adds a new email successfully", async () => {
		env.COOLFROG_USERS.get.mockResolvedValue(JSON.stringify({
			username,
			emails: []
		}));
		const response = await addEmail('new@example.com', username, env);
		expect(env.COOLFROG_EMAILS.put).toHaveBeenCalledWith('new@example.com', username);
		expect(response.status).toBe(303);
	});

	it("removes an email successfully", async () => {
		env.COOLFROG_USERS.get.mockResolvedValue(JSON.stringify({
			username,
			emails: [{
				email: 'old@example.com'
			}, {
				email: 'keep@example.com'
			}]
		}));
		const response = await removeEmail('old@example.com', username, env);
		expect(env.COOLFROG_EMAILS.delete).toHaveBeenCalledWith('old@example.com');
		expect(response.status).toBe(303);
	});

	it("removes a session successfully", async () => {
		env.COOLFROG_USERS.get.mockResolvedValue(JSON.stringify({
			username,
			sessions: [{
				sessionId: '123'
			}]
		}));
		const response = await removeSession('123', username, env);
		expect(env.COOLFROG_SESSIONS.delete).toHaveBeenCalledWith('123');
		expect(response.status).toBe(303);
	});

	it("removes all sessions successfully", async () => {
		const username = 'user1';
		const env = createMockEnv();
		env.COOLFROG_USERS.get.mockResolvedValue(JSON.stringify({
			username,
			sessions: [{
				sessionId: '123',
				time_session_creation: 1622544000
			}, {
				sessionId: '456',
				time_session_creation: 1622544001
			}]
		}));

		await removeAllSessions(username, env);
		expect(env.COOLFROG_SESSIONS.delete).toHaveBeenCalledTimes(2);
	});
});