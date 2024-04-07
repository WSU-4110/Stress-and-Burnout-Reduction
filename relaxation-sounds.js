

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
 
  soundItem.appendChild(icon);
  soundItem.appendChild(audio);
  soundItem.appendChild(title);
 
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
 
