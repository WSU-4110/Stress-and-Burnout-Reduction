const VideoModal = require('../scripts/videopage');

// Setting up a full mock for fetch within Jest
beforeAll(() => {
  global.fetch = jest.fn();
});

afterAll(() => {
  global.fetch.mockRestore();
});

describe('VideoModal - openModal', () => {
    let mockModal, mockVideoFrame;
    
    beforeEach(() => {
        // Clear mocks before each test
        fetch.mockClear().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ likes: 10, liked: true })
        });

        // Mock modal and videoFrame elements
        mockModal = { style: { display: 'none' } };
        mockVideoFrame = { src: '' };

        // Using jest.spyOn to mock document API calls
        jest.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'modal') return mockModal;
            if (id === 'videoFrame') return mockVideoFrame;
            return null;
        });

        // Mocking classes and query selectors
        jest.spyOn(document, 'getElementsByClassName').mockReturnValue([{ onclick: jest.fn() }]);
        jest.spyOn(document, 'querySelectorAll').mockReturnValue([{
            addEventListener: jest.fn(),
            getAttribute: jest.fn().mockReturnValue('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        }]);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('sets videoFrame src and displays modal', () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        videoModal.openModal(testUrl);

        expect(mockVideoFrame.src).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0');
        expect(mockModal.style.display).toBe('block');
    });
});