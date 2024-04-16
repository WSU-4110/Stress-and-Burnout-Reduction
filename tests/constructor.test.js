const VideoModal = require('../scripts/videopage');

describe("VideoModal Class", () => {
	// Prepare your DOM elements and other required mocks
	beforeAll(() => {
		document.body.innerHTML = `
            <div id="modal"></div>
            <iframe id="videoFrame"></iframe>
            <button class="close"></button>
            <div class="video-card" data-video-id="123" data-video-url="https://youtube.com/watch?v=xyz">
                <div class="video-info">
                    <h3>Video Title</h3>
                    <p>Video Description</p>
                </div>
                <button class="like-btn"></button>
                <span class="like-count">0 Likes</span>
            </div>
        `;

		// Mock fetch initially
		global.fetch = jest.fn(() => Promise.resolve({
			ok: true,
			json: () => Promise.resolve({
				likes: 1,
				liked: true
			})
		}));
	});

	afterEach(() => {
		// Restore the mocks back to the original state
		jest.restoreAllMocks();
	});

	test('initializes class properties correctly', () => {
		const videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");

		expect(videoModal.modal).toBe(document.getElementById("modal"));
		expect(videoModal.videoFrame).toBe(document.getElementById("videoFrame"));
		expect(videoModal.closeButton).toBe(document.getElementsByClassName("close")[0]);
		expect(videoModal.videoCards.length).toBe(1);
	});

	test('calls fetch and updates like state for video cards', async () => {
		const videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");
		await videoModal.updateAllLikeStates();

		// Checking if fetch has been called with the correct URL
		expect(fetch).toHaveBeenCalledWith(`/api/likes?videoId=123`);

		// Ensure the DOM updates were made correctly
		const likeCountElement = document.querySelector('.like-count');
		const likeButton = document.querySelector('.like-btn');
		expect(likeCountElement.textContent).toBe("1 Likes");
		expect(likeButton.classList.contains('liked')).toBe(true);
		expect(likeButton.innerHTML).toContain('Liked');
	});
});