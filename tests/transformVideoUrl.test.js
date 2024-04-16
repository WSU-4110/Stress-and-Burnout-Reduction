const VideoModal = require('../scripts/videopage');

describe('VideoModal - transformVideoUrl', () => {
    it('transforms YouTube watch URL to embed URL correctly', () => {
        // Mocking the DOM elements to provide necessary mock values
        document.getElementById = jest.fn(() => document.createElement('div'));
        document.getElementsByClassName = jest.fn(() => [document.createElement('button')]);
        document.querySelectorAll = jest.fn(() => [document.createElement('div')]);

        const videoModal = new VideoModal('dummyModalId', 'dummyVideoFrameId', 'dummyCloseButtonClass', 'dummyVideoCardClass');
        const inputUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const expectedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

        expect(videoModal.transformVideoUrl(inputUrl)).toBe(expectedUrl);
    });
});