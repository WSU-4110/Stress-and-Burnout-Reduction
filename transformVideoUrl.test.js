import { VideoModal } from './videopage';

describe('VideoModal - transformVideoUrl', () => {
  it('transforms URL correctly', () => {
    const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
    const inputUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const expectedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

    expect(videoModal.transformVideoUrl(inputUrl)).toBe(expectedUrl);
  });
});
