// hello this is the file for the ui elements of the boba game
// it handles orientation checks, loading screen, title hover, inline leaderboard, and tabs

import { isMobile, letters } from "./utils.js";
import { get, flashReject } from "./dom.js";
import { flags, saveGame as saveGameState, loadGame as loadSavedGame, clearSavedGame, getSaveInfo } from "./game-state.js";
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

export function toggleSettings() {
    const panel = get("settings-panel");
    if (!panel) return;
    const isOpen = panel.classList.toggle("open");
    panel.setAttribute("aria-hidden", String(!isOpen));
    if (isOpen) updateSaveStatus();
}
window.toggleSettings = toggleSettings;

function formatSaveTime(timestamp) {
    return timestamp ? new Date(timestamp).toLocaleString() : "no local save yet";
}
export function updateSaveStatus(message = null) {
    const info = getSaveInfo();
    get("save-status")?.replaceChildren(document.createTextNode(message || "autosave is on"));
    get("save-time")?.replaceChildren(document.createTextNode(info ? `last save: ${formatSaveTime(info.savedAt)}` : "no local save yet"));
}
export function saveGame() {
    const savedAt = saveGameState();
    updateSaveStatus(savedAt ? "saved locally" : "local saving is unavailable");
    if (!savedAt) flashReject(get("settings"));
}
window.saveGame = saveGame;
export function loadGame() {
    const savedAt = loadSavedGame();
    if (!savedAt) { updateSaveStatus("no local save found"); flashReject(get("settings")); return; }
    updateStatus();
    updateSaveStatus("loaded local save");
}
window.loadGame = loadGame;
export function clearSave() {
    if (!clearSavedGame()) { updateSaveStatus("could not clear save"); flashReject(get("settings")); return; }
    updateSaveStatus("local save cleared");
}
window.clearSave = clearSave;

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
