document.addEventListener('DOMContentLoaded', function() {
	checkUserLoggedIn();

	const videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");
	videoModal.attachLikeButtonEvents();

	// Check if the user is logged in and show popup if not
	async function checkUserLoggedIn() {
		try {
			const response = await fetch('/api/username');
			const data = await response.json();
			if (!data.username) {
				alert("Please log in to like videos and access your account.");
			}
		} catch (error) {
			console.error("Error checking login status:", error);
		}
	}

	async function attachLikeButtonEvents() {
		document.querySelectorAll('.like-btn').forEach(button => {
			button.addEventListener('click', async (e) => {
				e.stopPropagation();
				const videoCard = button.closest('.video-card');
				const videoId = videoCard.getAttribute('data-video-id');
				const liked = button.classList.contains('liked');
				const response = await fetch('/api/likes', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ videoId, like: !liked })
				});

				if (response.ok) {
					updateLikesCount(videoId, button);
				} else if (response.status === 403) {
					alert("You must be logged in to like videos.");
				} else {
					alert("An error occurred, please try again later.");
				}
			});
		});
	}

	async function updateLikesCount(videoId, button) {
		const countSpan = button.nextElementSibling;
		const response = await fetch(`/api/likes?videoId=${videoId}`);
		const data = await response.json();
		countSpan.textContent = `${data.likes} Likes`;
		button.classList.toggle('liked', data.likedByUser);

		if (button.classList.contains('liked')) {
			button.innerHTML = '<i class="fa-solid fa-heart"></i> Liked';
		} else {
			button.innerHTML = '<i class="fa-regular fa-heart"></i> Like';
		}
	}

	// Search functionality
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
});