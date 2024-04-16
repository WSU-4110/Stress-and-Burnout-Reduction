const VideoModal = require('../scripts/videopage');

describe('VideoModal - constructor', () => {
    beforeEach(() => {
        // Mock DOM elements
        document.getElementById = jest.fn().mockImplementation((id) => {
            if (id === 'modal') return {
                style: {}
            };
            if (id === 'videoFrame') return {
                src: ''
            };
        });
        document.getElementsByClassName = jest.fn().mockReturnValue([{
            onclick: jest.fn()
        }]);

        // Improved mock with getAttribute method and addEventListener
        document.querySelectorAll = jest.fn().mockReturnValue([{
            addEventListener: jest.fn(),
            getAttribute: jest.fn().mockReturnValue('some-video-id') // Mock return value for 'data-video-id'
        }]);
    });

    it('initializes class properties correctly', () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');

        expect(document.getElementById).toHaveBeenCalledWith('modal');
        expect(document.getElementById).toHaveBeenCalledWith('videoFrame');
        expect(document.getElementsByClassName).toHaveBeenCalledWith('close');
        expect(document.querySelectorAll).toHaveBeenCalledWith('.video-card');

        // Ensure mocked elements behave correctly
        const mockCard = document.querySelectorAll()[0];
        expect(mockCard.getAttribute('data-video-id')).toBe('some-video-id');
        expect(mockCard.addEventListener).toHaveBeenCalled();
    });
});