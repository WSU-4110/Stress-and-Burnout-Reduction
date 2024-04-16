import fetch from "node-fetch";
const VideoModal = require('../scripts/videopage');

describe('VideoModal - closeModal', () => {
    beforeEach(() => {
        document.getElementById = jest.fn((id) => {
            switch (id) {
                case 'modal':
                    return { style: { display: '' } }; // Mock modal element
                case 'videoFrame':
                    return { src: '' }; // Mock videoFrame element
                default:
                    return null;
            }
        });

        document.getElementsByClassName = jest.fn(className => {
            if (className === 'close') return [{ onclick: jest.fn() }];
            return [];
        });

        document.querySelectorAll = jest.fn(selector => {
            if (selector === '.video-card') {
                return [
                    { 
                        addEventListener: jest.fn(),
                        getAttribute: jest.fn((attr) => {
                            if (attr === 'data-video-id') return '123';
                            if (attr === 'data-video-url') return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                            return null;
                        })
                    }
                ];
            }
            return [];
        });
    });

    it('hides modal and clears videoFrame src', () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        videoModal.openModal('https://www.example.com/watch?v=video123');
        videoModal.closeModal();

        expect(videoModal.modal.style.display).toBe('none');
        expect(videoModal.videoFrame.src).toBe('');
    });
});