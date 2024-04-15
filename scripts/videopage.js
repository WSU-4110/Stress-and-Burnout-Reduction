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
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleLikeButtonClick(button);
            });
        });
    }

    handleLikeButtonClick(button) {
        const videoId = button.closest('.video-card').getAttribute('data-video-id');
        button.disabled = true; // Disable the button while processing
        fetch(`/api/likes/${videoId}`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                const likeCountElement = button.nextElementSibling;
                likeCountElement.textContent = `0 Likes`; // Update based on response data if provided by API
                toggleLikeButton(button); // Toggle the button state visually
            })
            .catch(error => {
                console.error("Error handling like:", error);
            })
            .finally(() => {
                button.disabled = false; // Re-enable the button
            });
    }

    toggleLikeButton(button) {
        if (button.classList.contains('liked')) {
            button.innerHTML = '<i class="fa-regular fa-heart"></i> Like';
            button.classList.remove('liked');
        } else {
            button.innerHTML = '<i class="fa-solid fa-heart"></i> Liked';
            button.classList.add('liked');
        }
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