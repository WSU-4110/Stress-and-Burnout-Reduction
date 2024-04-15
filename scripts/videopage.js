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
        const likeButtons = document.querySelectorAll('.like-btn');
        likeButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const videoCard = button.closest('.video-card');
                const videoId = videoCard.getAttribute('data-video-id');
                const isLiked = button.classList.contains('liked');
                const action = isLiked ? 'unlike' : 'like';

                this.handleLikeButtonClick(button, videoId, action);
            });
        });
    }

    async handleLikeButtonClick(button, videoId, action) {
        const response = await fetch('/api/likes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ videoId, action })
        });

        if (!response.ok) {
            alert("You need to be logged in to like videos.");
            return;
        }

        const data = await response.json();
        const likeCountElement = button.nextElementSibling;
        likeCountElement.textContent = `${data.likes} Likes`;
        button.classList.toggle('liked', action === 'like');
        button.innerHTML = action === 'like' ?
            '<i class="fa-solid fa-heart"></i> Liked' :
            '<i class="fa-regular fa-heart"></i> Like';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");
    videoModal.attachLikeButtonEvents();

    const searchInput = document.getElementById('searchInput');
    const videoCards = document.querySelectorAll('.video-card');
    const videoInfos = document.querySelectorAll('.video-info');

    searchInput.addEventListener('input', () => {
        const searchQuery = searchInput.value.toLowerCase();
        videoCards.forEach((card, index) => {
            const title = videoInfos[index].querySelector('h3').textContent.toLowerCase();
            const description = videoInfos[index].querySelector('p').textContent.toLowerCase();
            card.style.display = (title.includes(searchQuery) || description.includes(searchQuery)) ? '' : 'none';
        });
    });
});