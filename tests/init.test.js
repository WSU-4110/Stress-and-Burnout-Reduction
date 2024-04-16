const VideoModal = require('../scripts/videopage');

describe('VideoModal - init', () => {
	beforeEach(() => {
		// Mocking DOM elements and fetch
		document.getElementById = jest.fn((id) => {
			if (id === 'modal') return {
				style: {}
			};
			if (id === 'videoFrame') return {
				src: ''
			};
			return null;
		});

		document.getElementsByClassName = jest.fn().mockReturnValue([{
			onclick: jest.fn()
		}]);

		document.querySelectorAll = jest.fn().mockReturnValue([{
			addEventListener: jest.fn(),
			getAttribute: jest.fn().mockReturnValue('123'),
			querySelector: jest.fn().mockReturnValue({
				classList: {
					toggle: jest.fn()
				},
				innerHTML: '',
				textContent: ''
			})
		}]);

		// Mock fetch call used in updateAllLikeStates
		global.fetch = jest.fn(() => Promise.resolve({
			ok: true,
			json: () => Promise.resolve({
				likes: 42,
				liked: false
			})
		}));
	});

	it('calls methods to attach event listeners and updates like states', async () => {
		// Setup
		const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
		videoModal.attachVideoCardsEvents = jest.fn();
		videoModal.attachCloseButtonEvent = jest.fn();
		videoModal.attachWindowClickEvent = jest.fn();
		videoModal.updateAllLikeStates = jest.fn();

		// Act
		await videoModal.init();

		// Assert
		expect(videoModal.attachVideoCardsEvents).toHaveBeenCalled();
		expect(videoModal.attachCloseButtonEvent).toHaveBeenCalled();
		expect(videoModal.attachWindowClickEvent).toHaveBeenCalled();
		expect(videoModal.updateAllLikeStates).toHaveBeenCalled();
	});
});