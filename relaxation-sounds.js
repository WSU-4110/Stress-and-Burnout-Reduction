const sounds = [
  { iconSrc: "Images/background.gif", audioSrc: "Sounds/Birds.mp3" },
  { iconSrc: "Images/Cat.gif", audioSrc: "Sounds/beat.mp3"  },
  { iconSrc: "Images/listen.jpg", audioSrc: "Sounds/jazz.mp3"  },
  { iconSrc: "Images/Lofi.png", audioSrc: "Sounds/Guiter.mp3" },
  { iconSrc: "Images/sun.gif", audioSrc: "Sounds/hip hop.mp3" },
  { iconSrc: "Images/Sleep.jpeg", audioSrc: "Sounds/K.mp3" },
  { iconSrc: "Images/Study.gif", audioSrc: "Sounds/flute.mp3" },
  { iconSrc: "Images/train.jpg", audioSrc: "Sounds/Lofi.mp3"},
  { iconSrc: "Images/R.jpeg", audioSrc: "Sounds/m.mp3" },
  { iconSrc: "Images/moon.gif", audioSrc: "Sounds/Meditation.mp3" },
  { iconSrc: "Images/leaf.gif", audioSrc: "Sounds/Waterfall.mp3" },
  { iconSrc: "Images/Fire.gif", audioSrc: "Sounds/Piano.mp3" },
  { iconSrc: "Images/rain.gif", audioSrc: "Sounds/sunset.mp3" },
  { iconSrc: "Images/coding.jpeg", audioSrc: "Sounds/violin.mp3" },
  { iconSrc: "Images/girl.gif", audioSrc: "Sounds/nostalgia.mp3" },
];


const soundsContainer = document.getElementById("soundsContainer");

sounds.forEach(sound => {
  const soundItem = document.createElement("div");
  soundItem.classList.add("sound-item");

  const icon = document.createElement("img");
  icon.src = sound.iconSrc;
  icon.alt = sound.name;
  icon.classList.add("sound-icon");

  const audio = document.createElement("audio");
  audio.src = sound.audioSrc;
  audio.controls = true; // Add controls to allow users to play/pause the audio
  audio.classList.add("sound-audio");

  const title = document.createElement("h2");
  title.textContent = sound.name; 

  soundItem.appendChild(icon);
  soundItem.appendChild(audio);
  soundItem.appendChild(title);

  soundsContainer.appendChild(soundItem);
});

