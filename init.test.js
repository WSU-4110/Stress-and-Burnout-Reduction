import { VideoModal } from './videopage';

describe('VideoModal - init', () => {
  it('calls methods to attach event listeners', () => {
    // Setup
    const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
    videoModal.attachVideoCardsEvents = jest.fn();
    videoModal.attachCloseButtonEvent = jest.fn();
    videoModal.attachWindowClickEvent = jest.fn();

    // Act
    videoModal.init();

    // Assert
    expect(videoModal.attachVideoCardsEvents).toHaveBeenCalled();
    expect(videoModal.attachCloseButtonEvent).toHaveBeenCalled();
    expect(videoModal.attachWindowClickEvent).toHaveBeenCalled();
  });
});
