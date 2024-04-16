class VideoModal {
    constructor(modalId, videoFrameId, closeButtonClass, videoCardClass) {
        this.modal = document.getElementById(modalId);
        this.videoFrame = document.getElementById(videoFrameId);
        this.closeButton = document.getElementsByClassName(closeButtonClass)[0];
        this.videoCards = document.querySelectorAll(videoCardClass);
        this.init();
    }

    async init() {
        this.attachVideoCardsEvents();
        this.attachCloseButtonEvent();
        this.attachWindowClickEvent();
        this.attachLikeButtonEvents();
        await this.updateAllLikeStates();
    }

    async updateAllLikeStates() {
        this.videoCards.forEach(async(card) => {
            const videoId = card.getAttribute('data-video-id');
            try {
                const response = await fetch(`/api/likes?videoId=${videoId}`);
                const data = await response.json();
                if (response.ok) {
                    const likeButton = card.querySelector('.like-btn');
                    const likeCountElement = card.querySelector('.like-count');
                    likeCountElement.textContent = `${data.likes} Likes`;
                    likeButton.classList.toggle('liked', data.liked);
                    likeButton.innerHTML = data.liked ?
                        '<i class="fa-solid fa-heart"></i> Liked' :
                        '<i class="fa-regular fa-heart"></i> Like';
                }
            } catch (error) {
                console.error('Error fetching like data:', error);
            }
        });
    }

    attachVideoCardsEvents() {
        this.videoCards.forEach(videoCard => {
            videoCard.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal(videoCard.getAttribute("data-video-url"));
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
                const videoId = button.closest('.video-card').getAttribute('data-video-id');
                try {
                    const response = await fetch(`/api/likes`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ videoId })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        const likeCountElement = button.nextElementSibling;
                        likeCountElement.textContent = `${data.likes} Likes`;
                        button.classList.toggle('liked', data.liked);
                        button.innerHTML = data.liked ?
                            '<i class="fa-solid fa-heart"></i> Liked' :
                            '<i class="fa-regular fa-heart"></i> Like';
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");

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

module.exports = VideoModal;