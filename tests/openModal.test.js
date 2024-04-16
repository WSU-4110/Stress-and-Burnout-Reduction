const VideoModal = require('../scripts/videopage');

// Mocking fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ likes: 10, liked: true })
  })
);

describe('VideoModal - openModal', () => {
    let mockModal, mockVideoFrame;
    
    beforeEach(() => {
        // Reset mocks before each test
        fetch.mockClear();

        // Mock modal and videoFrame elements
        mockModal = { style: { display: 'none' } };
        mockVideoFrame = { src: '' };

        document.getElementById = jest.fn().mockImplementation((id) => {
            if (id === 'modal') return mockModal;
            if (id === 'videoFrame') return mockVideoFrame;
            return null;
        });

        document.getElementsByClassName = jest.fn().mockReturnValue([{ onclick: null }]);
        document.querySelectorAll = jest.fn().mockReturnValue([{ 
            addEventListener: jest.fn(),
            getAttribute: jest.fn().mockReturnValue('https://www.example.com/watch?v=example')
        }]);
    });

    it('sets videoFrame src and displays modal', () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        videoModal.openModal(testUrl);

        expect(mockVideoFrame.src).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0');
        expect(mockModal.style.display).toBe('block');
    });
});