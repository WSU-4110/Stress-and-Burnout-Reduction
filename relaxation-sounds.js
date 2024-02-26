const sounds = [
  {  iconSrc: "Images/background.gif" },
  {  iconSrc: "Images/Cat.gif" },
  {  iconSrc: "Images/listen.jpg" },
  {  iconSrc: "Images/Lofi.png" },
  {  iconSrc: "Images/sun.gif" },
  {  iconSrc: "Images/Sleep.jpeg" },
  {  iconSrc: "Images/Study.gif" },
  {  iconSrc: "Images/train.jpg" },
  {  iconSrc: "Images/R.jpeg" },
  {  iconSrc: "Images/moon.gif" },
  {  iconSrc: "Images/leaf.gif" },
  {  iconSrc: "Images/Fire.gif" },
  {  iconSrc: "Images/rain.gif" },
  {  iconSrc: "Images/coding.jpeg" },
  {  iconSrc: "Images/girl.gif" },

];

const soundsContainer = document.getElementById("soundsContainer");

sounds.forEach(sound => {
  const soundItem = document.createElement("div");
  soundItem.classList.add("sound-item");

  const icon = document.createElement("img");
  icon.src = sound.iconSrc;
  icon.alt = sound.name;
  icon.classList.add("sound-icon");

  const title = document.createElement("h2");
  title.textContent = sound.name;

  soundItem.appendChild(icon);
  soundItem.appendChild(title);

  soundsContainer.appendChild(soundItem);
});
