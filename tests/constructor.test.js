const VideoModal = require('../scripts/videopage');

describe('VideoModal - constructor and methods', () => {
    beforeEach(() => {
        // Mocking DOM elements more comprehensively
        document.getElementById = jest.fn((id) => {
            if (id === 'modal') {
                return {
                    style: {
                        display: ''
                    }
                };
            }
            if (id === 'videoFrame') {
                return {
                    src: '',
                    setAttribute: jest.fn()
                };
            }
            return null;
        });

        document.getElementsByClassName = jest.fn().mockReturnValue([{
            onclick: jest.fn(),
            addEventListener: jest.fn()
        }]);

        document.querySelectorAll = jest.fn().mockImplementation(selector => {
            if (selector === '.video-card') {
                return [{
                    addEventListener: jest.fn(),
                    getAttribute: jest.fn((attr) => {
                        if (attr === 'data-video-id') return 'test-video-id';
                        if (attr === 'data-video-url') return 'http://example.com/watch?v=1234';
                    }),
                    querySelector: jest.fn().mockImplementation((subSelector) => {
                        if (subSelector === '.like-btn') return { 
                            classList: { toggle: jest.fn() },
                            innerHTML: '',
                            addEventListener: jest.fn(),
                            nextElementSibling: {
                                textContent: ''
                            }
                        };
                        if (subSelector === '.like-count') return { textContent: '' };
                        return null;
                    })
                }];
            }
            return [];
        });
    });

    it('initializes class properties correctly', () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');

        expect(document.getElementById).toHaveBeenCalledWith('modal');
        expect(document.getElementById).toHaveBeenCalledWith('videoFrame');
        expect(document.getElementsByClassName).toHaveBeenCalledWith('close');
        expect(document.querySelectorAll).toHaveBeenCalledWith('.video-card');
    });

    it('should handle click on video card correctly', () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        const mockVideoCard = document.querySelectorAll('.video-card')[0];
        
        // Simulates clicking the video card
        mockVideoCard.addEventListener.mock.calls[0][1]({
           preventDefault: jest.fn() 
        });

        // Expectations such as if the modal opens correctly, video URL is transformed, etc.
        expect(videoModal.modal.style.display).toBe('block');
        expect(videoModal.videoFrame.src).toContain('embed/');
    });
});