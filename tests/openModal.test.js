const VideoModal = require('../scripts/videopage');

// Use jest to mock the global fetch function
global.fetch = jest.fn();

describe("VideoModal", () => {
    let videoModal;

    beforeEach(() => {
        // Set up the document body
        document.body.innerHTML = `
            <div id="modal"></div>
            <iframe id="videoFrame"></iframe>
            <button class="close"></button>
            <div id="videoCard" class="video-card" data-video-id="123">
                <button class="like-btn"></button>
                <span class="like-count"></span>
            </div>`;

        // Initialize the VideoModal instance
        videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");

        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();
    });

    it("should handle like states updating", async () => {
        // Mock fetch to resolve with specific data
        global.fetch.mockImplementation((url) => {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    likes: 10,
                    liked: true
                })
            });
        });

        // Wait for like states to update
        await videoModal.updateAllLikeStates();

        // Get elements that should be updated
        const likeButton = document.querySelector('.like-btn');
        const likeCountElement = document.querySelector('.like-count');

        // Check if the DOM updates as expected
        expect(likeCountElement.textContent).toBe("10 Likes");
        expect(likeButton.classList.contains('liked')).toBe(true);
        expect(likeButton.innerHTML).toContain('Liked');
    });
});