class DayContent {
    setupContent() {
        throw new Error("This method should be implemented by subclasses");
    }
}

class MondayContent extends DayContent {
    setupContent() {
    const content = `
        <div class="day-checker">
            <p>Words of affirmation generator</p>
        </div>
    `;
    document.querySelector('#item2').innerHTML = content;
    }
}

class TuesdayContent extends DayContent {
    setupContent() {
    const content = `
        <div class="day-checker">
            <p>text box to type in ur wories and it ques an animation that gets rid of them</p>
        </div>
    `;
    document.querySelector('#item2').innerHTML = content;
    }
}

class WednesdayContent extends DayContent {
    setupContent() {
    const content = `
        <div class="interactive-box">
            <button class="sound-button" data-sound="keyboard-typing.mp3">Keyboard Typing</button>
            <button class="sound-button" data-sound="deep-breath.mp3">Deep Breath</button>
            <button class="sound-button" data-sound="ziplock-bag.mp3">Ziplock Bag</button>
        </div>
    `;
    document.querySelector('#item2 h1').innerHTML = content;
    
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
    const content = `<img class="cat-gif" src="https://i.pinimg.com/originals/36/99/23/3699234f311b8d44ba46d6503b4a033c.gif" alt="Cat">`;
    document.querySelector('#item2').innerHTML = content;
    const sound = new Audio('purring-cat.mp3');
    sound.loop = true;

    const catGif = document.querySelector('.cat-gif');
    
    catGif.addEventListener('mouseenter', () => {
        sound.play();
    });

    catGif.addEventListener('mouseleave', () => {
        sound.pause();
        sound.currentTime = 0;
    });
}
}

class FridayContent extends DayContent {
    setupContent() {
    const content = `
        <div class="day-checker">
            <p>pick and enviroment ad it comes with sound/changes background</p>
        </div>
    `;
    document.querySelector('#item2').innerHTML = content;
    }
}

class SaturdayContent extends DayContent {
    setupContent() {
    const content = `
        <div class="day-checker">
            <p>do nothing for 2 minutes</p>
        </div>
    `;
    document.querySelector('#item2').innerHTML = content;
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
});