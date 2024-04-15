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
                if (e.target.classList.contains('like-btn') || e.target.parentNode.classList.contains('like-btn')) {
                    return; // Prevent modal from opening when like button is clicked
                }
                let videoUrl = videoCard.getAttribute("data-video-url");
                if (videoUrl) {
                    this.openModal(videoUrl);
                }
            });
        });
    }

    openModal(videoUrl) {
        let embedUrl = videoUrl.replace("watch?v=", "embed/");
        this.videoFrame.src = `${embedUrl}?autoplay=1&rel=0`;
        this.modal.style.display = "block";
    }

    attachCloseButtonEvent() {
        this.closeButton.addEventListener('click', () => {
            this.closeModal();
        });
    }

    attachWindowClickEvent() {
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        });
    }

    closeModal() {
        this.modal.style.display = "none";
        this.videoFrame.src = "";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    checkUserLoggedIn();
    const videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");
    attachLikeButtonEvents();

    async function checkUserLoggedIn() {
        try {
            const response = await fetch('/api/username');
            const data = await response.json();
            if (!data.username) {
                alert("Please log in to like videos and access your account.");
            }
        } catch (error) {
            console.error("Error checking login status:", error);
            alert("Error checking login status. Please refresh the page.");
        }
    }

    function attachLikeButtonEvents() {
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
        button.classList.toggle('liked');

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