class Timer {
    constructor(timerId, soundUrl) {
        this.timerId = timerId;
        this.duration = 0;
        this.intervalId = null;
        this.sound = new Audio(soundUrl);
        this.displayId = `display${timerId}`;
        this.inputId = `timeInput${timerId}`;
    }

    start() {
        if (this.intervalId) return; // Timer already running
    
        if (this.duration <= 0) {
            this.duration = parseInt(document.getElementById(this.inputId).value);
            if (isNaN(this.duration) || this.duration <= 0) {
                alert("Please enter a valid number of seconds.");
                return;
            }
        }
    
        this.updateDisplay();
        this.intervalId = setInterval(() => this.tick(), 1000);
    }    

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    reset() {
        this.stop();
        this.duration = 0;
        this.updateDisplay();
    }

    tick() {
        this.duration--;
        this.updateDisplay();
        if (this.duration <= 0) {
            this.stop();
            this.sound.play().catch(e => console.error("Error playing the sound:", e));
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.duration / 60);
        const seconds = this.duration % 60;
        document.getElementById(this.displayId).textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const timer1 = new Timer(1, 'Sounds/hotel-bell-ding.mp3');
    const timer2 = new Timer(2, 'Sounds/hotel-bell-ding.mp3'); // Adjust paths if using different sounds
    const timer3 = new Timer(3, 'Sounds/hotel-bell-ding.mp3');

    document.getElementById('start1').addEventListener('click', () => timer1.start());
    document.getElementById('stop1').addEventListener('click', () => timer1.stop());
    document.getElementById('reset1').addEventListener('click', () => timer1.reset());

    document.getElementById('start2').addEventListener('click', () => timer2.start());
    document.getElementById('stop2').addEventListener('click', () => timer2.stop());
    document.getElementById('reset2').addEventListener('click', () => timer2.reset());

    document.getElementById('start3').addEventListener('click', () => timer3.start());
    document.getElementById('stop3').addEventListener('click', () => timer3.stop());
    document.getElementById('reset3').addEventListener('click', () => timer3.reset());
});
