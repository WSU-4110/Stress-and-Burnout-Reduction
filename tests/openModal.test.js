const VideoModal = require('../scripts/videopage');

document.body.innerHTML = 
    `<div id="modal">
        <iframe id="videoFrame"></iframe>
    </div>
    <button class="close"></button>
    <div class="video-card" data-video-id="123">
        <button class="like-btn"></button>
        <span class="like-count">0 Likes</span>
    </div>`;

describe('VideoModal', () => {
    beforeEach(() => {
        // Reset fetch mocks
        jest.resetAllMocks();

        // Set up fetch mock
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ likes: 1, liked: true })
            })
        );
    });

    it('should handle like states updating', async () => {
        // Initialize video modal
        const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
        
        // Wait for the video modal's async operations to complete
        await videoModal.updateAllLikeStates();

        // Get elements
        const likeButton = document.querySelector('.like-btn');
        const likeCountElement = document.querySelector('.like-count');

        // Assertions to check if the likes are updated correctly based on the mock response
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith('/api/likes?videoId=123');
        expect(likeCountElement.textContent).toBe('1 Likes');
        expect(likeButton).toHaveClass('liked');
        expect(likeButton.innerHTML).toContain('Liked');
    });
});