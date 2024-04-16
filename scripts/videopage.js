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
        this.retrieveLikes(); // Retrieve likes when the page loads
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
                const videoId = button.closest('.video-card').getAttribute('data-video-id');
                const url = `/api/likes`;
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ videoId })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const likeCountElement = button.nextElementSibling;
                    likeCountElement.textContent = `${data.likes} Likes`;
                    button.classList.toggle('liked', !button.classList.contains('liked'));
                } else {
                    console.error('Failed to toggle the like');
                }
            });
        });
    }

    async retrieveLikes() {
        const response = await fetch('/api/likes', { method: 'GET' });
        if (response.ok) {
            const likesData = await response.json();
            this.videoCards.forEach(card => {
                const videoId = card.getAttribute('data-video-id');
                if(videoId in likesData) {
                    const likeButton = card.querySelector('.like-btn');
                    const likeCount = card.querySelector('.like-count');
                    likeCount.textContent = `${likesData[videoId].totalLikes} Likes`;
                    likeButton.classList.toggle('liked', likesData[videoId].userLiked);
                }
            });
        } else {
            console.error('Failed to load likes data');
        }
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
            const isVisible = title.includes(searchQuery) || description.includes(searchQuery);
            card.style.display = isVisible ? '' : 'none';
        });
    });
});