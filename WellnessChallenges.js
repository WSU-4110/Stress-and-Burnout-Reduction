class Timer {
    constructor(timerDisplayId, startButtonId, resetButtonId) {
        this.timerDisplay = document.getElementById(timerDisplayId);
        this.startButton = document.getElementById(startButtonId);
        this.resetButton = document.getElementById(resetButtonId);
        
        this.timerInterval = null;
        this.remainingTime = 300; // 5 minutes in seconds
        this.isTimerRunning = false;
        
        this.startButton.addEventListener('click', this.start.bind(this));
        this.resetButton.addEventListener('click', this.reset.bind(this));
    }

    start() {
        if (!this.isTimerRunning) {
            this.timerInterval = setInterval(() => {
                this.remainingTime--;
                this.updateTimerDisplay();
                if (this.remainingTime <= 0) {
                    this.stop();
                    this.displayMessage();
                }
            }, 1000);
            this.isTimerRunning = true;
        }
    }

    reset() {
        clearInterval(this.timerInterval);
        this.remainingTime = 300;
        this.updateTimerDisplay();
        this.isTimerRunning = false;
    }

    stop() {
        clearInterval(this.timerInterval);
        this.isTimerRunning = false;
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.remainingTime / 60).toString().padStart(2, '0');
        const seconds = (this.remainingTime % 60).toString().padStart(2, '0');
        this.timerDisplay.textContent = `${minutes}:${seconds}`;
    }

    displayMessage() {
        alert('Congratulations! You completed the 5-minute challenge!');
    }
}

// Create timer for Deep Breathing Exercise challenge
const timer1 = new Timer('timerDisplay1', 'startTimer1', 'resetTimer1');
