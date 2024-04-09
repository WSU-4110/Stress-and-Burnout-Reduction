// Function to create a timer
function createTimer(timerId, duration) {
    var timerDisplay = document.getElementById(timerId);
    var minutes = duration;
    var seconds = 0;
    var timerInterval;

    function updateTimerDisplay() {
        seconds--;
        if (seconds < 0) {
            if (minutes == 0) {
                clearInterval(timerInterval);
                return;
            } else {
                minutes--;
                seconds = 59;
            }
        }
        timerDisplay.textContent = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }

    function startTimer() {
        timerInterval = setInterval(updateTimerDisplay, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function resetTimer() {
        clearInterval(timerInterval);
        minutes = duration;
        seconds = 0;
        timerDisplay.textContent = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }

    return {
        start: startTimer,
        stop: stopTimer,
        reset: resetTimer
    };
}

// Initialize timers for each challenge
var deepBreathingTimer = createTimer('Timer1', 10);
var mindfulWalkingTimer = createTimer('Timer2', 10);
var gratitudeJournalingTimer = createTimer('Timer3', 20);
var stretchBreaksTimer = createTimer('Timer4', 10);
var digitalDetoxTimer = createTimer('Timer5', 20);
var progressiveMuscleRelaxationTimer = createTimer('Timer6', 10);
var natureConnectionTimer = createTimer('Timer7', 20);
var visualizationExerciseTimer = createTimer('Timer8', 10);
var socialConnectionTimer = createTimer('Timer9', 20);
var selfCompassionPracticeTimer = createTimer('Timer10', 10);

// Add event listeners for buttons
document.getElementById('startTimer1').addEventListener('click', function() { deepBreathingTimer.start(); });
document.getElementById('stopTimer1').addEventListener('click', function() { deepBreathingTimer.stop(); });
document.getElementById('resetTimer1').addEventListener('click', function() { deepBreathingTimer.reset(); });

document.getElementById('startTimer2').addEventListener('click', function() { mindfulWalkingTimer.start(); });
document.getElementById('stopTimer2').addEventListener('click', function() { mindfulWalkingTimer.stop(); });
document.getElementById('resetTimer2').addEventListener('click', function() { mindfulWalkingTimer.reset(); });

document.getElementById('startTimer3').addEventListener('click', function() { gratitudeJournalingTimer.start(); });
document.getElementById('stopTimer3').addEventListener('click', function() { gratitudeJournalingTimer.stop(); });
document.getElementById('resetTimer3').addEventListener('click', function() { gratitudeJournalingTimer.reset(); });

document.getElementById('startTimer4').addEventListener('click', function() { stretchBreaksTimer.start(); });
document.getElementById('stopTimer4').addEventListener('click', function() { stretchBreaksTimer.stop(); });
document.getElementById('resetTimer4').addEventListener('click', function() { stretchBreaksTimer.reset(); });

document.getElementById('startTimer5').addEventListener('click', function() { digitalDetoxTimer.start(); });
document.getElementById('stopTimer5').addEventListener('click', function() { digitalDetoxTimer.stop(); });
document.getElementById('resetTimer5').addEventListener('click', function() { digitalDetoxTimer.reset(); });

document.getElementById('startTimer6').addEventListener('click', function() { progressiveMuscleRelaxationTimer.start(); });
document.getElementById('stopTimer6').addEventListener('click', function() { progressiveMuscleRelaxationTimer.stop(); });
document.getElementById('resetTimer6').addEventListener('click', function() { progressiveMuscleRelaxationTimer.reset(); });

document.getElementById('startTimer7').addEventListener('click', function() { natureConnectionTimer.start(); });
document.getElementById('stopTimer7').addEventListener('click', function() { natureConnectionTimer.stop(); });
document.getElementById('resetTimer7').addEventListener('click', function() { natureConnectionTimer.reset(); });

document.getElementById('startTimer8').addEventListener('click', function() { visualizationExerciseTimer.start(); });
document.getElementById('stopTimer8').addEventListener('click', function() { visualizationExerciseTimer.stop(); });
document.getElementById('resetTimer8').addEventListener('click', function() { visualizationExerciseTimer.reset(); });

document.getElementById('startTimer9').addEventListener('click', function() { socialConnectionTimer.start(); });
document.getElementById('stopTimer9').addEventListener('click', function() { socialConnectionTimer.stop(); });
document.getElementById('resetTimer9').addEventListener('click', function() { socialConnectionTimer.reset(); });

document.getElementById('startTimer10').addEventListener('click', function() { selfCompassionPracticeTimer.start(); });
document.getElementById('stopTimer10').addEventListener('click', function() { selfCompassionPracticeTimer.stop(); });
document.getElementById('resetTimer10').addEventListener('click', function() { selfCompassionPracticeTimer.reset(); });
