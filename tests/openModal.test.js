const VideoModal = require('../scripts/videopage');

describe('VideoModal - openModal', () => {
    beforeEach(() => {
        // Mock modal and videoFrame elements
        document.getElementById = jest.fn((id) => {
            if (id === 'modal') {
                return { style: { display: 'none' } }; // Mock modal element with style
            }
            if (id === 'videoFrame') {
                return { src: '' }; // Mock videoFrame element with src
            }
            return null;
        });

        document.getElementsByClassName = jest.fn(className => {
            if (className === 'close') return [{ onclick: null }];
            return [];
        });

        document.querySelectorAll = jest.fn(selector => {
            if (selector === '.video-card') {
                return [{
                    addEventListener: jest.fn(),
                    getAttribute: jest.fn(name => {
                        if (name === 'data-video-url') return 'https://www.example.com/watch?v=example';
                    })
                }];
            }
            return [];
        });
    });

    it('sets videoFrame src and displays modal', () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        videoModal.openModal(testUrl);

        expect(videoModal.videoFrame.src).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0');
        expect(videoModal.modal.style.display).toBe('block');
    });
});