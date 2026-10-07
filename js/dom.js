// hello this handles all the dom manipulation stuff
// keeps element getters, updates, and visibility toggles organized

import { formatMoney } from "./utils.js";
import { gameState as gs } from "./game-state.js";

export function get(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with id ${id} not found.`);
    }
    return element;
}

export function updateStatus() {
    const bobaEl = get("boba");
    const moneyEl = get("money");
    if (!bobaEl || !moneyEl) return;
    bobaEl.innerText = gs.boba.toString();
    moneyEl.innerText = formatMoney(gs.money);
}

export function updateValue() {
    const valueEl = get("boba-value");
    if (!valueEl) return;
    valueEl.innerText = formatMoney(gs.bobaValue);
}

export function typeText(element, text, onComplete = null, speed = 50) {
    if (!element) return;

    if (element._typeTextInterval) {
        clearInterval(element._typeTextInterval);
    }
    if (element._typeTextTimeout) {
        clearTimeout(element._typeTextTimeout);
    }

    element.textContent = "";
    element.style.opacity = "0";
    element.style.transform = "scale(0.8)";
    element.style.transition = "opacity 0.3s ease, transform 0.3s ease";

    element._typeTextTimeout = setTimeout(() => {
        element.style.opacity = "1";
        element.style.transform = "scale(1)";
    }, 50);

    let i = 0;
    element._typeTextInterval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text[i++];
        } else {
            clearInterval(element._typeTextInterval);
            element._typeTextInterval = null;
            if (onComplete) onComplete();
        }
    }, speed);
}

export function updateProgressBar(button, progress) {
    if (!button?.progressBar) return;
    const safeProgress = Math.max(0, Math.min(1, Number(progress) || 0));
    button.progressBar.style.width = `${safeProgress * 100}%`;
}

export function flashReject(target, message = "") {
    if (!target) return;

    const element = typeof target === "string" ? get(target) : target;
    if (!element) return;

    if (message) {
        element.setAttribute("aria-label", message);
        element.dataset.feedback = message;
    }

    element.classList.remove("action-rejected");
    void element.offsetWidth;
    element.classList.add("action-rejected");

    if (element._rejectFeedbackTimeout) {
        clearTimeout(element._rejectFeedbackTimeout);
    }
    element._rejectFeedbackTimeout = setTimeout(() => {
        element.classList.remove("action-rejected");
        element.removeAttribute("aria-label");
        delete element.dataset.feedback;
        element._rejectFeedbackTimeout = null;
    }, 520);
}
