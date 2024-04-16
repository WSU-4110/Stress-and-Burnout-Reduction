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

        // Set up fetch mock response
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                liked: false,
                likes: 5
            })
        });

        // Initialize VideoModal instance
        videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
    });

    it('initializes class properties correctly', () => {
        expect(videoModal.modal).toBe(document.getElementById('modal'));
        expect(videoModal.videoFrame).toBe(document.getElementById('videoFrame'));
        expect(videoModal.closeButton).toBe(document.getElementsByClassName('close')[0]);
        expect(videoModal.videoCards.length).toBe(1);
        expect(videoModal.videoCards[0]).toBe(document.querySelector('.video-card'));
    });

    it('calls fetch and updates like state for video cards correctly', async () => {
        await videoModal.updateAllLikeStates();

        // Verify fetch call details
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith('/api/likes?videoId=123');

        // Verify DOM updates after fetch
        const likeCountElement = document.querySelector('.like-count');
        const likeButton = document.querySelector('.like-btn');

        expect(likeCountElement.textContent).toBe('5 Likes');
        expect(likeButton.classList.contains('liked')).toBe(false);
        expect(likeButton.innerHTML).toContain('Like');
    });

    it('transforms video URL to embed URL correctly', () => {
        const sampleUrl = "https://www.youtube.com/watch?v=XYZ";
        const transformedUrl = videoModal.transformVideoUrl(sampleUrl);
        expect(transformedUrl).toEqual("https://www.youtube.com/embed/XYZ");
    });

    it('handles modal open and close correctly', () => {
        const sampleUrl = "https://www.youtube.com/watch?v=XYZ";
        videoModal.openModal(sampleUrl);
        expect(videoModal.modal.style.display).toBe("block");
        expect(videoModal.videoFrame.src).toContain("embed/XYZ?autoplay=1&rel=0");

        videoModal.closeModal();
        expect(videoModal.modal.style.display).toBe("none");
        expect(videoModal.videoFrame.src).toBe("");
    });
});