const VideoModal = require('../scripts/videopage');

describe('VideoModal - openModal', () => {
	beforeEach(() => {
		// Mock modal element
		document.getElementById = jest.fn((id) => {
			if (id === 'modal') return {
				style: {
					display: 'none'
				}
			};
			if (id === 'videoFrame') return {
				src: ''
			}; // Mock videoFrame element
			return null;
		});

		document.getElementsByClassName = jest.fn(className => {
			if (className === 'close') return [{
				onclick: null
			}];
			return [];
		});

		document.querySelectorAll = jest.fn(selector => {
			if (selector === '.video-card') return [{
				addEventListener: jest.fn()
			}];
			return [];
		});
	});

	it('sets videoFrame src and displays modal', () => {
		const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
		const testUrl = 'https://www.example.com/videoUrl';
		videoModal.openModal(testUrl);

		expect(videoModal.videoFrame.src).toContain('https://www.example.com/videoUrl');
		expect(videoModal.modal.style.display).toBe('block');
	});
});