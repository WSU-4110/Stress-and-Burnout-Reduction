const VideoModal = require('../scripts/videopage');

describe('VideoModal Class', () => {
    let mockModal, mockVideoFrame, mockCloseButton, mockVideoCards;

    beforeAll(() => {
        global.fetch = jest.fn();  // Mock fetch globally
    });

    afterAll(() => {
        global.fetch.mockRestore();  // Restore original fetch
    });

    beforeEach(() => {
        // Set up mock elements
        mockModal = { style: { display: 'none' } };
        mockVideoFrame = { src: '' };
        mockCloseButton = { onclick: jest.fn() };
        mockVideoCards = Array.from({ length: 3 }, (_, index) => ({
            getAttribute: jest.fn().mockReturnValue(`test_video_id_${index}`),
            querySelector: jest.fn().mockImplementation(selector => {
                if (selector === '.like-btn') 
                    return { classList: { toggle: jest.fn() }, innerHTML: '' };
                if (selector === '.like-count') 
                    return { textContent: '' };
                return null;
            })
        }));

        // Mocking DOM methods
        document.getElementById = jest.fn().mockImplementation(id => {
            if (id === 'modal') return mockModal;
            if (id === 'videoFrame') return mockVideoFrame;
            return null;
        });
        document.getElementsByClassName = jest.fn().mockReturnValue([mockCloseButton]);
        document.querySelectorAll = jest.fn().mockReturnValue(mockVideoCards);

        // Mocking fetch behavior
        fetch.mockClear().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ likes: 10, liked: true })
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('initializes and attaches events correctly', async () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        
        // Init method should set up all necessary events and states
        expect(document.getElementById).toHaveBeenCalledWith('modal');
        expect(document.getElementById).toHaveBeenCalledWith('videoFrame');
        
        expect(document.getElementsByClassName).toHaveBeenCalledWith('close');
        expect(document.querySelectorAll).toHaveBeenCalledWith('.video-card');

        // Check if modal is displayed correctly during modal operations
        mockCloseButton.onclick();
        expect(mockModal.style.display).toBe('none');

        // Since videoModal.init() is async, we should check if it handles updates correctly
        await videoModal.init();
        mockVideoCards.forEach(card => {
            expect(card.querySelector).toHaveBeenCalledWith('.like-count');
            expect(card.querySelector('.like-count').textContent).toBe('10 Likes');
            expect(card.querySelector).toHaveBeenCalledWith('.like-btn');
        });
    });
});