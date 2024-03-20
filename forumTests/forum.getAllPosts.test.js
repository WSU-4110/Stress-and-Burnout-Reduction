import { getAllPosts } from '../functions/forum.js';

const mockEnv = {
  COOLFROG_FORUM: {
    list: jest.fn().mockResolvedValue({ keys: [{ name: 'post1' }, { name: 'post2' }] }),
    get: jest.fn().mockResolvedValue({ title: 'Test Post', content: 'Test Content' }),
  },
};

describe('getAllPosts', () => {
  test('should retrieve all posts from Cloudflare KV namespace', async () => {
    const result = await getAllPosts({ env: mockEnv });
    expect(result).toEqual([{ title: 'Test Post', content: 'Test Content' }, { title: 'Test Post', content: 'Test Content' }]);
  });
});
