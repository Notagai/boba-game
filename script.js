// audio n shi

const letters = "abcdefghijklmnopqrstuvwxyz";
const thesoundofthedemons = new Audio("fahhhhhhhhhhhhhh.mp3");
const bgmusic = new Audio("bgm.mp3");
const popSound = new Audio("pop1.mp3");
popSound.volume = 0.5;

// intro
showBobaPopup("welcome to the boba game! check the console for a tutorial, and have fun brewing!");

// music
bgmusic.loop = true;
bgmusic.volume = 0.2;
document.body.addEventListener('click', () => {
  bgmusic.volume = 0;
  bgmusic.play().catch(() => {});
  
  let vol = 0;
  const fadeIn = setInterval(() => {
    vol += 0.01; // adjust speed if needed
    if (vol >= 0.5) { // target volume
      vol = 0.5;
      clearInterval(fadeIn);
    }
    bgmusic.volume = vol;
  }, 50); // every 50ms
}, { once: true });
// detect mobile
function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

// orientation check
function checkOrientation() {
  if (window.innerWidth < window.innerHeight) {
    showBobaPopup("📱 please rotate your device to play properly!");
  }
}

// run once + when they rotate
window.addEventListener("load", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);
window.addEventListener("resize", checkOrientation);

// loading screen
window.addEventListener("load", () => {
  const loadScreen = document.getElementById("loading-screen");
  setTimeout(() => {
    loadScreen.classList.add("hidden");
  }, 2500); // stays up for 2.5 seconds
});


// title hover effect
const title = document.querySelector("h1#arf");
let titleInterval = null;

title.onmouseover = event => {
  let iteration = 0;
  clearInterval(titleInterval);
  titleInterval = setInterval(() => {
    event.target.innerText = event.target.dataset.value
      .split("")
      .map((letter, index) => {
        if (index < iteration) return event.target.dataset.value[index];
        return letters[Math.floor(Math.random() * 26)];
      })
      .join("");
    if (iteration >= event.target.dataset.value.length) clearInterval(titleInterval);
    iteration += 1 / 3;
  }, 30);
};

// please stop looking at my code 
// the organisation is -_-
// i mean you're looking i guess
// game logic

// game variables
let boba = 0;
let bobasold = 0;
let quality = 0.01;
let money = 0;
let btnAllowed = true;
let markAllowed = true;
let marketcost = 0.10;
let adsrun = 0;

// easter egg variables
let flags;
const CLICKING_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
let currentBubble = CLICKING_ORDER[0];
let clickedAmount = 0;

// type-once flags
let typedFlags = {
  sellDesc: false,
  markDesc: false,
  firstAd: false
};

// eggs

// quests
const quests = [
  { target: 1, getValue: () => bobasold },
  { target: 0.10, getValue: () => money },
  { target: 1, getValue: () => adsrun },
  { target: 10, getValue: () => money }
];

let currentQuest = 0;

function updateQuestProgress() {
  if (currentQuest >= quests.length) return;
  const quest = quests[currentQuest];
  let progress = quest.getValue() / quest.target;
  if (progress > 1) progress = 1;
  const customBar = document.getElementById('myBar');
  customBar.style.width = `${progress * 100}%`;
  customBar.textContent = `${Math.floor(progress * 100)}%`;

  if (quest.getValue() >= quest.target) {
    confetti();
    currentQuest++;
  }
}

setInterval(updateQuestProgress, 100);

// brew boba
function brew() {
  if (!btnAllowed) return showBobaPopup("your boba is brewing! wait a sec");
  btnAllowed = false;
  const brewBtn = document.getElementById('brew');
  brewBtn.style.cursor = 'not-allowed';
  brewBtn.style.backgroundColor = '#dbd0baff';
  brewBtn.innerText = 'boba brewing...';
  bobasold++;
  popSound.play();
  
  // ^ after click  v when done
  setTimeout(() => {
    boba++;
    document.getElementById("thing").innerText = `you currently have ${boba} boba and $${Math.round(money * 100) / 100}.`;
    brewBtn.style.cursor = 'pointer';
    brewBtn.style.backgroundColor = '#ffd079';
    brewBtn.innerText = 'brew boba';
    btnAllowed = true;

    const sellDesc = document.getElementById('sellDesc');
    sellDesc.style.display = 'block';
    if (!typedFlags.sellDesc) {
      typeText(sellDesc, ">boba-game/console: great job! that's not gonna earn you money though, try selling your boba and come back when you have $0.10.");
      typedFlags.sellDesc = true;
    }

    if (bobasold == 1) {
      document.getElementById('sell').style.display = 'block';
    }
  }, Math.floor(Math.random() * 200 + 400));
}

// sell boba
function sell() {
  if (boba <= 0) return showBobaPopup("no boba to sell! brew some first");
  boba--;
  money += quality;
  money = Math.round(money * 100) / 100;
  document.getElementById("thing").innerText = `you currently have ${boba} boba and $${money}.`;
  if (money >= 0.10 && adsrun === 0) marketingUnlock();
  popSound.play();
}

