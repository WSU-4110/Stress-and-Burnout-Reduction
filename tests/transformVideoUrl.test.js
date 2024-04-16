const VideoModal = require('../scripts/videopage');

// Mocking fetch before the tests run
global.fetch = jest.fn();

describe("VideoModal Class Tests", () => {
  let videoModal;

  beforeEach(() => {
    // Set up our document body
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
    // Mocking fetch's resolved value
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({likes: 15, liked: true})
    });

    // We have to mock or otherwise ensure init doesn't lead to uncontrolled fetch calls.
    videoModal.init = jest.fn();
    videoModal.updateAllLikeStates = jest.fn();

    document.querySelector('.like-btn').dispatchEvent(new MouseEvent('click', {bubbles: true}));

    await videoModal.updateAllLikeStates(); // Manually calling the mocked function to simulate fetching process

    const likeCountElement = document.querySelector('.like-count');
    const likeButton = document.querySelector('.like-btn');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/likes?videoId=123");
    expect(likeCountElement.textContent).toBe("15 Likes");
    expect(likeButton.classList.contains('liked')).toBe(true);
  });
});