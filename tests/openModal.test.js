const VideoModal = require('../scripts/videopage');

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ likes: 10, liked: true })
  })
);

describe('VideoModal', () => {
    let mockModal, mockVideoFrame, mockCards;

    beforeEach(() => {
        fetch.mockClear();

        mockModal = { style: { display: 'none' } };
        mockVideoFrame = { src: '' };
        mockCards = [{
            getAttribute: jest.fn().mockReturnValue('123'),
            querySelector: jest.fn().mockReturnValue({
                textContent: '',
                classList: {
                    toggle: jest.fn()
                },
                innerHTML: ''
            })
        }];
        
        document.getElementById = jest.fn((id) => ({
            'modal': mockModal,
            'videoFrame': mockVideoFrame
        })[id]);

        document.getElementsByClassName = jest.fn().mockReturnValue([{ onclick: null }]);
        document.querySelectorAll = jest.fn().mockReturnValue(mockCards);
    });

    it('updates all like states when initialized', async () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        await videoModal.updateAllLikeStates();

        expect(fetch).toHaveBeenCalledTimes(mockCards.length);
        expect(mockCards[0].querySelector).toHaveBeenCalledWith('.like-btn');
        expect(mockCards[0].querySelector).toHaveBeenCalledWith('.like-count');
    });
});