// marketing unlock
function marketingUnlock() {
  adsrun = 1;
  const markBtn = document.getElementById('mark');
  markBtn.style.display = 'block';
  markBtn.classList.add('pop-in');
  markBtn.addEventListener('animationend', () => markBtn.classList.remove('pop-in'));
  const markDesc = document.getElementById('markDesc');
  markDesc.style.display = 'block';
  if (!typedFlags.markDesc) {
    typeText(markDesc, ">boba-game/console: setup marketing to increase your boba sales! click the button to advertise your boba.");
    typedFlags.markDesc = true;
  }
}

// market
function market() {
  if (!markAllowed || money < marketcost) {
    if (!markAllowed) showBobaPopup("marketing in progress, wait");
    else showBobaPopup("get more money for ads");
    return;
  }

  popSound.play();
  markAllowed = false;
  const markBtn = document.getElementById('mark');
  markBtn.style.cursor = 'not-allowed';
  markBtn.style.backgroundColor = '#dbd0baff';
  markBtn.innerText = 'running ads...';
  money -= marketcost;

  // ^ after click  v when done
  setTimeout(() => {
    markAllowed = true;
    quality += 0.01;
    marketcost = Math.round((marketcost * 1.15) * 100) / 100;
    markBtn.style.cursor = 'pointer';
    markBtn.style.backgroundColor = '#ffd079';
    markBtn.innerText = `advertise for $${marketcost}`;
    document.getElementById("thing").innerText = `you currently have ${boba} boba and $${Math.round(money * 100) / 100}.`;
    document.getElementById('qua').innerHTML = `each boba you sell earns you $${Math.round(quality * 100) / 100}.`;

    const firstAd = document.getElementById('firstAd');
    if (firstAd && !typedFlags.firstAd) {
      firstAd.style.display = 'block';
      typeText(firstAd, ">boba-game/console: now that you know the game, it's all up to you. goal: make $10.");
      typedFlags.firstAd = true;
    }
  }, 5000);
}

let won = false;

// win check
setInterval(() => {
  if (money >= 10 && won == false) {
    document.getElementById("winmsg").style.display = 'block';
    if (clickedAmount < CLICKING_ORDER.length) {
      showBobaPopup("🎉YOU WIN!!!🎉");
    } else {
      showBobaPopup("omg u cheated to win??? well... 🎉YOU WIN ANYWAYS!!!🎉");
    }

    confetti();
    won = true;
  }
}, 500);

// popup
function showBobaPopup(text) {
  const overlay = document.getElementById("boba-popup-overlay");
  const popup = document.getElementById("boba-popup");
  document.getElementById("boba-popup-text").innerText = text;
  overlay.style.display = "flex";
  popup.classList.remove("show");
  void popup.offsetWidth;
  popup.classList.add("show");
  document.getElementById("boba-popup-btn").onclick = () => overlay.style.display = "none";
}

// typewriter effect (type once per element)
function typeText(element, text, speed = 60) {
  element.innerHTML = "";
  element.style.opacity = 0;
  element.style.transform = "scale(0.8)";
  element.style.transition = "opacity 0.3s ease, transform 0.3s ease";

  setTimeout(() => {
    element.style.opacity = 1;
    element.style.transform = "scale(1)";
  }, 40);

  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      element.innerHTML += text[i];
      i++;
    } else {
      clearInterval(interval);
    }
  }, speed);
}

// easter eggs & fake leaderboard
// lil suzie sybau u only got 0 dollars

function resetFlags() {
  flags = [];
  for (let i = 0; i < CLICKING_ORDER.length; i++) {
    flags.push(false);
  }
}
resetFlags();

function bubble(bubbleNumber) {
  clickedAmount += 1;
  console.log(`Clicked bubble ${bubbleNumber}, clickedAmount: ${clickedAmount}, currentBubble: ${currentBubble}`);

  if (clickedAmount == CLICKING_ORDER.length) {
    money += 10;
    money = Math.round(money * 100) / 100;
    document.getElementById("thing").innerText = `you currently have ${boba} boba and $${money}.`;
    currentQuest = 3;
    updateQuestProgress();
    return;

  } else if (bubbleNumber == currentBubble) {
    flags[bubbleNumber - 1] = true;
    currentBubble = CLICKING_ORDER[clickedAmount];
  } else {
    resetFlags();
    clickedAmount = 0;
    currentBubble = CLICKING_ORDER[0];
  }

  if (bubbleNumber == 5) {
    confetti();
    showBobaPopup("wow you found an easter egg! here's some confetti for your effort 🎉");
  } else if (bubbleNumber == 10) {
    showBobaPopup("nice try ts is not giving you more confetti");
  }
}

function bananaphone() {
  showBobaPopup("Leaderboard: \n 1. Little Timmy: $7890282746 \n 2. You: $" + money + "\n 3. Little Suzie: $0")
}