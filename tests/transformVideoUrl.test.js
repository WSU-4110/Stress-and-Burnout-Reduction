const VideoModal = require('../scripts/videopage');

describe("VideoModal Class Transform URL Test", () => {
    let videoModal;

    beforeEach(() => {
        // Setup minimal HTML required for initialization
        document.body.innerHTML = `<div id="modal"></div><iframe id="videoFrame"></iframe>`;
        videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");
    });

    test("transforms YouTube watch URL to embed URL correctly", () => {
        const originalUrl = "https://youtube.com/watch?v=dQw4w9WgXcQ";
        const expectedEmbedUrl = "https://youtube.com/embed/dQw4w9WgXcQ";
        expect(videoModal.transformVideoUrl(originalUrl)).toBe(expectedEmbedUrl);
    });
});