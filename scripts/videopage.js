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
        this.attachLikeButtonEvents();
    }

    attachVideoCardsEvents() {
        this.videoCards.forEach(card => {
            card.addEventListener('click', e => {
                e.preventDefault();
                this.openModal(card.getAttribute("data-video-url"));
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
        this.closeButton.onclick = () => this.closeModal();
    }

    attachWindowClickEvent() {
        window.onclick = event => {
            if (event.target === this.modal) this.closeModal();
        };
    }

    closeModal() {
        this.modal.style.display = "none";
        this.videoFrame.src = "";
    }

    attachLikeButtonEvents() {
        document.querySelectorAll('.like-btn').forEach(button => {
            button.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                this.handleLikeButtonClick(button);
            });
        });
    }

    handleLikeButtonClick(button) {
        const videoId = button.closest('.video-card').getAttribute('data-video-id');
        const isLiked = button.classList.contains('liked');
        const action = isLiked ? 'unlike' : 'like';
    
        fetch(`/api/likes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ videoId })
            })
            .then(response => response.json())
            .then(data => {
                const likeCountElement = button.nextElementSibling;
                likeCountElement.textContent = `${data.likes} Likes`;
                button.classList.toggle('liked', !isLiked);
                if (!isLiked) {
                    button.innerHTML = '<i class="fa-solid fa-heart"></i> Liked';
                } else {
                    button.innerHTML = '<i class="fa-regular fa-heart"></i> Like';
                }
            })
            .catch(error => console.error('Error:', error));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const videoCards = document.querySelectorAll('.video-card');
    const videoInfos = document.querySelectorAll('.video-info');

    searchInput.addEventListener('input', () => {
        const searchQuery = searchInput.value.toLowerCase();
        videoCards.forEach((card, index) => {
            const title = videoInfos[index].querySelector('h3').textContent.toLowerCase();
            const description = videoInfos[index].querySelector('p').textContent.toLowerCase();
            card.style.display = title.includes(searchQuery) || description.includes(searchQuery) ? '' : 'none';
        });
    });
});

module.exports = VideoModal;