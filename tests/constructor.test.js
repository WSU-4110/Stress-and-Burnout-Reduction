const { VideoModal } = require('../scripts/videopage');

describe('VideoModal - constructor', () => {
  beforeEach(() => {
    // Mock DOM elements
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'modal') return { style: {} };
      if (id === 'videoFrame') return { src: '' };
    });
    document.getElementsByClassName = jest.fn().mockReturnValue([{ onclick: jest.fn() }]);
    document.querySelectorAll = jest.fn().mockReturnValue([{ addEventListener: jest.fn() }]);
  });

  it('initializes class properties correctly', () => {
    const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');

    expect(document.getElementById).toHaveBeenCalledWith('modal');
    expect(document.getElementById).toHaveBeenCalledWith('videoFrame');
    expect(document.getElementsByClassName).toHaveBeenCalledWith('close');
    expect(document.querySelectorAll).toHaveBeenCalledWith('.video-card');
    // Add assertions to check if the properties are correctly set if necessary
  });
});