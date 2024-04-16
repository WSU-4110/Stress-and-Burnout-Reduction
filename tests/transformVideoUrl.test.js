const VideoModal = require('../scripts/videopage');

// Mocking fetch before the tests run
global.fetch = jest.fn();

describe("VideoModal Class Tests", () => {
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

    // Reset fetch mocks
    fetch.mockClear();

    // Set up mocks for all fetch calls with default values. Ensure every call to fetch is reckoned.
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({likes: 15, liked: true})
    });

    videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("transforms YouTube watch URL to embed URL correctly", () => {
    const originalUrl = "https://youtube.com/watch?v=dQw4w9WgXcQ";
    const expectedEmbedUrl = "https://youtube.com/embed/dQw4w9WgXcQ";
    expect(videoModal.transformVideoUrl(originalUrl)).toBe(expectedEmbedUrl);
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