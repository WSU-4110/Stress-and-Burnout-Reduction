class DayContent {
    setupContent() {
        throw new Error("This method should be implemented by subclasses");
    }

    adjustInteractiveBoxStyle(flexDirection, justifyContent = 'center', alignItems = 'center') {
        const box = document.querySelector('.interactive-box');
        if (box) {
            box.style.flexDirection = flexDirection;
            box.style.justifyContent = justifyContent;
            box.style.alignItems = alignItems;
        }
    }
}

class MondayContent extends DayContent {
    setupContent() {
        const content = `
            <div class="interactive-box">
                <p id="affirmation-text">You are capable and brave!</p>
                <button id="generate-affirmation">New Affirmation</button>
            </div>
        `;
        document.querySelector('#item2').innerHTML = content;

        document.getElementById('generate-affirmation').addEventListener('click', this.generateNewAffirmation);
        this.adjustInteractiveBoxStyle('column');
    }

    generateNewAffirmation() {
        const affirmations = [
            "You are enough.",
            "You are doing your best.",
            "You bring something unique to the world.",
            "You can handle this challenge.",
            "You are loved and appreciated.",
            "Your possibilities are endless.",
            "You are strong and resilient."
        ];

        const index = Math.floor(Math.random() * affirmations.length);
        document.getElementById('affirmation-text').textContent = affirmations[index];
    }
}

class TuesdayContent extends DayContent {
    setupContent() {
        const content = `
            <div class="interactive-box" id="worry-box">
                <p class="instruction-text">Enter your worries:</p>
                <textarea id="worry-text" placeholder="Type your worries here..."></textarea>
                <button id="submit-worry">Submit</button>
            </div>
        `;
        document.querySelector('#item2').innerHTML = content;

        document.getElementById('submit-worry').addEventListener('click', () => {
            this.handleWorrySubmission();
        });
        this.adjustInteractiveBoxStyle('column');
    }

    handleWorrySubmission() {
        const worryText = document.getElementById('worry-text');
        if (worryText.value.trim() !== "") {
            const animation = worryText.animate([
                { opacity: 1 },
                { opacity: 0 }
            ], {
                duration: 1000,
            });
    
            animation.onfinish = () => {
                worryText.value = "";
                worryText.style.opacity = 1;
            };
        }
    }
}

class WednesdayContent extends DayContent {
    setupContent() {
    const content = `
        <div class="interactive-box">
            <p class="instruction-text">ASMR</p>
            <button class="sound-button" data-sound="keyboard-typing.mp3">Keyboard Typing</button>
            <button class="sound-button" data-sound="deep-breath.mp3">Deep Breath</button>
            <button class="sound-button" data-sound="ziplock-bag.mp3">Ziplock Bag</button>
        </div>
    `;
    document.querySelector('#item2').innerHTML = content;
    
    document.querySelectorAll('.sound-button').forEach(button => {
        let audio = new Audio(button.dataset.sound);
        
        const playSound = () => {
            if (audio.paused) {
                audio.play();
            } else {
                audio.currentTime = 0;
            }
        };
        
        const stopSound = () => {
            audio.pause();
            audio.currentTime = 0;
        };

        button.addEventListener('mousedown', () => {
            playSound();
            audio.loop = true;
        });

        button.addEventListener('mouseup', stopSound);
        button.addEventListener('mouseleave', stopSound);
    });
}
}

class ThursdayContent extends DayContent {
    setupContent() {
        const content = `
            <div class="interactive-box" id="cat-box">
                <p class="instruction-text">Pet the Cat!</p>
                <img class="cat-gif" src="https://i.pinimg.com/originals/36/99/23/3699234f311b8d44ba46d6503b4a033c.gif" alt="Cat" style="max-width: 100%; height: auto; border-radius: 8px;">
            </div>
        `;
        document.querySelector('#item2').innerHTML = content;
        this.adjustInteractiveBoxStyle('column');
        const catGif = document.querySelector('.cat-gif');
        const sound = new Audio('purring-cat.mp3');
        sound.loop = true;

        catGif.addEventListener('mouseenter', () => sound.play());
        catGif.addEventListener('mouseleave', () => {
            sound.pause();
            sound.currentTime = 0;
        });
    }
}

