document.addEventListener('DOMContentLoaded', function() {
    var dayOfWeek = new Date().getDay();
    switch(dayOfWeek) {
        case 1: // Monday
            setupMondayContent();
            break;
        case 2: // Tuesday
            setupTuesdayContent();
            break;
        case 3: // Wednesday
            setupWednesdayContent();
            break;
        case 4: // Thursday
            setupThursdayContent();
            break;
        case 5: // Friday
            setupFridayContent();
            break;
        case 6: // Saturday
            setupSaturdayContent();
            break;
        case 7: // Sunday
            setupSundayContent();
            break;
    }
});


function setupWednesdayContent() {
    const content = `
        <button class="sound-button" data-sound="keyboard-typing.mp3">Keyboard Typing</button>
        <button class="sound-button" data-sound="deep-breath.mp3">Deep Breath</button>
        <button class="sound-button" data-sound="ziplock-bag.mp3">Ziplock Bag</button>
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
    document.querySelector('#item2 h1').innerHTML = content;
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