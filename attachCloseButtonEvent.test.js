import { VideoModal } from './videopage';

describe('VideoModal - attachCloseButtonEvent', () => {
  it('sets onclick event on closeButton', () => {
    const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
    videoModal.closeModal = jest.fn();

    videoModal.attachCloseButtonEvent();

    expect(typeof videoModal.closeButton.onclick).toBe('function');
  });
});
