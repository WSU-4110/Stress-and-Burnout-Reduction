document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById("modal");
    const span = document.getElementsByClassName("close")[0];
    const videoFrame = document.getElementById("videoFrame");

    const videos = document.getElementsByClassName("video-card");
    Array.from(videos).forEach(function(video) {
        video.addEventListener('click', function(e) {
            e.preventDefault();
            const videoUrl = this.getAttribute("data-video-url");
            const embedUrl = videoUrl.replace("watch?v=", "embed/");
            videoFrame.src = embedUrl + "?autoplay=1&rel=0"; // Set the src and enable autoplay
            modal.style.display = "block";
        });
    });

    // Close
    span.onclick = function() {
        modal.style.display = "none";
        videoFrame.src = ""; // Stop the video
    }

    // Close the modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            videoFrame.src = ""; // Stop the video
        }
    }
});