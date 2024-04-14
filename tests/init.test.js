const VideoModal = require('../scripts/videopage');

describe('VideoModal - init', () => {
	beforeEach(() => {
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
			onclick: null,
		}]);

		document.querySelectorAll = jest.fn().mockReturnValue([]);
	});

	it('calls methods to attach event listeners', () => {
		// Setup
		const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
		videoModal.attachVideoCardsEvents = jest.fn();
		videoModal.attachCloseButtonEvent = jest.fn();
		videoModal.attachWindowClickEvent = jest.fn();

		// Act
		videoModal.init();

		// Assert
		expect(videoModal.attachVideoCardsEvents).toHaveBeenCalled();
		expect(videoModal.attachCloseButtonEvent).toHaveBeenCalled();
		expect(videoModal.attachWindowClickEvent).toHaveBeenCalled();
	});
});