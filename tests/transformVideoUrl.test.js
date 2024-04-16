const VideoModal = require('../scripts/videopage');

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ likes: 10, liked: true })
  })
);

describe('VideoModal - transformVideoUrl', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('transforms YouTube watch URL to embed URL correctly', () => {
        // Mocking the necessary DOM elements
        document.getElementById = jest.fn(id => {
            if (id === 'dummyModalId') return document.createElement('div');
            if (id === 'dummyVideoFrameId') return document.createElement('iframe');
            return null;
        });
        document.getElementsByClassName = jest.fn((className) => {
            if (className === 'dummyCloseButtonClass') return [document.createElement('button')];
            return [];
        });
        document.querySelectorAll = jest.fn((selector) => {
            if (selector === 'dummyVideoCardClass') return [document.createElement('div')];
            return [];
        });

        const videoModal = new VideoModal('dummyModalId', 'dummyVideoFrameId', 'dummyCloseButtonClass', 'dummyVideoCardClass');
        const inputUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const expectedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

        expect(videoModal.transformVideoUrl(inputUrl)).toBe(expectedUrl);
        
        expect(fetch).not.toHaveBeenCalled();
    });
});