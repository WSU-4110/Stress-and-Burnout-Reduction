const VideoModal = require('../scripts/videopage');

describe("VideoModal", () => {
    let videoModal;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="modal" style="display: none;"></div>
            <iframe id="videoFrame"></iframe>
            <button class="close"></button>
            <div class="video-card" data-video-id="123">
                <button class="like-btn"></button>
                <span class="like-count"></span>
            </div>
        `;

        // Mock fetch globally
        global.fetch = jest.fn();

        videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should handle like states updating correctly", async () => {
        // Update fetch mock for this test case
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
                likes: 10,
                liked: true
            })
        });

        await videoModal.updateAllLikeStates();

        const likeButton = document.querySelector('.like-btn');
        const likeCountElement = document.querySelector('.like-count');
        
        expect(likeCountElement.textContent).toBe("10 Likes");
        expect(likeButton.classList.contains('liked')).toBe(true);
        expect(likeButton.innerHTML).toContain('Liked');
    });

    it("should handle errors when fetching like data", async () => {
        fetch.mockRejectedValueOnce(new Error("Network error"));

        await videoModal.updateAllLikeStates();

        const likeCountElement = document.querySelector('.like-count');
        expect(likeCountElement.textContent).toBe(""); // Assuming it clears or does not update on error
    });

    it("should correctly handle modal open and close", () => {
        const modal = document.getElementById('modal');
        const videoFrame = document.getElementById('videoFrame');
        const closeButton = document.querySelector('.close');
        
        // Open modal test
        videoModal.openModal("https://youtube.com/watch?v=dQw4w9WgXcQ");
        expect(modal.style.display).toBe("block");
        expect(videoFrame.src).toBe("https://youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0");

        // Close modal test
        videoModal.closeModal();
        expect(modal.style.display).toBe("none");
        expect(videoFrame.src).toBe("");
    });
});