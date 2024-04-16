const VideoModal = require('../scripts/videopage');

describe('VideoModal - init', () => {
	beforeEach(() => {
		// Mock for getElementById
		global.document.getElementById = jest.fn(id => {
			if (id === 'modal') {
				return { style: { display: '' } };
			} else if (id === 'videoFrame') {
				return { src: '' };
			}
			return null;
		});

		// Mock for getElementsByClassName
		global.document.getElementsByClassName = jest.fn(className => {
			return [{
				addEventListener: jest.fn(),
			}];
		});

		// Mock for querySelectorAll to return elements with methods like getAttribute, addEventListener
		global.document.querySelectorAll = jest.fn(selector => {
			if(selector === ".video-card") {
				return [{
					getAttribute: jest.fn(attr => {
						if (attr === 'data-video-id') return '12345'; // Example video ID
						if (attr === 'data-video-url') return 'https://example.com/watch?v=abcd1234';
					}),
					addEventListener: jest.fn(),
					querySelector: jest.fn().mockReturnValue({
						textContent: '',
						classList: {
							toggle: jest.fn()
						},
						innerHTML: ''
					})
				}];
			} else {
				return [];
			}
		});
	});

	it('initializes with event listeners and updates like states correctly', async () => {
		// Create instance
		const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');

		// Method Spies
		jest.spyOn(videoModal, 'attachVideoCardsEvents');
		jest.spyOn(videoModal, 'attachCloseButtonEvent');
		jest.spyOn(videoModal, 'attachWindowClickEvent');
		jest.spyOn(videoModal, 'updateAllLikeStates').mockResolvedValue();

		// Initialize
		await videoModal.init();

		// Expectations
		expect(videoModal.attachVideoCardsEvents).toHaveBeenCalled();
		expect(videoModal.attachCloseButtonEvent).toHaveBeenCalled();
		expect(videoModal.attachWindowClickEvent).toHaveBeenCalled();
		expect(videoModal.updateAllLikeStates).toHaveBeenCalled();
	});
});