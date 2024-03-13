// General base Modal interface for different types of modals
class Modal {
    constructor() {
        if (this.constructor === Modal) {
            throw new Error("Abstract class Modal cannot be instantiated directly.");
        }
    }

    init() {
        throw new Error("Method 'init()' must be implemented.");
    }

    openModal() {
        throw new Error("Method 'openModal()' must be implemented.");
    }

    closeModal() {
        throw new Error("Method 'closeModal()' must be implemented.");
    }
}

class VideoModal extends Modal {
    constructor(modalId, videoFrameId, closeButtonClass, videoCardClass) {
        super(); // Call the constructor of the base Modal class
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
}

// Factory that determines which type of modal to create
class ModalFactory {
    static createModal(type, options) {
        switch (type) {
            case "video":
                return new VideoModal(options.modalId, options.videoFrameId, options.closeButtonClass, options.videoCardClass);
            default:
                throw new Error("Invalid modal type");
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const videoModal = ModalFactory.createModal("video", {
        modalId: "modal",
        videoFrameId: "videoFrame",
        closeButtonClass: "close",
        videoCardClass: ".video-card"
    });
});


