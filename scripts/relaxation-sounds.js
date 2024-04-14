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
  { name: "Morning Chirping",iconSrc: "/cdn/img/morning-chirping.gif", audioSrc: "/cdn/mp3/morning-chirping.mp3" },
  { name:"Relaxing Beat", iconSrc: "/cdn/img/relaxing-beat.jpg", audioSrc: "/cdn/mp3/relaxing-beat.mp3"  },
  { name: "Guitar Melody" ,iconSrc: "/cdn/img/guitar-melody.png", audioSrc: "/cdn/mp3/guitar-melody.mp3" },
  { name: "Blissful Retreat", iconSrc: "/cdn/img/blissful-retreat.jpeg", audioSrc: "/cdn/mp3/blissful-retreat.mp3" },
  { name:"Flute Harmony", iconSrc: "/cdn/img/flute-harmony.gif", audioSrc: "/cdn/mp3/flute-harmony.mp3" },
  { name: "Lo-Fi", iconSrc: "/cdn/img/lo-fi.jpg", audioSrc: "/cdn/mp3/lo-fi.mp3"},
  { name: "Nostalgic",iconSrc: "/cdn/img/nostalgic.jpeg", audioSrc: "/cdn/mp3/nostalgic.mp3" },
  { name: "Rainy Night",iconSrc: "/cdn/img/rainy-night.gif", audioSrc: "/cdn/mp3/rainy-night.mp3" },
  { name:"Waterfall",iconSrc: "/cdn/img/waterfall.gif", audioSrc: "/cdn/mp3/waterfall.mp3" },
  { name:"Peaceful Paradise", iconSrc: "/cdn/img/peaceful-paradise.gif", audioSrc: "/cdn/mp3/peaceful-paradise.mp3" },
  { name:"Gentle Raindrops",iconSrc: "/cdn/img/gentle-raindrops.gif", audioSrc: "/cdn/mp3/gentle-raindrops.mp3" },
  { name:"Peaceful Violin",iconSrc: "/cdn/img/peaceful-violin.jpeg", audioSrc: "/cdn/mp3/peaceful-violin.mp3" },
  { name:"Soothing Cellos", iconSrc: "/cdn/img/soothing-cellos.gif", audioSrc: "/cdn/mp3/soothing-cellos.mp3" },
  { name:"Hip-Hop Vibes", iconSrc: "/cdn/img/hip-hop-vibes.gif", audioSrc: "/cdn/mp3/hip-hop-vibes.mp3"  },
  { name:"Smooth Jazz",iconSrc: "/cdn/img/smooth-jazz.gif", audioSrc: "/cdn/mp3/smooth-jazz.mp3" },
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




