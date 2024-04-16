const VideoModal = require('../scripts/videopage');

describe('VideoModal - constructor', () => {
    beforeEach(() => {
        // Mock DOM elements
        document.getElementById = jest.fn().mockImplementation(id => {
            if (id === 'modal') {
                return { style: {} };  // Mock modal element
            }
            if (id === 'videoFrame') {
                return { src: '' };  // Mock videoFrame element
            }
        });
        
        document.getElementsByClassName = jest.fn().mockReturnValue([{
            onclick: jest.fn()
        }]);  // Mock for className 'close'
        
        document.querySelectorAll = jest.fn().mockReturnValue([{
            getAttribute: jest.fn(name => {
                switch (name) {
                    case 'data-video-id':
                        return '123';
                    default:
                        return null;
                }
            }),
            addEventListener: jest.fn(),
            querySelector: jest.fn().mockReturnValue({
                textContent: '',
                classList: { toggle: jest.fn() },
                innerHTML: ''
            })
        }]);  // Mock for selector '.video-card'
    });

    it('initializes class properties correctly', () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');

        expect(document.getElementById).toHaveBeenCalledWith('modal');
        expect(document.getElementById).toHaveBeenCalledWith('videoFrame');
        expect(document.getElementsByClassName).toHaveBeenCalledWith('close');
        expect(document.querySelectorAll).toHaveBeenCalledWith('.video-card');
        
        // Add additional assertions to check if the properties are correctly set if necessary
        expect(videoModal.modal).toBeTruthy();
        expect(videoModal.videoFrame).toBeTruthy();
        expect(videoModal.closeButton).toBeTruthy();
        expect(videoModal.videoCards.length).toBe(1);
    });
});