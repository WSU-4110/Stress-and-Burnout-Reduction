const VideoModal = require('../scripts/videopage');

beforeAll(() => {
  global.fetch = jest.fn();
});

afterAll(() => {
  global.fetch.mockRestore();
});

describe('VideoModal - Integration', () => {
    let mockVideoCards, mockModal, mockVideoFrame;
    
    beforeEach(() => {
        // Mock for fetch response
        fetch.mockClear().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ likes: 10, liked: true })
        });

        mockModal = { style: { display: 'none' } };
        mockVideoFrame = { src: '' };
        mockVideoCards = [{
            getAttribute: jest.fn(() => "test_video_id"),
            querySelector: jest.fn((selector) => {
              if (selector === '.like-btn') return { classList: { toggle: jest.fn() }, innerHTML: '' };
              if (selector === '.like-count') return { textContent: '' };
              return null;
            })
        }];

        jest.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'modal') return mockModal;
            if (id === 'videoFrame') return mockVideoFrame;
            return null;
        });

        jest.spyOn(document, 'getElementsByClassName').mockReturnValue([{ onclick: jest.fn() }]);
        jest.spyOn(document, 'querySelectorAll').mockReturnValue(mockVideoCards);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should handle like states updating', async () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');

        await videoModal.updateAllLikeStates();  // Since it's async, wait for it

        for (const card of mockVideoCards) {
          expect(card.querySelector).toHaveBeenCalledWith('.like-count');
          expect(card.querySelector).toHaveBeenCalledWith('.like-btn');
        }
    });
});