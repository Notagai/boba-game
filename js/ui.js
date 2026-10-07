// hello this is the file for the ui elements of the boba game
// it handles orientation checks, loading screen, title hover, inline leaderboard, and tabs

import { isMobile, letters } from "./utils.js";
import { get, flashReject } from "./dom.js";
import { flags, gameState as gs } from "./game-state.js";
import { Button } from "./button.js";

export function checkOrientation() {
    const gameContainer = get("game-container");
    if (!gameContainer) return;

    const needsRotation = isMobile() && window.matchMedia("(orientation: portrait)").matches;
    gameContainer.classList.toggle("orientation-warning", needsRotation);

    if (needsRotation) {
        flashReject(gameContainer, "please rotate your device to play properly");
    }
}

export function bannerScrollEffect() {
    const banner = get("banner");
    if (!banner) return;

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
window.bannerScrollEffect = bannerScrollEffect;

export function leaderboard() {
    const panel = get("leaderboard-panel");
    const entry = get("player-leaderboard-entry");
    if (!panel || !entry) return;

    entry.textContent = `2. You: $${gs.money}`;
    const isOpen = panel.classList.toggle("open");
    panel.setAttribute("aria-hidden", String(!isOpen));
}
window.leaderboard = leaderboard;

const contentArea = get("tab-content-area");
const tabColumnWrapper = get("tabs-column-wrapper");

function togglePanel(forceState = null) {
    if (!contentArea || !tabColumnWrapper) return;

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

let activeTabId = null;

function handleTabClick(tab) {
    const clickedButton = tab.button;

    if (activeTabId === tab.id && flags.isVerticalPanelOpen) {
        clickedButton.classList.remove("active");
        activeTabId = null;
        togglePanel(false);
        return;
    }

    if (activeTabId) {
        const previousButton = get(`tab-button-${activeTabId}`);
        previousButton?.classList.remove("active");
    }

    clickedButton.classList.add("active");
    activeTabId = tab.id;

    while (contentArea.firstChild) contentArea.firstChild.remove();
    tab.updateContent(contentArea);

    if (!flags.isVerticalPanelOpen) togglePanel(true);
}

export function createTabButton(definition) {
    const tab = new Button(
        `tab-button-${definition.id}`,
        definition.text,
        null,
        0,
        "upgrades",
        "having things is cool. you know what's cooler? having better things.",
        null,
        null,
        () => handleTabClick(tab),
        false,
        "vertical-tabs-container"
    );

    tab.updateContent = definition.updateContent;
    tab.enable = () => {
        tab.button.style.cursor = "pointer";
        tab.button.innerText = tab.enabledText;
    };

    tab.unlock();
    tab.button.className = "vertical-tab-button";
}
