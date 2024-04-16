const VideoModal = require('../scripts/videopage');

describe('VideoModal - openModal', () => {
    beforeEach(() => {
        // Mock modal element
        document.getElementById = jest.fn((id) => {
            if (id === 'modal') return {
                style: {
                    display: 'none'
                }
            };
            if (id === 'videoFrame') return {
                src: ''
            };
            return null;
        });

        document.getElementsByClassName = jest.fn(className => {
            if (className === 'close') return [{
                onclick: null
            }];
            return [];
        });

        document.querySelectorAll = jest.fn(selector => {
            if (selector === '.video-card') {
                return [{
                    getAttribute: jest.fn((attr) => {
                        if (attr === 'data-video-id') return '123';
                        if (attr === 'data-video-url') return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                    }),
                    addEventListener: jest.fn(),
                    querySelector: jest.fn((sel) => {
                        if (sel === '.like-btn') return {
                            classList: {
                                toggle: jest.fn()
                            },
                            nextElementSibling: {
                                textContent: ''
                            },
                            innerHTML: ''
                        };
                        if (sel === '.like-count') return {
                            textContent: ''
                        };
                        return null;
                    }),
                }];
            }
            return [];
        });
    });

    it('sets videoFrame src and displays modal', () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        videoModal.openModal(testUrl);

        expect(videoModal.videoFrame.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0');
        expect(videoModal.modal.style.display).toBe('block');
    });
});