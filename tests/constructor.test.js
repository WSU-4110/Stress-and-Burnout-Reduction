const VideoModal = require('../scripts/videopage');

global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ liked: true, likes: 10 })
}));

describe('VideoModal', () => {
    beforeEach(() => {
        // Reset all mocks between tests
        fetch.mockClear();
        document.getElementById.mockClear();
        document.getElementsByClassName.mockClear();
        document.querySelectorAll.mockClear();

        // Set up mocks for document methods used in VideoModal
        document.getElementById = jest.fn().mockImplementation(id => {
            if (id === 'modal') return { style: { display: 'none' } };
            if (id === 'videoFrame') return { src: '' };
            return null;
        });

        document.getElementsByClassName = jest.fn().mockReturnValue([{
            addEventListener: jest.fn()
        }]);

        document.querySelectorAll = jest.fn().mockReturnValue([...new Array(5)].map(() => ({
            getAttribute: jest.fn().mockReturnValue('123'),
            addEventListener: jest.fn(),
            querySelector: jest.fn().mockReturnValue({
                textContent: '',
                classList: {
                    toggle: jest.fn()
                },
                innerHTML: ''
            })
        })));
    });

    it('initializes and binds UI elements correctly', () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        
        // Check proper instantiation and method calls
        expect(document.getElementById).toHaveBeenCalledWith('modal');
        expect(document.getElementById).toHaveBeenCalledWith('videoFrame');
        expect(document.getElementsByClassName).toHaveBeenCalledWith('close');
        expect(document.querySelectorAll).toHaveBeenCalledWith('.video-card');

        // Assert that properties are set up correctly
        expect(videoModal.modal).toBeDefined();
        expect(videoModal.videoFrame).toBeDefined();
        expect(videoModal.closeButton).toBeDefined();
        expect(videoModal.videoCards.length).toBe(5);
    });

    it('updates like states correctly when initializing', async () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');

        // The updateAllLikeStates method should be called during initialization
        await videoModal.init();

        // Since there are 5 cards, ensure fetch was called 5 times
        expect(fetch).toHaveBeenCalledTimes(5);
        expect(fetch.mock.calls[0][0]).toBe('/api/likes?videoId=123');

        const card = document.querySelectorAll().mock.results[0].value[0];
        expect(card.querySelector.mock.calls.length).toBe(2);  // Called twice per card: once for button, once for count
        expect(card.querySelector().classList.toggle).toHaveBeenCalledWith('liked', true);
        expect(card.querySelector().textContent).toBe('10 Likes');
    });

    it('handles modal opening and closing correctly', () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        videoModal.openModal('https://youtube.com/watch?v=dQw4w9WgXcQ');

        // Verify that the modal display style changes to block
        expect(videoModal.modal.style.display).toBe('block');
        expect(videoModal.videoFrame.src).toContain('https://youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0');

        // Simulate closing the modal
        videoModal.closeModal();
        expect(videoModal.modal.style.display).toBe('none');
        expect(videoModal.videoFrame.src).toBe('');
    });
});