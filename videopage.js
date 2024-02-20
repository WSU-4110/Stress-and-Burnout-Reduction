// Waits until DOM is loaded before running script
document.addEventListener('DOMContentLoaded', function() {
    // Retrieves modal element using its ID
    const modal = document.getElementById("modal");
    const span = document.getElementsByClassName("close")[0];
    // Retrieves iframe element where the video will be embedded
    const videoFrame = document.getElementById("videoFrame");

    // Attaches click event listeners to elements with video-card class
    document.querySelectorAll(".video-card").forEach(function(video) {
        video.addEventListener('click', function(e) {
            e.preventDefault();
            const videoUrl = this.getAttribute("data-video-url");
            // Transforms video URL into proper embed URL and autoplay
            const embedUrl = videoUrl.replace("watch?v=", "embed/");
            videoFrame.src = `${embedUrl}?autoplay=1&rel=0`;
            // Displays modal
            modal.style.display = "block";
        });
    });

    // Onclick event listener attached to close button
    span.onclick = function() {
        // Hides the modal
        modal.style.display = "none";
        videoFrame.src = "";
    }
    
    // Onclick event listener attached to window
    window.onclick = function(event) {
        // Checks if click event is outside video player
        if (event.target === modal) {
            // Hides the modal and clears video src
            modal.style.display = "none";
            videoFrame.src = "";
        }
    }
});
