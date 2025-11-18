// hello this is the file for the ui elements of the boba game
// it handles orientation checks, loading screen, title hover, popups, and leaderboard
// module version: named exports + temporary globals for backward compatibility

import { isMobile, letters } from "./utils.js";
import { get } from "./dom.js";
import {flags, gameState as gs} from "./game-state.js";
import {Button} from "./button.js";

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
}
window.leaderboard = leaderboard; // to be called on leaderboard button click



// vertical tab panel system
const contentArea = get("tab-content-area");
const tabColumnWrapper = get("tabs-column-wrapper")

// toggle panel open/close state
function togglePanel(forceState = null) {
    if (forceState === true || (!flags.isVerticalPanelOpen && forceState !== false)) {
        contentArea.classList.add("open");
        tabColumnWrapper.classList.add("open");
        flags.isVerticalPanelOpen = true;
    } else {
        contentArea.classList.remove("open");
        tabColumnWrapper.classList.remove("open");
        flags.isVerticalPanelOpen = false;
    }
}

// function to handle tab clicks, aka update content area and toggle panel
let activeTabId = null;
function handleTabClick(tab) {
    const clickedButton = tab.button;

    // if the panel is currently open, close it
    if (activeTabId === tab.id && flags.isVerticalPanelOpen) {
        clickedButton.classList.remove("active");
        activeTabId = null;
        togglePanel(false);
        return;
    }

    // if another tab is active, deactivate it first and then activate the clicked tab
    if (activeTabId) get(`tab-button-${activeTabId}`).classList.remove("active");

    // activate clicked tab, and set activeTabId
    clickedButton.classList.add("active");
    activeTabId = tab.id;

    // update content area
    contentArea.childNodes.forEach(child => child.remove());
    tab.updateContent(contentArea);

    // Open the panel if it's currently closed
    if (!flags.isVerticalPanelOpen) {
        togglePanel(true);
    }
}

// creating tab buttons based on definitions
export function createTabButton(definition) {
    const tab = new Button(`tab-button-${definition.id}`, definition.text, null, 0,
        "upgrades", "having things is cool. you know what's cooler? having better things.", null, null,
        () => handleTabClick(tab), false, "vertical-tabs-container"
        );

    tab.updateContent = definition.updateContent;
    tab.enable = () => {
        tab.button.innerText = tab.enabledText;
    };

    tab.unlock();

    tab.button.className = "vertical-tab-button";
}
