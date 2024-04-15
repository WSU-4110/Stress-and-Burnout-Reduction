class VideoModal {
	// Initialize modal functionality
	constructor(modalId, videoFrameId, closeButtonClass, videoCardClass) {
		this.modal = document.getElementById(modalId);
		this.videoFrame = document.getElementById(videoFrameId);
		this.closeButton = document.getElementsByClassName(closeButtonClass)[0];
		this.videoCards = document.querySelectorAll(videoCardClass);
		this.init();
	}

	init() {
		this.attachVideoCardsEvents();
		this.attachCloseButtonEvent();
		this.attachWindowClickEvent();
		this.attachLikeButtonEvents(); // Handle like-button events
	}

	attachVideoCardsEvents() {
		this.videoCards.forEach(videoCard => {
			videoCard.addEventListener('click', (e) => {
				e.preventDefault();
				this.openModal(videoCard.getAttribute('data-video-url'));
			});
		});
	}

	openModal(videoUrl) {
		const embedUrl = this.transformVideoUrl(videoUrl); 
		this.videoFrame.src = `${embedUrl}?autoplay=1&rel=0`;
		this.modal.style.display = 'block';
	}

	transformVideoUrl(videoUrl) {
		return videoUrl.replace('watch?v=', 'embed/');
	}

	attachCloseButtonEvent() {
		this.closeButton.onclick = () => this.closeModal();
	}

	attachWindowClickEvent() {
		window.onclick = (event) => {
			if (event.target === this.modal) {
				this.closeModal();
			}
		};
	}

	closeModal() {
		this.modal.style.display = 'none';
		this.videoFrame.src = '';
	}

	attachLikeButtonEvents() {
		const likeButtons = document.querySelectorAll('.like-btn');
		likeButtons.forEach(button => {
			button.addEventListener('click', async (e) => {
				e.stopPropagation();
				const videoId = button.closest('.video-card').getAttribute('data-video-id');
				const liked = button.classList.contains('liked');
				const url = '/api/likes';

				const response = await fetch(url, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ videoId: videoId, action: liked ? 'unlike' : 'like' })
				});

				if (response.ok) {
					const data = await response.json();
					button.nextElementSibling.textContent = `${data.likesCount} Likes`;
					button.classList.toggle('liked');
					button.innerHTML = liked ? '<i class="fa-solid fa-heart"></i> Liked' : '<i class="fa-regular fa-heart"></i> Like';
				}
			});
		});
	}
}

document.addEventListener('DOMContentLoaded', function() {
	fetch('/api/username')
		.then(response => response.json())
		.then(data => {
			if (!data.username) {
				alert('Please log in to like videos and access your account.');
			} else {
				const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
				const searchInput = document.getElementById('searchInput');
				const videoCards = document.querySelectorAll('.video-card');
				const videoInfos = document.querySelectorAll('.video-info');

				searchInput.addEventListener('input', () => {
					const searchQuery = searchInput.value.toLowerCase();
					videoCards.forEach((card, index) => {
						const title = videoInfos[index].querySelector('h3').textContent.toLowerCase();
						const description = videoInfos[index].querySelector('p').textContent.toLowerCase();
						const isVisible = title.includes(searchQuery) || description.includes(searchQuery);
						card.style.display = isVisible ? '' : 'none';
					});
				});
			}
		})
		.catch(error => console.error('Error:', error));
});