const { VideoModal } = require('./videopage');

describe('VideoModal - transformVideoUrl', () => {
  beforeEach(() => {
    document.getElementById = jest.fn().mockReturnValue({ style: {} });
    document.getElementsByClassName = jest.fn().mockReturnValue([{ onclick: jest.fn() }]);
    document.querySelectorAll = jest.fn().mockReturnValue([{ addEventListener: jest.fn() }]);
  });

  it('transforms URL correctly', () => {
    const videoModal = new VideoModal('dummyModalId', 'dummyVideoFrameId', 'dummyCloseButtonClass', 'dummyVideoCardClass');
    const inputUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const expectedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

    expect(videoModal.transformVideoUrl(inputUrl)).toBe(expectedUrl);
  });
});