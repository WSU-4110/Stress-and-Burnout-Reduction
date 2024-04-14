import { onRequestPost } from '../functions/forum.js';

const mockEnv = {
  COOLFROG_FORUM: {
    put: jest.fn(),
  },
};

test('onRequestPost test', async () => {
  const mockRequest = {
    formData: jest.fn().mockResolvedValue({
      get: jest.fn(key => {
        if (key === 'postLocation') return null;
        if (key === 'postMeetingDate') return null;
        return 'Test Data';
      }),
    }),
  };
});

describe('onRequestPost test suite', () => {
  test('Test success verification', async () => {
    const response = await onRequestPost({ request: mockRequest, env: mockEnv });
    expect(mockEnv.COOLFROG_FORUM.put).toHaveBeenCalled();
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/forum');
  });
});