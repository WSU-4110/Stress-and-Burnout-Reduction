const VideoModal = require('../scripts/videopage');

describe('VideoModal - closeModal', () => {
    beforeEach(() => {
        // Mocking the getElementById method
        document.getElementById = jest.fn(id => {
            if (id === 'modal') {
                return {
                    style: { display: '' }
                };
            }
            if (id === 'videoFrame') {
                return { src: '' };
            }
            return null;
        });

        // Mocking the getElementsByClassName method
        document.getElementsByClassName = jest.fn(className => {
            if (className === 'close') {
                return [{ onclick: jest.fn() }];
            }
            return [];
        });

        // Mocking the querySelectorAll method correctly
        document.querySelectorAll = jest.fn(selector => {
            if (selector === '.video-card') {
                return [{
                    getAttribute: jest.fn((attr) => {
                        if (attr === 'data-video-id') return '123';
                        if (attr === "data-video-url") return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                    }),
                    querySelector: jest.fn((subSelector) => {
                        if (subSelector === '.like-btn') {
                            return {
                                classList: {
                                    toggle: jest.fn(),
                                    contains: jest.fn()
                                },
                                innerHTML: ''
                            };
                        }
                        if (subSelector === '.like-count') {
                            return { textContent: '' };
                        }
                    }),
                    addEventListener: jest.fn()
                }];
            }
            return [];
        });
    });

    it('hides modal and clears videoFrame src', () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        videoModal.openModal('https://www.example.com');
        videoModal.closeModal();

        expect(videoModal.modal.style.display).toBe('none');
        expect(videoModal.videoFrame.src).toBe('');
    });
});