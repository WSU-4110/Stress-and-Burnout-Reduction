class VideoModal {
    constructor(modalId, videoFrameId, closeButtonClass, videoCardClass) {
        this.modal = document.getElementById(modalId);
        this.videoFrame = document.getElementById(videoFrameId);
        this.closeButton = document.getElementsByClassName(closeButtonClass)[0];
        this.videoCards = document.querySelectorAll(videoCardClass);
        this.init(); // Initialize the modal functionality
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
        document.querySelectorAll('.like-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const videoId = button.closest('.video-card').getAttribute('data-video-id');
                const isLiked = button.classList.contains('liked');
                this.handleLikeButtonClick(button, videoId, isLiked ? 'unlike' : 'like');
            });
        });
    }

    async handleLikeButtonClick(button, videoId, action) {
        try {
            const response = await fetch('/api/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId, action })
            });

            if (response.ok) {
                const countResponse = await fetch(`/api/likes?videoId=${videoId}`);
                const data = await countResponse.json();
                this.updateLikeButtonUI(button, data.likes, action);
            }
        } catch (error) {
            console.error('Error handling like button click:', error);
        }
    }

    updateLikeButtonUI(button, likes, action) {
        const likeCountElement = button.nextElementSibling;
        likeCountElement.textContent = `${likes} Likes`;
        button.classList.toggle('liked', action === 'like');

        if (action === 'like') {
            button.innerHTML = '<i class="fa-solid fa-heart"></i> Liked';
        } else {
            button.innerHTML = '<i class="fa-regular fa-heart"></i> Like';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");
    videoModal.attachLikeButtonEvents();

    const searchInput = document.getElementById('searchInput');
    const videoCards = document.querySelectorAll('.video-card');
    const videoInfos = document.querySelectorAll('.video-info');

    searchInput.addEventListener('input', function() {
        const searchQuery = searchInput.value.toLowerCase();
        videoCards.forEach((card, index) => {
            const title = videoInfos[index].querySelector('h3').textContent.toLowerCase();
            const description = videoInfos[index].querySelector('p').textContent.toLowerCase();
            const isVisible = title.includes(searchQuery) || description.includes(searchQuery);
            card.style.display = isVisible ? '' : 'none';
        });
    });

    checkUserLoggedIn();
});

async function checkUserLoggedIn() {
    try {
        const response = await fetch('/api/username');
        const data = await response.json();
        if (!data.username) {
            alert("Please log in to like videos.");
        }
    } catch (error) {
        console.error("Error checking login status:", error);
    }
}