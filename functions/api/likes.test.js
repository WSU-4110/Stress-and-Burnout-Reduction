import {
	onRequest,
	toggleLike,
	getLikes,
	getSessionIdFromRequest
} from './likes';
import {
	jest
} from '@jest/globals';

function createMockRequest(method, cookies = '', body = null) {
	return {
		method,
		headers: {
			get: jest.fn().mockImplementation(name => {
				if (name === 'Cookie') {
					return cookies;
				}
				return null;
			})
		},
		url: `https://example.com/api/likes${body && method === 'GET' ? `?videoId=${body.videoId}` : ''}`,
		json: jest.fn().mockResolvedValue(body)
	};
}

function createMockEnv() {
	return {
		COOLFROG_SESSIONS: {
			get: jest.fn()
		},
		COOLFROG_LIKES: {
			get: jest.fn(),
			put: jest.fn()
		}
	};
}

describe('onRequest', () => {
	it('returns 404 for non-API routes', async () => {
		const request = createMockRequest('GET');
		request.url = 'https://example.com/notapi/likes';
		const response = await onRequest({
			request,
			env: {}
		});
		expect(response.status).toBe(404);
	});

	it('returns 405 for unsupported methods', async () => {
		const request = createMockRequest('DELETE');
		const response = await onRequest({
			request,
			env: {}
		});
		expect(response.status).toBe(405);
	});

	it('delegates to toggleLike for POST requests', async () => {
		const request = createMockRequest('POST', 'session-id=123', {
			videoId: 'video1'
		});
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: 'user1'
		}));
		env.COOLFROG_LIKES.get.mockImplementation((key) => {
			if (key === 'user1') return Promise.resolve('{}');
			if (key === '__video1') return Promise.resolve('0');
			return Promise.resolve(null);
		});
		const response = await onRequest({
			request,
			env
		});
		expect(env.COOLFROG_LIKES.put).toHaveBeenCalled();
		const responseData = await response.json();
		expect(responseData.likes).toEqual(1);
		expect(responseData.liked).toBe(true);
	});

	it('delegates to getLikes for GET requests', async () => {
		const request = createMockRequest('GET', 'session-id=123', {
			videoId: 'video1'
		});
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: 'user1'
		}));
		env.COOLFROG_LIKES.get.mockResolvedValue('10');
		const response = await onRequest({
			request,
			env
		});
		expect(env.COOLFROG_LIKES.get).toHaveBeenCalledWith('__video1');
		const responseJson = await response.json();
		expect(responseJson.likes).toBe(10);
	});
});

describe('toggleLike', () => {
	it('handles likes toggling', async () => {
		const request = createMockRequest('POST', 'session-id=123', {
			videoId: 'video1'
		});
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: 'user1'
		}));
		env.COOLFROG_LIKES.get.mockResolvedValue('{}');
		const response = await toggleLike(request, env);
		expect(env.COOLFROG_LIKES.put).toHaveBeenCalledTimes(2);
		const responseData = await response.json();
		expect(responseData.liked).toBe(true);
		expect(responseData.likes).toBe(1);
	});
});

describe('getLikes', () => {
	it('returns correct likes data', async () => {
		const request = createMockRequest('GET', 'session-id=123', {
			videoId: 'video1'
		});
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: 'user1'
		}));
		env.COOLFROG_LIKES.get.mockResolvedValue('{"video1":true}');
		const response = await getLikes(request, env);
		const responseData = await response.json();
		expect(responseData.liked).toBe(true);
		expect(env.COOLFROG_LIKES.get).toHaveBeenCalledWith('user1');
	});
});

describe('getSessionIdFromRequest', () => {
	it('should correctly extract the session ID from request cookies when present', () => {
		const request = {
			headers: {
				get: jest.fn().mockReturnValue('session-id=12345; other=value')
			}
		};
		const sessionIdData = getSessionIdFromRequest(request);
		expect(sessionIdData).toEqual({
			sessionId: '12345'
		});
	});

	it('should return an empty object when the session ID is not present', () => {
		const request = {
			headers: {
				get: jest.fn().mockReturnValue('other=abc; something=else')
			}
		};
		const sessionIdData = getSessionIdFromRequest(request);
		expect(sessionIdData).toEqual({});
	});

	it('should return an empty object when cookies are not present', () => {
		const request = {
			headers: {
				get: jest.fn().mockReturnValue(null)
			}
		};
		const sessionIdData = getSessionIdFromRequest(request);
		expect(sessionIdData).toEqual({});
	});
});