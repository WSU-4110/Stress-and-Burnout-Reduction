const VideoModal = require('../scripts/videopage');

describe('VideoModal - General Functionality', () => {
  let videoModal;
  let mockVideoCards;

  beforeEach(() => {
    // Mock DOM elements required by VideoModal
    document.getElementById = jest.fn((id) => {
      if (id === 'modal') return { style: {} };
      if (id === 'videoFrame') return { src: '' };
      return null;
    });

    document.getElementsByClassName = jest.fn(() => [
      { onclick: null }, // mock for closeButton
    ]);

    // Enhance videoCard mocks to include necessary functions and attributes
    mockVideoCards = [
      {
        addEventListener: jest.fn(),
        getAttribute: jest.fn().mockReturnValue('some-video-id'),
        querySelector: jest.fn().mockReturnValue({
          textContent: '',
          classList: { toggle: jest.fn() },
          innerHTML: ''
        })
      },
      {
        addEventListener: jest.fn(),
        getAttribute: jest.fn().mockReturnValue('another-video-id'),
        querySelector: jest.fn().mockReturnValue({
          textContent: '',
          classList: { toggle: jest.fn() },
          innerHTML: ''
        })
      },
    ];
    
    document.querySelectorAll = jest.fn().mockReturnValue(mockVideoCards);

    videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
  });

  describe('attachCloseButtonEvent', () => {
    it('sets onclick event on closeButton', () => {
      videoModal.attachCloseButtonEvent();
      expect(typeof videoModal.closeButton.onclick).toBe('function');
    });
  });
});