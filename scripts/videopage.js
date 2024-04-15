class VideoModal {
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
    }

    attachVideoCardsEvents() {
        this.videoCards.forEach(videoCard => {
            videoCard.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal(videoCard.dataset.videoUrl);
            });
        });
    }

    openModal(videoUrl) {
        const embedUrl = this.transformVideoUrl(videoUrl);
        this.videoFrame.src = `${embedUrl}?autoplay=1&rel=0`;
        this.modal.style.display = "block";
    }

    transformVideoUrl(videoUrl) {
        return videoUrl.replace("watch?v=", "embed/");
    }

    attachCloseButtonEvent() {
        this.closeButton.onclick = () => {
            this.closeModal();
        };
    }

    attachWindowClickEvent() {
        window.onclick = (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        };
    }

    closeModal() {
        this.modal.style.display = "none";
        this.videoFrame.src = "";
    }

    attachLikeButtonEvents() {
        document.querySelectorAll('.like-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const videoId = button.closest('.video-card').dataset.videoId;
                const isLiked = button.classList.contains('liked');
                const action = isLiked ? 'unlike' : 'like';

                const response = await fetch('/api/likes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ videoId, likeAction: action })
                });

                if (response.ok) {
                    const data = await response.json();
                    button.nextElementSibling.textContent = `${data.likes} Likes`;
                    if (action === 'like') {
                        button.classList.add('liked');
                        button.innerHTML = '<i class="fa-solid fa-heart"></i> Liked';
                    } else {
                        button.classList.remove('liked');
                        button.innerHTML = '<i class="fa-regular fa-heart"></i> Like';
                    }
                } else {
                    console.error('Error updating like status');
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");
    videoModal.attachLikeButtonEvents(); // Attach event listeners to like buttons

    // Implement search feature
    const searchInput = document.getElementById('searchInput');
    const videoCards = document.querySelectorAll('.video-card');

    searchInput.addEventListener('input', () => {
        const searchQuery = searchInput.value.toLowerCase();
        videoCards.forEach(card => {
            const title = card.querySelector('.video-info h3').textContent.toLowerCase();
            const description = card.querySelector('.video-info p').textContent.toLowerCase();
            card.style.display = (title.includes(searchQuery) || description.includes(searchQuery)) ? '' : 'none';
        });
    });
});