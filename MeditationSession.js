// Sample data for guided meditation sessions
const meditationSessions = [
    { title: "Morning Relaxation", duration: "15 min", theme: "Morning", audio: "morning_relaxation.mp3" },
    { title: "Stress Relief at Work", duration: "10 min", theme: "Work", audio: "stress_relief_at_work.mp3" },
    // Add more meditation sessions as needed
];

// Function to display meditation sessions
function displayMeditationSessions() {
    const meditationList = document.getElementById('meditation-list');

    meditationSessions.forEach(session => {
        const sessionElement = document.createElement('li');
        sessionElement.innerHTML = `<a href="#" onclick="startMeditation('${session.audio}')">${session.title}</a>`;
        meditationList.appendChild(sessionElement);
    });
}

// Function to start meditation session
function startMeditation(audioFile) {
    // Play the audio file
    // You can implement this part using HTML5 audio tag or any other preferred method
}

// Display meditation sessions when the page loads
document.addEventListener('DOMContentLoaded', displayMeditationSessions);
