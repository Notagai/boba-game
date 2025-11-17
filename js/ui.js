// hello this is the file for the ui elements of the boba game
// it handles orientation checks, loading screen, title hover, popups, and leaderboard
// module version: named exports + temporary globals for backward compatibility

import { isMobile, letters } from "./utils.js";
import { get } from "./dom.js";
import { pushConsole } from "./console.js";
import { gameState as gs } from "./game-state.js";

// this checks orientation on mobile devices and shows a popup if in portrait
export function checkOrientation() {
    if (isMobile() && window.matchMedia("orientation: portrait").matches) {
            showPopup("📱 please rotate your device to play properly!");
    }
}

// function for the banner scroll effect
export function bannerScrollEffect() {
    const banner = get("banner");
    let iteration = 0;
    const bannerInterval = setInterval(() => {
        banner.innerText = banner.dataset.value
            .split("")
            .map((letter, index) => (index < iteration ? banner.dataset.value[index] : letters[Math.floor(Math.random() * 26)]))
            .join("");
        if (iteration >= banner.dataset.value.length) clearInterval(bannerInterval);
        iteration += 1 / 3;
    }, 30);
}
window.bannerScrollEffect = bannerScrollEffect; // to be called on title hover

// here is the ui for the popup system
export function showPopup(text) {
    const overlay = get("boba-popup-overlay");
    const popup = get("boba-popup");
    const popupText = get("boba-popup-text");
    const popupBtn = get("boba-popup-btn");

    popupText.innerText = text;
    overlay.style.display = "flex";
    popup.classList.remove("show");
    void popup.offsetWidth; // reflow to restart animation
    popup.classList.add("show");
    popupBtn.onclick = () => (overlay.style.display = "none");
}

// the leaderboard function
export function leaderboard() {
    const message = `Leaderboard:\n 1. Little Ella: $7890282746 \n 2. You: $${gs.money} \n 3. Little Timmy: $0`;
    showPopup(message);
    pushConsole("leaderboard opened!");
}
window.leaderboard = leaderboard; // to be called on leaderboard button click
