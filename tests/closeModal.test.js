const VideoModal = require('../scripts/videopage');

// Mock for window.fetch
global.fetch = jest.fn(() =>
	Promise.resolve({
		ok: true,
		json: () => Promise.resolve({
			likes: 10,
			liked: true
		})
	})
);

describe('VideoModal - closeModal', () => {
	beforeEach(() => {
		// Mocking DOM elements and their methods
		document.getElementById = jest.fn((id) => {
			if (id === 'modal') {
				return {
					style: {
						display: ''
					}
				}; // Mock modal element
			}
			if (id === 'videoFrame') {
				return {
					src: ''
				}; // Mock videoFrame element
			}
			return null;
		});

		document.getElementsByClassName = jest.fn(className => {
			if (className === 'close') return [{
				onclick: jest.fn()
			}];
			return [];
		});

		document.querySelectorAll = jest.fn(selector => {
			if (selector === '.video-card') {
				return [{
					getAttribute: jest.fn(name => {
						if (name === 'data-video-id') return '123';
					}),
					querySelector: jest.fn(() => ({
						textContent: '',
						classList: {
							toggle: jest.fn()
						},
						innerHTML: '',
					})),
					addEventListener: jest.fn()
				}];
			} else if (selector === '.like-btn') {
				return [{
					addEventListener: jest.fn(),
					classList: {
						toggle: jest.fn()
					},
					nextElementSibling: {
						textContent: ''
					},
					closest: jest.fn(() => ({
						getAttribute: jest.fn(() => '123')
					}))
				}];
			}
			return [];
		});

		fetch.mockClear();
	});

	it('hides modal and clears videoFrame src', () => {
		const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
		videoModal.openModal('https://www.example.com');
		videoModal.closeModal();

		expect(videoModal.modal.style.display).toBe('none');
		expect(videoModal.videoFrame.src).toBe('');
	});
});