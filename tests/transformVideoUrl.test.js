const VideoModal = require('../scripts/videopage');

function createFetchResponse(ok, status, jsonData) {
    return {
        ok,
        status,
        json: () => Promise.resolve(jsonData)
    };
}

describe('VideoModal', () => {
    beforeEach(() => {
        // Clear all mocks before each test to ensure clean slate.
        jest.clearAllMocks();
        global.fetch.mockReset();

        // Mock required DOM elements.
        document.getElementById = jest.fn().mockImplementation(id => {
            if (id === 'videoFrame') {
                return { src: '' }; // Specific mock for the 'src' property
            }
            return document.createElement('div');
        });
        document.getElementsByClassName = jest.fn(() => [document.createElement('button')]);
        document.querySelectorAll = jest.fn(() => Array.from({ length: 5 }, () => {
            let elem = document.createElement('div');
            elem.setAttribute('data-video-id', '123');
            elem.querySelector = jest.fn().mockImplementation(selector => {
               if (selector === '.like-btn') return document.createElement('button');
               if (selector === '.like-count') return document.createElement('span');
               return document.createElement('div');
            });
            return elem;
        }));
    });

    describe('transformVideoUrl', () => {
        it('transforms YouTube watch URL to embed URL correctly', () => {
            const videoModal = new VideoModal('dummyModalId', 'dummyVideoFrameId', 'dummyCloseButtonClass', 'dummyVideoCardClass');
            const inputUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            const expectedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
            expect(videoModal.transformVideoUrl(inputUrl)).toBe(expectedUrl);
        });
    });

    describe('updateAllLikeStates', () => {
        it('correctly updates the states of like buttons and counts', async () => {
            global.fetch = jest.fn().mockResolvedValue(createFetchResponse(true, 200, { likes: 10, liked: true }));
            const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
            await videoModal.updateAllLikeStates();

            const firstVideoCard = document.querySelectorAll()[0];
            const likeCountElement = firstVideoCard.querySelector('.like-count');

            expect(likeCountElement.textContent).toBe('10 Likes');
            expect(global.fetch).toHaveBeenCalledTimes(5); // As many times as video cards are mocked
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/likes?videoId=123'));
        });
    });
});