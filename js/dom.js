// hello this handles all the dom manipulation stuff
// keeps element getters, updates, and visibility toggles organized

import { formatMoney } from "./utils.js";
import { gameState as gs } from "./game-state.js";

// helper to get an element with a warning if not found
export function get(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with id ${id} not found.`);
    }
    return element;
}

// update the status text display
export function updateStatus() {
    const bobaEl = get("boba");
    const moneyEl = get("money");
    bobaEl.innerText = gs.boba.toString();
    moneyEl.innerText = formatMoney(gs.money);
}

// update the value text display
export function updateValue() {
    const valueEl = get("boba-value");
    valueEl.innerText = formatMoney(gs.bobaValue);
}

// simple typewriter effect
export function typeText(element, text, onComplete = null, speed = 50) {
    element.innerHTML = "";
    element.style.opacity = "0";
    element.style.transform = "scale(0.8)";
    element.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    setTimeout(() => {
        element.style.opacity = "1";
        element.style.transform = "scale(1)";
    }, 50);

    let i = 0;
    const interval = setInterval(() => {
        if (i < text.length) {
            element.innerHTML += text[i++];
        } else {
            clearInterval(interval);
            if (onComplete) onComplete();
        }
    }, speed);
}

// function to update a general progress bar
export function updateProgressBar(button, progress) {
    const progressBar = button.progressBar;
    progressBar.style.width = `${progress * 100}%`;
}
