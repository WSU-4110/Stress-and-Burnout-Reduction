// Define the sounds
//var sounds = [
    //{ name: "Rain",  ico: "rain", src: "rain.mp3" },
   // { name: "Chimes",  ico: "chimes", src: "chimes.mp3" },
   // { name: "Crickets",  ico: "crickets", src: "crickets.mp3" },
   // { name: "Campfire",  ico: "campfire", src: "campfire.mp3" },
   // { name: "Fountain",  ico: "fountain", src: "fountain.mp3" },
    //{ name: "Bird",  ico: "bird", src: "bird.mp3" }
//];

// Function to preload and toggle sounds
function preloadAndToggle(sound) {
    // Create Audio object
    sound.player = new Audio("assets/" + sound.src);
    sound.player.loop = true;
    sound.player.autoplay = true;

    // Toggle play/pause
    sound.player.onplay = () => console.log(sound.name + " is playing");
    sound.player.onpause = () => console.log(sound.name + " is paused");

    // Preload sound
    sound.player.oncanplaythrough = () => {
        console.log(sound.name + " is ready to play");
    };
}

// Generate sound items
sounds.forEach(sound => {
    // Create HTML for each sound item
    const soundItem = document.createElement('div');
    soundItem.className = 'sound-item';
    soundItem.innerHTML = `
        <img src="assets/${sound.ico}.png" alt="${sound.name}">
        <button onclick="preloadAndToggle(${sound})">Play</button>
    `;
    document.getElementById('soundsContainer').appendChild(soundItem);
});

document.addEventListener('DOMContentLoaded', function() {
    // Assuming 'RelaxationSounds' is the ID of the tab you want to open by default
    openTab(event, 'RelaxationSounds');
  });
  
  function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i =  0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i =  0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  }
  