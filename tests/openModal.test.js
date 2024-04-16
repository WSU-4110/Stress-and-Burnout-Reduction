const VideoModal = require('../scripts/videopage');

// Jest fetch mock
global.fetch = jest.fn();

describe("VideoModal Class Like State Update Tests", () => {
    let videoModal;

    beforeEach(() => {
        document.body.innerHTML = `
          <div id="modal">
            <iframe id="videoFrame"></iframe>
          </div>
          <button class="close"></button>
          <div class="video-card" data-video-id="123" data-video-url="https://youtube.com/watch?v=dQw4w9WgXcQ">
            <button class="like-btn"><i class="fa-regular fa-heart"></i> Like</button>
            <span class="like-count">0 Likes</span>
          </div>
        `;

        fetch.mockClear();
        fetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({likes: 15, liked: true})
        });

        videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("correctly updates the states of like buttons and counts", async () => {
        await videoModal.updateAllLikeStates();

        const likeCountElement = document.querySelector('.like-count');
        const likeButton = document.querySelector('.like-btn');

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith("/api/likes?videoId=123");
        expect(likeCountElement.textContent).toBe("15 Likes");
        expect(likeButton.classList.contains('liked')).toBe(true);
    });
});