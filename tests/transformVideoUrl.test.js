const VideoModal = require('../scripts/videopage');

describe('VideoModal', () => {
	let videoModal;
	let mockVideoCards;

	beforeEach(() => {
		// Mock for `getElementById`
		document.getElementById = jest.fn((id) => {
			return {
				style: {},
				src: ''
			};
		});

		// Mock for `getElementsByClassName`
		document.getElementsByClassName = jest.fn().mockReturnValue([{
			onclick: jest.fn(),
			addEventListener: jest.fn()
		}]);

		// Mock for `querySelectorAll` with behavior for 'addEventListener' and 'getAttribute'
		mockVideoCards = [{
			addEventListener: jest.fn(),
			getAttribute: jest.fn().mockReturnValue('123'), 
			querySelector: jest.fn().mockReturnValue({textContent: ''})
		}, {
			addEventListener: jest.fn(), // Pretend this is another card
			getAttribute: jest.fn().mockReturnValue('456'),
			querySelector: jest.fn().mockReturnValue({textContent: ''})
		}];

		document.querySelectorAll = jest.fn().mockReturnValue(mockVideoCards);

		videoModal = new VideoModal('dummyModalId', 'dummyVideoFrameId', 'dummyCloseButtonClass', 'dummyVideoCardClass');
	});

	describe('transformVideoUrl', () => {
		it('transforms URL correctly', () => {
			const inputUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
			const expectedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

			expect(videoModal.transformVideoUrl(inputUrl)).toBe(expectedUrl);
		});
	});

	describe('init', () => {
		it('should attach events and update likes state', async () => {
			await videoModal.init();

			expect(mockVideoCards[0].addEventListener.mock.calls.length).toBeGreaterThan(0);
			expect(mockVideoCards[1].addEventListener.mock.calls.length).toBeGreaterThan(0);
		});
	});
});