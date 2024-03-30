const { VideoModal } = require('./videopage');

describe('VideoModal - attachCloseButtonEvent', () => {
  beforeEach(() => {
    // Mock the DOM element for closeButton
    const closeButton = { onclick: null };

    // Mocking video cards
    const videoCards = [
      { addEventListener: jest.fn() },
      { addEventListener: jest.fn() },
    ];

    document.getElementsByClassName = jest.fn().mockReturnValue([closeButton]);
    
    document.querySelectorAll = jest.fn().mockReturnValue(videoCards);
  });

  it('sets onclick event on closeButton', () => {
    const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
    videoModal.attachCloseButtonEvent();

    expect(typeof videoModal.closeButton.onclick).toBe('function');
  });
});

