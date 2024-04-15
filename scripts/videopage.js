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
                e.stopPropagation();
                const videoId = button.closest('.video-card').getAttribute('data-video-id');
                const isLiked = button.classList.contains('liked');
                this.toggleLike(videoId, !isLiked, button);
            });
        });
    }

    toggleLike(videoId, liked, button) {
        fetch(`/api/likes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId, liked })
        })
        .then(response => response.json())
        .then(data => {
            const likeCount = data.likes;
            const likeCountElement = button.nextElementSibling;
            likeCountElement.textContent = `${likeCount} Likes`;
            button.classList.toggle('liked', liked);

            if (liked) {
                button.innerHTML = '<i class="fa-solid fa-heart"></i> Liked';
            } else {
                button.innerHTML = '<i class="fa-regular fa-heart"></i> Like';
            }
        })
        .catch(error => console.warn('Error updating like:', error));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");
    videoModal.attachLikeButtonEvents();
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/username').then(response => {
        if (!response.ok) throw new Error('Not logged in');
        return response.json();
    })
    .then(data => {
        if (!data.username) {
            alert("Please log in to interact with videos.");
        }
    })
    .catch(() => alert("Please log in to interact with videos."));
});