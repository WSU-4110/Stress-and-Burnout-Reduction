const VideoModal = require('../scripts/videopage');

describe('VideoModal', () => {
    let mockModal, mockVideoFrame, mockCloseButton, mockVideoCards;

    beforeEach(() => {
        // Mocking the global fetch function
        global.fetch = jest.fn();

        // Creating mock DOM elements
        mockModal = document.createElement('div');
        mockVideoFrame = document.createElement('iframe');
        mockCloseButton = document.createElement('button');
        mockVideoCards = Array.from({ length: 3 }, (_, index) => {
            let card = document.createElement('div');
            card.setAttribute('data-video-id', `${index+1}`);
            card.innerHTML = `
                <button class="like-btn"></button>
                <span class="like-count"></span>
            `;
            return card;
        });

        // Setting up getElementById and other DOM-related functions
        document.getElementById = jest.fn((id) => {
            switch (id) {
                case 'modal':
                    return mockModal;
                case 'videoFrame':
                    return mockVideoFrame;
                default:
                    return null;
            }
        });

        document.getElementsByClassName = jest.fn(() => [mockCloseButton]);
        document.querySelectorAll = jest.fn(() => mockVideoCards);
    });

    describe('initialization and event attachment', () => {
        test('init class properly', () => {
            const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
            expect(document.getElementById).toHaveBeenCalledWith('modal');
            expect(document.getElementById).toHaveBeenCalledWith('videoFrame');
            expect(document.getElementsByClassName).toHaveBeenCalledWith('close');
            expect(document.querySelectorAll).toHaveBeenCalledWith('.video-card');
            expect(videoModal.modal).toBe(mockModal);
            expect(videoModal.videoFrame).toBe(mockVideoFrame);
            expect(videoModal.closeButton).toBe(mockCloseButton);
            expect(videoModal.videoCards).toEqual(mockVideoCards);
        });
    });

    describe('transformVideoUrl', () => {
        it('transforms YouTube watch URL to embed URL correctly', () => {
            const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
            const inputUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            const expectedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
            expect(videoModal.transformVideoUrl(inputUrl)).toBe(expectedUrl);
        });
    });

    describe('updateAllLikeStates', () => {
        it('correctly updates the states of like buttons and counts', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ likes: 10, liked: true })
            });

            const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
            await videoModal.updateAllLikeStates();

            mockVideoCards.forEach(card => {
                const likeBtn = card.querySelector('.like-btn');
                const likeCount = card.querySelector('.like-count');
                expect(likeCount.textContent).toBe('10 Likes');
                expect(likeBtn.classList.contains('liked')).toBe(true);
            });

            expect(global.fetch).toHaveBeenCalledTimes(mockVideoCards.length);
        });
    });
});