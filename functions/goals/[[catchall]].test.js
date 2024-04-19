import {
	onRequestGet,
	onRequestPost,
	onRequestDelete,
	renderPage,
	addTask,
	updateTask,
	deleteTask,
	addCategory,
	updateCategory,
	deleteCategory,
	resetCategory,
	getSessionCookie,
	unauthorizedResponse
} from './[[catchall]]';
import {
	jest
} from '@jest/globals';

function createMockRequest(method, url, cookies = '', body = {}) {
	return {
		method,
		url,
		headers: {
			get: jest.fn().mockImplementation(name => {
				return name === 'Cookie' ? cookies : null;
			})
		},
		formData: () => Promise.resolve(new Map(Object.entries(body)))
	};
}

function createMockFormData(data) {
	return {
		get: jest.fn().mockImplementation(key => data[key])
	};
}

function createMockEnv() {
	return {
		COOLFROG_SESSIONS: {
			get: jest.fn()
		},
		COOLFROG_GOALS: {
			prepare: jest.fn().mockReturnValue({
				bind: jest.fn().mockReturnThis(),
				all: jest.fn().mockResolvedValue({
					results: []
				}),
				run: jest.fn().mockResolvedValue(null)
			})
		}
	};
}

describe('HTTP Methods Handling', () => {
	const env = createMockEnv();
	env.COOLFROG_SESSIONS.get.mockResolvedValue(JSON.stringify({
		username: 'user1'
	}));

	it('GET requests serve pages correctly', async () => {
		const request = createMockRequest("GET", "https://example.com?view=default", 'session-id=validSession');
		const response = await onRequestGet({
			request,
			env
		});
		expect(response.headers.get('Content-Type')).toBe('text/html');
	});

	it('POST requests manipulate data correctly', async () => {
		const request = createMockRequest("POST", "https://example.com/goals/add-task", 'session-id=validSession', {
			description: 'New Task'
		});
		const response = await onRequestPost({
			request,
			env
		});
		expect(response.status).toBe(303);
	});

	it('DELETE requests remove data correctly', async () => {
		const request = createMockRequest("DELETE", "https://example.com/goals/delete-task/1", 'session-id=validSession');
		const response = await onRequestDelete({
			request,
			env
		});
		expect(response.status).toBe(204);
	});
});

describe('Task and Category Functions', () => {
	const env = createMockEnv();
	const username = 'user1';

	it('adds a task correctly', async () => {
		const formData = createMockFormData({
			description: 'New Task',
			due_date: '2023-01-01'
		});
		await addTask(formData, env, username);
		expect(env.COOLFROG_GOALS.prepare().run).toHaveBeenCalled();
	});

	it('updates a task correctly', async () => {
		const formData = createMockFormData({
			description: 'Updated Task',
			due_date: '2023-01-01'
		});
		await updateTask('1', formData, env, username);
		expect(env.COOLFROG_GOALS.prepare().run).toHaveBeenCalled();
	});

	it('deletes a task correctly', async () => {
		await deleteTask('1', env, username);
		expect(env.COOLFROG_GOALS.prepare().run).toHaveBeenCalled();
	});

	it('adds a category correctly', async () => {
		const formData = createMockFormData({
			name: 'New Category'
		});
		await addCategory(formData, env, username);
		expect(env.COOLFROG_GOALS.prepare().run).toHaveBeenCalled();
	});

	it('updates a category correctly', async () => {
		const formData = createMockFormData({
			name: 'Updated Category'
		});
		await updateCategory('2', formData, env, username);
		expect(env.COOLFROG_GOALS.prepare().run).toHaveBeenCalled();
	});

	it('resets a category correctly', async () => {
		await resetCategory('3', env, username);
		expect(env.COOLFROG_GOALS.prepare().run).toHaveBeenCalled();
	});

	it('deletes a category correctly', async () => {
		await deleteCategory('4', env, username);
		expect(env.COOLFROG_GOALS.prepare().run).toHaveBeenCalled();
	});
});

describe('Utility Functions', () => {
	it('getSessionCookie extracts session cookie correctly', () => {
		const request = createMockRequest("GET", "/", "session-id=12345; path=/; HttpOnly");
		const cookie = getSessionCookie(request);
		expect(cookie).toBe("12345");
	});

	it('unauthorizedResponse provides correct HTTP response', () => {
		const response = unauthorizedResponse();
		expect(response.status).toBe(403);
		expect(response.headers.get("Content-Type")).toBe("text/plain");
	});
});