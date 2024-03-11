document.addEventListener('DOMContentLoaded', function() {
    var dayOfWeek = new Date().getDay();
    const contentStrategy = {
        1: setupMondayContent,
        2: setupTuesdayContent,
        3: setupWednesdayContent,
        4: setupThursdayContent,
        5: setupFridayContent,
        6: setupSaturdayContent,
        0: setupSundayContent,
    };

    // Execute the strategy for the current day
    if (contentStrategy[dayOfWeek]) {
        contentStrategy[dayOfWeek]();
    }
});

function setupMondayContent() {
    const content = `
        <div class="day-checker">
            <p>Monday</p>
        </div>
    `;
    document.querySelector('#item2').innerHTML = content;
}

function setupTuesdayContent() {
    const content = `
        <div class="day-checker">
            <p>Tuesday</p>
        </div>
    `;
    document.querySelector('#item2').innerHTML = content;
}

function setupWednesdayContent() {
    const content = `
        <div class="interactive-box">
            <button class="sound-button" data-sound="keyboard-typing.mp3">Keyboard Typing</button>
            <button class="sound-button" data-sound="deep-breath.mp3">Deep Breath</button>
            <button class="sound-button" data-sound="ziplock-bag.mp3">Ziplock Bag</button>
        </div>
    `;
    document.querySelector('#item2 h1').innerHTML = content; // Ensure this targets the correct container
    
    document.querySelectorAll('.sound-button').forEach(button => {
        let audio = new Audio(button.dataset.sound);
        
        const playSound = () => {
            if (audio.paused) {
                audio.play();
            } else {
                audio.currentTime = 0; // Restart the audio if it's already playing
            }
        };
        
        const stopSound = () => {
            audio.pause();
            audio.currentTime = 0; // Reset audio position to start
        };

        // Event listeners
        button.addEventListener('mousedown', () => {
            playSound();
            audio.loop = true; // Keep repeating audio if they continue to hold down
        });

        button.addEventListener('mouseup', stopSound);
        button.addEventListener('mouseleave', stopSound); // Consider pausing and resetting audio if the mouse leaves the button while holding down
    });
}

function setupThursdayContent() {
    const content = `<img class="cat-gif" src="https://i.pinimg.com/originals/36/99/23/3699234f311b8d44ba46d6503b4a033c.gif" alt="Cat">`;
    document.querySelector('#item2').innerHTML = content;
    const sound = new Audio('purring-cat.mp3');
    sound.loop = true; // Enable looping

    const catGif = document.querySelector('.cat-gif');
    
    catGif.addEventListener('mouseenter', () => {
        sound.play();
    });

    catGif.addEventListener('mouseleave', () => {
        sound.pause();
        sound.currentTime = 0; // Optionally reset the audio to start to ensure it starts from the beginning next time
    });
}

function setupFridayContent() {
    const content = `
        <div class="day-checker">
            <p>friday</p>
        </div>
    `;
    document.querySelector('#item2').innerHTML = content;
}

function setupSaturdayContent() {
    const content = `
        <div class="day-checker">
            <p>saturday</p>
        </div>
    `;
    document.querySelector('#item2').innerHTML = content;
}

function setupSundayContent() {
    const content = `
        <div class="day-checker">
            <p>sunday</p>
        </div>
    `;
    document.querySelector('#item2').innerHTML = content;
}