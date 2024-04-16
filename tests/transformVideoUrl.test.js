import fetch from "node-fetch";
const VideoModal = require('../scripts/videopage');

describe('VideoModal', () => {
    beforeEach(() => {
        // Mock functionality for document.getElementById
        document.getElementById = jest.fn().mockReturnValue({
            style: {}
        });

        // Mock functionality for document.getElementsByClassName
        document.getElementsByClassName = jest.fn().mockReturnValue([{
            onclick: jest.fn()
        }]);

        // Mock functionality for document.querySelectorAll that includes necessary methods like getAttribute
        document.querySelectorAll = jest.fn().mockReturnValue([{
            getAttribute: jest.fn().mockImplementation(name => {
                if (name === 'data-video-id') return '123';
                if (name === 'data-video-url') return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            }),
            querySelector: jest.fn().mockReturnValue({
                textContent: '',
                innerHTML: '',
                classList: {
                    toggle: jest.fn()
                }
            }),
            addEventListener: jest.fn()
        }]);
    });

    describe('transformVideoUrl', () => {
        it('transforms YouTube video URLs correctly', () => {
            const videoModal = new VideoModal('modalId', 'videoFrameId', 'closeBtnClass', '.video-card');
            const inputUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            const expectedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
            expect(videoModal.transformVideoUrl(inputUrl)).toEqual(expectedUrl);
        });
    });
});