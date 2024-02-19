document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById("modal");
    const span = document.getElementsByClassName("close")[0];
    const videoFrame = document.getElementById("videoFrame");

    document.querySelectorAll(".video-card").forEach(function(video) {
        video.addEventListener('click', function(e) {
            e.preventDefault();
            const videoUrl = this.getAttribute("data-video-url");
            const embedUrl = videoUrl.replace("watch?v=", "embed/");
            videoFrame.src = `${embedUrl}?autoplay=1&rel=0`;
            modal.style.display = "block";
        });
    });

    span.onclick = function() {
        modal.style.display = "none";
        videoFrame.src = "";
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
            videoFrame.src = "";
        }
    }
});
