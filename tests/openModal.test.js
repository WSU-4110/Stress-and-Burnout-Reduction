const fetch = require('node-fetch');
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
            }; // Mock videoFrame element
            return null;
        });

        document.getElementsByClassName = jest.fn(className => {
            if (className === 'close') return [{
                onclick: null
            }];
            return [];
        });

        // Mock video card elements more accurately with getAttribute
        document.querySelectorAll = jest.fn(selector => {
            if (selector === '.video-card') return [{
                addEventListener: jest.fn(),
                getAttribute: jest.fn((attr) => {
                    if (attr === 'data-video-url') return 'https://www.example.com/watch?v=example';
                    if (attr === 'data-video-id') return '123';
                    return null;
                }),
                querySelector: jest.fn((selector) => {
                    // Mock elements inside the .video-card
                    if (selector === '.like-btn') return { 
                        classList: {
                            toggle: jest.fn(),
                        },
                        innerHTML: '',
                    };
                    if (selector === '.like-count') return {
                        textContent: '',
                    };
                    return null;
                })
            }];
            return [];
        });
    });

    it('sets videoFrame src and displays modal', () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        const testUrl = 'https://www.example.com/watch?v=example';
        videoModal.openModal(testUrl);

        expect(videoModal.videoFrame.src).toContain('https://www.example.com/embed/example?autoplay=1&rel=0');
        expect(videoModal.modal.style.display).toBe('block');
    });
});