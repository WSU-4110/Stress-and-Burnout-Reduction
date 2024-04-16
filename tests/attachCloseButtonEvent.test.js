const VideoModal = require('../scripts/videopage');

describe('VideoModal - attachCloseButtonEvent', () => {
    beforeEach(() => {
        // Mocking the DOM elements needed
        const closeButton = { onclick: null };

        document.getElementsByClassName = jest.fn().mockReturnValue([closeButton]);
        document.querySelectorAll = jest.fn().mockReturnValue([]); // Not used in this specific test.

        // Additional mocking to ensure no unintended executions
        document.getElementById = jest.fn().mockReturnValue({style: {}});
        global.fetch = jest.fn();  // Mock fetch as it might be called in class constructor or methods
    });

    it('sets onclick event on closeButton', () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        videoModal.attachCloseButtonEvent();

        expect(typeof videoModal.closeButton.onclick).toBe('function');
    });
});