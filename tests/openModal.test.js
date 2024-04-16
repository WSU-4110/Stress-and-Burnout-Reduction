const VideoModal = require('../scripts/videopage');

// Clear all mocks before each test
beforeEach(() => {
    jest.restoreAllMocks(); // Restores all mocks back to their original value
});

describe("VideoModal", () => {
    let videoModal;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="modal"></div>
            <iframe id="videoFrame"></iframe>
            <button class="close"></button>
            <div id="videoCard" class="video-card" data-video-id="123">
                <button class="like-btn"></button>
                <span class="like-count"></span>
            </div>
        `;

        videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");

        // Mock fetch globally
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                likes: 10,
                liked: true
            })
        }));
    });

    it("should handle like states updating", async () => {
        // Use a separate mock for specific tests if needed
        fetch.mockImplementation(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                likes: 10,
                liked: true
            })
        }));

        await videoModal.updateAllLikeStates();

        const likeButton = document.querySelector('.like-btn');
        const likeCountElement = document.querySelector('.like-count');

        expect(likeCountElement.textContent).toBe("10 Likes");
        expect(likeButton.classList.contains('liked')).toBe(true);
        expect(likeButton.innerHTML).toContain('Liked');
    });
});