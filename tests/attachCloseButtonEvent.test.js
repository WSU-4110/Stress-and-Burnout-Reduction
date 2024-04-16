const VideoModal = require('../scripts/videopage');

describe('VideoModal - attachCloseButtonEvent', () => {
    beforeEach(() => {
        // Mock the DOM elements for modal and videoFrame
        const modal = { style: {} };
        const videoFrame = {};

        // Mock the DOM element for closeButton
        const closeButton = {
            onclick: null
        };

        // Mocking video cards
        const videoCards = [
            {
                getAttribute: jest.fn(),
                querySelector: jest.fn(),
                addEventListener: jest.fn()
            },
            {
                getAttribute: jest.fn(),
                querySelector: jest.fn(),
                addEventListener: jest.fn()
            },
        ];

        // Mock relevant document methods
        document.getElementById = jest.fn((id) => {
            if (id === 'modal') return modal;
            if (id === 'videoFrame') return videoFrame;
            return null;
        });
        document.getElementsByClassName = jest.fn().mockReturnValue([closeButton]);
        document.querySelectorAll = jest.fn().mockReturnValue(videoCards);
    });

    it('sets onclick event on closeButton', () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        videoModal.attachCloseButtonEvent();
        expect(typeof videoModal.closeButton.onclick).toBe('function');
    });
});