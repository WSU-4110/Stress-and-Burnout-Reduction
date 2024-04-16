const VideoModal = require('../scripts/videopage');

describe('VideoModal - init', () => {
    beforeEach(() => {
        // Mock for document.getElementById
        document.getElementById = jest.fn((id) => {
             if (id === 'modal') return {
                 style: {
                     display: ''
                 }
             };
             if (id === 'videoFrame') return {
                 src: ''
             };
             return null;
        });

        // Mock for document.getElementsByClassName
        document.getElementsByClassName = jest.fn().mockReturnValue([
            {
                onclick: null,
            }
        ]);

        // Mock for document.querySelectorAll to mimic DOM nodes correctly
        document.querySelectorAll = jest.fn(selector => {
            if (selector === '.video-card') {
                return [
                    {
                        getAttribute: jest.fn(attr => {
                            if (attr === 'data-video-id') return 'video1';
                        }),
                        querySelector: jest.fn(selector => {
                            if (selector === '.like-btn') {
                                return {
                                    classList: {
                                        toggle: jest.fn(),
                                    },
                                    innerHTML: ''
                                };
                            }
                            if (selector === '.like-count') {
                                return {
                                    textContent: ''
                                };
                            }
                        })
                    }
                ];
            }
            return [];
        });
    });

    it('calls methods to attach event listeners', () => {
        // Setup
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        videoModal.attachVideoCardsEvents = jest.fn();
        videoModal.attachCloseButtonEvent = jest.fn();
        videoModal.attachWindowClickEvent = jest.fn();
        videoModal.attachLikeButtonEvents = jest.fn();
        videoModal.updateAllLikeStates = jest.fn();

        // Act
        videoModal.init();

        // Assert
        expect(videoModal.attachVideoCardsEvents).toHaveBeenCalled();
        expect(videoModal.attachCloseButtonEvent).toHaveBeenCalled();
        expect(videoModal.attachWindowClickEvent).toHaveBeenCalled();
        expect(videoModal.attachLikeButtonEvents).toHaveBeenCalled();
        expect(videoModal.updateAllLikeStates).toHaveBeenCalled();
    });
});