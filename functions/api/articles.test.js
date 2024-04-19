import {
	onRequest,
	setArticleRating,
	getArticleRating,
	getSessionIdFromRequest
} from './articles';
import {
	jest
} from '@jest/globals';

function createMockRequest(method, cookies = '', body = null, url = 'https://example.com/api/articles') {
	return {
		method,
		headers: {
			get: jest.fn().mockImplementation(name => {
				if (name === 'Cookie') return cookies;
				return null;
			})
		},
		url,
		json: jest.fn().mockResolvedValue(body)
	};
}

function createMockEnv() {
	return {
		COOLFROG_SESSIONS: {
			get: jest.fn()
		},
		COOLFROG_ARTICLES: {
			get: jest.fn(),
			put: jest.fn()
		}
	};
}

describe('onRequest', () => {
	it('should return 404 for incorrect paths', async () => {
		const request = createMockRequest('GET', '', null, 'https://example.com/api/invalidroute');
		const response = await onRequest({
			request,
			env: {}
		});
		expect(response.status).toBe(404);
	});

	it('should return 405 for unsupported methods on the articles API', async () => {
		const request = createMockRequest('DELETE');
		const response = await onRequest({
			request,
			env: {}
		});
		expect(response.status).toBe(405);
	});

	it('should delegate to setArticleRating for POST requests', async () => {
		const request = createMockRequest('POST', 'session-id=123', {
			articleId: '42',
			rating: 5
		});
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: 'user1'
		}));
		const response = await onRequest({
			request,
			env
		});
		expect(env.COOLFROG_ARTICLES.put).toHaveBeenCalled();
		expect(response.status).toBe(204);
	});

	it('should delegate to getArticleRating for GET requests', async () => {
		const request = createMockRequest('GET', 'session-id=123', null, 'https://example.com/api/articles?articleId=42');
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: 'user1'
		}));
		env.COOLFROG_ARTICLES.get.mockResolvedValue(JSON.stringify({
			'42': 5
		}));
		const response = await onRequest({
			request,
			env
		});
		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.rating).toBe(5);
	});
});

describe('setArticleRating', () => {
	it('stores article rating correctly', async () => {
		const request = createMockRequest('POST', 'session-id=123', {
			articleId: '42',
			rating: 5
		});
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: 'user1'
		}));
		const response = await setArticleRating(request, env);
		expect(env.COOLFROG_ARTICLES.put).toHaveBeenCalledWith('user1', JSON.stringify({
			'42': 5
		}));
		expect(response.status).toBe(204);
	});
});

describe('getArticleRating', () => {
	it('retrieves article rating correctly', async () => {
		const request = createMockRequest('GET', 'session-id=123', null, 'https://example.com/api/articles?articleId=42');
		const env = createMockEnv();
		env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
			username: 'user1'
		}));
		env.COOLFROG_ARTICLES.get.mockResolvedValue(JSON.stringify({
			'42': 5
		}));
		const response = await getArticleRating(request, env);
		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.rating).toBe(5);
	});
});

describe('getSessionIdFromRequest', () => {
	it('should correctly extract the session ID from request cookies when present', () => {
		const request = createMockRequest('GET', 'other=abc; session-id=12345; something=else');
		const {
			sessionId
		} = getSessionIdFromRequest(request); // Destructure to directly get sessionId
		expect(sessionId).toBe('12345');
	});

	it('should return an empty object when the session ID is not present', () => {
		const request = createMockRequest('GET', 'other=abc; something=else');
		const sessionData = getSessionIdFromRequest(request);
		expect(sessionData).toEqual({});
	});

	it('should return an empty object when there are no cookies', () => {
		const request = createMockRequest('GET');
		const sessionData = getSessionIdFromRequest(request);
		expect(sessionData).toEqual({});
	});
});