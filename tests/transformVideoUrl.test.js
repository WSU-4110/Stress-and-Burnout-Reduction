const VideoModal = require('../scripts/videopage');

// Mock fetch globally
global.fetch = jest.fn();

describe('VideoModal - transformVideoUrl', () => {
    beforeEach(() => {
        // Clear all mocks before each test to ensure clean slate
        jest.clearAllMocks();

        // Mock required DOM elements
        document.getElementById = jest.fn(() => document.createElement('div'));
        document.getElementsByClassName = jest.fn(() => [document.createElement('button')]);
        document.querySelectorAll = jest.fn(() => [document.createElement('div')]);
    });

    it('transforms YouTube watch URL to embed URL correctly', () => {
        const videoModal = new VideoModal('dummyModalId', 'dummyVideoFrameId', 'dummyCloseButtonClass', 'dummyVideoCardClass');
        const inputUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const expectedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

        expect(videoModal.transformVideoUrl(inputUrl)).toBe(expectedUrl);
    });
});