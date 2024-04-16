const VideoModal = require('../scripts/videopage');

// Globally mock fetch
global.fetch = jest.fn();

describe('VideoModal', () => {
    beforeEach(() => {
        // Reset fetch mocks before each test
        fetch.mockReset();
        
        // Mock DOM elements
        document.getElementById = jest.fn().mockImplementation(id => {
            if (id === 'modal') {
                return { style: {} };  // Mock modal element
            }
            if (id === 'videoFrame') {
                return { src: '' };  // Mock videoFrame element
            }
        });

        document.getElementsByClassName = jest.fn().mockReturnValue([{
            onclick: jest.fn()
        }]);  // Mock for className 'close'
        
        document.querySelectorAll = jest.fn().mockReturnValue([{
            getAttribute: jest.fn(name => {
                if (name === 'data-video-id') {
                    return '123';
                }
                return null;
            }),
            addEventListener: jest.fn(),
            querySelector: jest.fn().mockReturnValue({
                textContent: '',
                classList: { toggle: jest.fn() },
                innerHTML: ''
            })
        }]);  // Mock for selector '.video-card'
    });

    it('initializes class properties correctly', () => {
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        
        expect(document.getElementById).toHaveBeenCalledWith('modal');
        expect(document.getElementById).toHaveBeenCalledWith('videoFrame');
        expect(document.getElementsByClassName).toHaveBeenCalledWith('close');
        expect(document.querySelectorAll).toHaveBeenCalledWith('.video-card');
        expect(videoModal.modal).toBeTruthy();
        expect(videoModal.videoFrame).toBeTruthy();
        expect(videoModal.closeButton).toBeTruthy();
        expect(videoModal.videoCards.length).toBe(1);
    });

    it('calls fetch and updates like state for video cards', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                liked: true,
                likes: 10
            })
        });

        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        await videoModal.updateAllLikeStates();

        // Assertions to check the fetch mechanism and results
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith('/api/likes?videoId=123');

        const card = document.querySelectorAll.mock.results[0].value[0];
        const likeCountElement = card.querySelector.mock.results[1].value;
        const likeButton = card.querySelector.mock.results[0].value;

        expect(likeCountElement.textContent).toBe('10 Likes');
        expect(likeButton.classList.toggle).toHaveBeenCalledWith('liked', true);
        expect(likeButton.innerHTML).toContain('Liked');
    });
});