document.addEventListener('DOMContentLoaded', function() {
    const timerDisplay = document.getElementById('timer-display');
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    let timerInterval;
    let timeLeft = 300; // 5 minutes in seconds

    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, 1000);
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timeLeft = 300;
        updateTimerDisplay();
    }

    function updateTimer() {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            alert('Time\'s up!');
        }
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    startButton.addEventListener('click', startTimer);
    resetButton.addEventListener('click', resetTimer);

    // Initialize timer display
    updateTimerDisplay();
});
