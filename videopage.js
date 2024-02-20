class VideoModal {
    // Constructor to initialize the modal with necessary DOM elements
    constructor(modalId, videoFrameId, closeButtonClass, videoCardClass) {
        this.modal = document.getElementById(modalId); 
        this.videoFrame = document.getElementById(videoFrameId); 
        this.closeButton = document.getElementsByClassName(closeButtonClass)[0]; 
        this.videoCards = document.querySelectorAll(videoCardClass); 
        this.init(); // Initialize the modal functionality
    }

    // Initialize the modal by attaching event listeners
    init() {
        this.attachVideoCardsEvents(); 
        this.attachCloseButtonEvent(); 
        this.attachWindowClickEvent(); 
    }

    // Attach click event listeners to each video card
    attachVideoCardsEvents() {
        this.videoCards.forEach(videoCard => {
            videoCard.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal(videoCard.getAttribute("data-video-url"));
            });
        });
    }

    // Function to open the modal and play the video
    openModal(videoUrl) {
        const embedUrl = this.transformVideoUrl(videoUrl); // Transform the video URL for embedding
        this.videoFrame.src = `${embedUrl}?autoplay=1&rel=0`; 
        this.modal.style.display = "block"; 
    }

    transformVideoUrl(videoUrl) {
        return videoUrl.replace("watch?v=", "embed/");
    }

    // Attach an event listener to the close button to close the modal
    attachCloseButtonEvent() {
        this.closeButton.onclick = () => {
            this.closeModal(); 
        };
    }

    // Attach an event listener to the window to close the modal when clicking outside of it
    attachWindowClickEvent() {
        window.onclick = (event) => {
            if (event.target === this.modal) {
                this.closeModal(); 
            }
        };
    }

    // Function to close the modal
    closeModal() {
        this.modal.style.display = "none"; 
        this.videoFrame.src = ""; 
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const videoModal = new VideoModal("modal", "videoFrame", "close", ".video-card");
});

