const VideoModal = require('../scripts/videopage');

// Mocking the necessary DOM structure and behavior
document.body.innerHTML = `
<div id="modal" style="display: none;"></div>
<iframe id="videoFrame"></iframe>
<button class="close"></button>
<div class="video-card" data-video-id="123">
  <div class="like-count"></div>
  <button class="like-btn"></button>
</div>
`;

// Mocking global fetch
global.fetch = jest.fn();

describe('VideoModal', () => {
    let videoModal;
    beforeEach(() => {
        // Reset fetch mock before each test
        fetch.mockReset();

        // Setup fetch mock response
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                liked: true,
                likes: 10
            })
        });

        // Initialize VideoModal instance
        videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
    });

    it('initializes class properties correctly', () => {
        expect(videoModal.modal).toEqual(document.getElementById('modal'));
        expect(videoModal.videoFrame).toEqual(document.getElementById('videoFrame'));
        expect(videoModal.closeButton).toEqual(document.getElementsByClassName('close')[0]);
        expect(videoModal.videoCards.length).toBe(1);
        expect(videoModal.videoCards[0]).toEqual(document.querySelector('.video-card'));
    });

it('calls fetch and updates like state for video cards', async () => {
    await videoModal.updateAllLikeStates();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith('/api/likes?videoId=123');

    const likesCountElement = videoModal.videoCards[0].querySelector('.like-count');
    const likeButton = videoModal.videoCards[0].querySelector('.like-btn');

    expect(likesCountElement.textContent).toBe('10 Likes');
    expect(likeButton.classList.contains('liked')).toBe(true);
    expect(likeButton.innerHTML).toContain('Liked');
});

});