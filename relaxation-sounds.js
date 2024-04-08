function createSoundItem(sound) {
  const soundItem = document.createElement("div");
  soundItem.classList.add("sound-item");

  const icon = document.createElement("img");
  icon.src = sound.iconSrc;
  icon.alt = sound.name; 
  icon.classList.add("sound-icon");

  const audio = document.createElement("audio");
  audio.src = sound.audioSrc;
  audio.controls = true; 
  audio.classList.add("sound-audio");

  const title = document.createElement("h2");
  title.textContent = sound.name; 

  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "Download";
  downloadBtn.classList.add("download-btn");
  downloadBtn.addEventListener('click', function() {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = sound.audioSrc;
      link.download = sound.name + ".mp3";
      link.click();
  });

  const loopBtn = document.createElement("button");
  loopBtn.textContent = "Loop";
  loopBtn.classList.add("loop-btn");
  
  let isLooping = false; // Track loop state
  
  loopBtn.addEventListener('click', function() {
      if (!isLooping) {
          // Start looping
          audio.loop = true;
          loopBtn.textContent = "Stop Loop";
          isLooping = true;
      } else {
          // Stop looping
          audio.loop = false;
          loopBtn.textContent = "Loop";
          isLooping = false;
      }
  });
  
  soundItem.appendChild(icon);
  soundItem.appendChild(audio);
  soundItem.appendChild(title);
  soundItem.appendChild(downloadBtn);
  soundItem.appendChild(loopBtn);
  
  return soundItem;
}

// Array of sound objects
const sounds = [
  { name: "Morning Chirping",iconSrc: "Images/background.gif", audioSrc: "Sounds/Birds.mp3" },
  { name:"Relaxing Beat", iconSrc: "Images/listen.jpg", audioSrc: "Sounds/jazz.mp3"  },
  { name: "Guiter Melody" ,iconSrc: "Images/Lofi.png", audioSrc: "Sounds/Guiter.mp3" },
  { name: "Blissful Retreat", iconSrc: "Images/Sleep.jpeg", audioSrc: "Sounds/K.mp3" },
  { name:"Flute Harmony", iconSrc: "Images/Study.gif", audioSrc: "Sounds/flute.mp3" },
  { name: "Hip Hop Vibes", iconSrc: "Images/train.jpg", audioSrc: "Sounds/Lofi.mp3"},
  { name: "Nostalgic",iconSrc: "Images/R.jpeg", audioSrc: "Sounds/m.mp3" },
  { name: "Rainy Night",iconSrc: "Images/moon.gif", audioSrc: "Sounds/Meditation.mp3" },
  { name:"Waterfall",iconSrc: "Images/leaf.gif", audioSrc: "Sounds/Waterfall.mp3" },
  { name:"Peaceful Paradise", iconSrc: "Images/Fire.gif", audioSrc: "Sounds/Piano.mp3" },
  { name:"Gentle Raindrops",iconSrc: "Images/rain.gif", audioSrc: "Sounds/sunset.mp3" },
  { name:"Peaceful Violin",iconSrc: "Images/coding.jpeg", audioSrc: "Sounds/violin.mp3" },
  { name:"Soothing Cellos", iconSrc: "Images/girl.gif", audioSrc: "Sounds/nostalgia.mp3" },
  { name:"Hip-Hop Vibes", iconSrc: "Images/Cat.gif", audioSrc: "Sounds/beat.mp3"  },
  { name:"Smooth Jazz",iconSrc: "Images/sun.gif", audioSrc: "Sounds/hip hop.mp3" },
];

// Get the container element
const soundsContainer = document.getElementById("soundsContainer");

// Use the factory function to create and append sound items
sounds.forEach(sound => {
  const soundItem = createSoundItem(sound);
  soundsContainer.appendChild(soundItem);
});


document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('searchInput');
  const soundsContainer = document.getElementById('soundsContainer');
  const soundItems = soundsContainer.querySelectorAll('.sound-item');

  searchInput.addEventListener('input', function () {
      const searchTerm = searchInput.value.trim().toLowerCase();

      // Filter sound items based on the first 1-3 words
      soundItems.forEach(soundItem => {
          const title = soundItem.querySelector('h2').textContent.toLowerCase();
          const firstWords = title.split(' ').slice(0, 3).join(' ');

          if (firstWords.includes(searchTerm)) {
              soundItem.style.display = 'block';
          } else {
              soundItem.style.display = 'none';
          }
      });
  });
});




function createSoundItem(sound) {
  const soundItem = document.createElement("div");
  soundItem.classList.add("sound-item");

  const icon = document.createElement("img");
  icon.src = sound.iconSrc;
  icon.alt = sound.name; 
  icon.classList.add("sound-icon");

  const audio = document.createElement("audio");
  audio.src = sound.audioSrc;
  audio.controls = true; 
  audio.classList.add("sound-audio");

  const title = document.createElement("h2");
  title.textContent = sound.name; 

  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "Download";
  downloadBtn.classList.add("download-btn");
  downloadBtn.addEventListener('click', function() {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = sound.audioSrc;
      link.download = sound.name + ".mp3";
      link.click();
  });



  const loopBtn = document.createElement("button");
  loopBtn.textContent = "Loop";
  loopBtn.classList.add("loop-btn");
  
  let isLooping = false; // Track loop state
  
  loopBtn.addEventListener('click', function() {
      if (!isLooping) {
          // Start looping
          audio.loop = true;
          loopBtn.textContent = "Stop Loop";
          isLooping = true;
      } else {
          // Stop looping
          audio.loop = false;
          loopBtn.textContent = "Loop";
          isLooping = false;
      }
  });
  
  soundItem.appendChild(icon);
  soundItem.appendChild(audio);
  soundItem.appendChild(title);
  soundItem.appendChild(downloadBtn);
  soundItem.appendChild(loopBtn);
  
  return soundItem;
  
}