class FridayContent extends DayContent {
    setupContent() {
        const content = `
            <div class="interactive-box" id="environment-box">
                <p class="instruction-text">Pick an enviroment:</p>
                <button class="environment-button" data-environment="summary-night">Summary Night</button>
                <button class="environment-button" data-environment="garden">Garden</button>
                <button class="environment-button" data-environment="cafe">Cafe</button>
            </div>
        `;
        document.querySelector('#item2').innerHTML = content;

        document.querySelectorAll('.environment-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const environment = e.target.getAttribute('data-environment');
                this.showEnvironment(environment);
            });
        });
    }

    showEnvironment(environment) {
        const environments = {
            'summary-night': { gif: 'https://i.pinimg.com/originals/de/b0/f1/deb0f1f0a7ca99c0d39a2c3b586efcf9.gif', sound: 'summary-night.mp3' },
            'garden': { gif: 'https://i.makeagif.com/media/8-22-2015/3nioqS.gif', sound: 'garden.mp3' },
            'cafe': { gif: 'https://i.makeagif.com/media/2-24-2023/Jx32nB.gif', sound: 'cafe.mp3' }
        };
    
        const environmentData = environments[environment];
        const content = `
            <img src="${environmentData.gif}" alt="${environment}" />
            <audio id="environment-audio" src="${environmentData.sound}"></audio>
            <button id="back-button">Back</button>
        `;
        document.querySelector('#item2').innerHTML = content;
        
        const audioElement = document.getElementById('environment-audio');
        if (audioElement) {
            audioElement.play().catch(e => {
                console.error("Audio playback failed. Error:", e);
            });
        }
        
        document.getElementById('back-button').addEventListener('click', () => {
            this.setupContent();
        });
    }
}

class SaturdayContent extends DayContent {
    setupContent() {
        const content = `
            <div class="interactive-box" id="saturday-box">
                <p>Do nothing for 2 minutes</p>
                <div id="loading-bar-container">
                    <div id="loading-bar"></div>
                </div>
                <button id="start-button">Start</button>
            </div>
        `;
        document.querySelector('#item2').innerHTML = content;

        document.getElementById('start-button').addEventListener('click', () => {
            this.startTimer();
        });
    }
    
    startTimer() {
        const startTime = 120;
        let currentTime = startTime;
        
        document.getElementById('start-button').disabled = true;
        
        const interval = setInterval(() => {
            currentTime--;
            const progress = ((startTime - currentTime) / startTime) * 100;
            document.getElementById('loading-bar').style.width = `${progress}%`;
    
            if (currentTime <= 0) {
                clearInterval(interval);
                document.getElementById('start-button').disabled = false;
            }
        }, 1000);
    }
} 

class SundayContent extends DayContent {
    setupContent() {
    const content = `
        <div class="day-checker">
            <p>sunday</p>
        </div>
    `;
    document.querySelector('#item2').innerHTML = content;
    }
}


class ContentFactory {
    static createContent(dayOfWeek) {
        switch(dayOfWeek) {
            case 1: return new MondayContent();
            case 2: return new TuesdayContent();
            case 3: return new WednesdayContent();
            case 4: return new ThursdayContent();
            case 5: return new FridayContent();
            case 6: return new SaturdayContent();
            case 0: return new SundayContent();
            default: throw new Error("Invalid day of week");
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var dayOfWeek = new Date().getDay();
    const contentCreator = ContentFactory.createContent(dayOfWeek);
    contentCreator.setupContent();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    document.querySelector('#item1 h1').textContent = dayNames[dayOfWeek];
});