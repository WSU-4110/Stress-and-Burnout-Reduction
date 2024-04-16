const VideoModal = require('../scripts/videopage');

describe('VideoModal - transformVideoUrl', () => {
    it('transforms YouTube watch URL to embed URL correctly', () => {
        // Mocking the constructor parts that are not needed for this test
        document.getElementById = jest.fn();
        document.getElementsByClassName = jest.fn();
        document.querySelectorAll = jest.fn();

        // Test case for transformVideoUrl
        const videoModal = new VideoModal('dummyModalId', 'dummyVideoFrameId', 'dummyCloseButtonClass', 'dummyVideoCardClass');
        const inputUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const expectedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

        expect(videoModal.transformVideoUrl(inputUrl)).toBe(expectedUrl);
    });
});