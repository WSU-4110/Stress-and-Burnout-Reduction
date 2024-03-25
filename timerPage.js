let timers = {};

function startTimer(timerId) {
    const inputId = `timeInput${timerId}`;
    const displayId = `display${timerId}`;

    if (timers[timerId]) {
        return; // Timer already running
    }

    let duration = parseInt(document.getElementById(inputId).value);
    if (isNaN(duration) || duration <= 0) {
        alert("Please enter a valid number of seconds.");
        return;
    }

    updateDisplay(timerId, duration);
    timers[timerId] = setInterval(() => {
        duration--;
        updateDisplay(timerId, duration);
        if (duration <= 0) {
            clearInterval(timers[timerId]);
            delete timers[timerId];
            alert(`Timer ${timerId} done!`);
        }
    }, 1000);
}

function stopTimer(timerId) {
    if (timers[timerId]) {
        clearInterval(timers[timerId]);
        delete timers[timerId];
    }
}

function resetTimer(timerId) {
    stopTimer(timerId);
    updateDisplay(timerId, 0);
}

function updateDisplay(timerId, time) {
    const displayId = `display${timerId}`;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    document.getElementById(displayId).textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
