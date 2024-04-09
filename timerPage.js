class Timer {
    constructor(timerId, soundUrl) {
        this.timerId = timerId;
        this.duration = 0; // in seconds
        this.intervalId = null;
        this.sound = new Audio(soundUrl);
        this.displayId = `display${timerId}`;
        this.hourInputId = `hourInput${timerId}`;
        this.minuteInputId = `minuteInput${timerId}`;
        this.secondInputId = `secondInput${timerId}`;
    }

    start() {
        if (this.intervalId) return; // Timer already running

        const hours = parseInt(document.getElementById(this.hourInputId).value, 10) || 0;
        const minutes = parseInt(document.getElementById(this.minuteInputId).value, 10) || 0;
        const seconds = parseInt(document.getElementById(this.secondInputId).value, 10) || 0;
        this.duration = hours * 3600 + minutes * 60 + seconds;

        if (this.duration <= 0) {
            alert("Please enter a valid time.");
            return;
        }

        this.updateDisplay();
        this.intervalId = setInterval(() => this.tick(), 1000);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.updateDisplay();
    }

    reset() {
        this.stop();
        this.duration = 0;
        document.getElementById(this.hourInputId).value = '';
        document.getElementById(this.minuteInputId).value = '';
        document.getElementById(this.secondInputId).value = '';
        this.updateDisplay();
    }

    tick() {
        if (this.duration > 0) {
            this.duration--;
            this.updateDisplay();
        }

        if (this.duration <= 0) {
            this.stop();
            this.sound.play().catch(e => console.error("Error playing the sound:", e));
        }
    }

    updateDisplay() {
        const hours = Math.floor(this.duration / 3600);
        const minutes = Math.floor((this.duration % 3600) / 60);
        const seconds = this.duration % 60;
        document.getElementById(this.displayId).textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const timer1 = new Timer(1, 'Sounds/hotel-bell-ding.mp3');
    const timer2 = new Timer(2, 'Sounds/hotel-bell-ding.mp3');
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

