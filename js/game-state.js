// hello this is the game state manager
// it handles changing boba and money amounts (for now)

import { formatMoney } from "./utils.js";
import { updateStatus } from "./dom.js";
import { updateQuestProgress } from "./quest.js";
import { updateUpgradesProgress } from "./upgrades.js";

// core game state
export const gameState = {
    brew: {
        bobaMade: 0,
        brewSpeed: 0.5,
        bobaPerBrew: 1,
    },
    sell: {
        bobaSold: 0,
        sellMultiplier: 1,
    },
    advertise: {
        advertisingCost: 0.10,
        advertisingSpeed: 1,
        advertisingEffectiveness: 0.01,
        advertisementsRan: 0,
    },
    machine: {
        buyMachineSpeed: 1,
        machineCount: 0,
        machineCost: 1,
        machineSpeed: 5, // 5 seconds to make 1 boba
        machineProgress: 0, // 0 to 1
    },
    boba: 0,
    bobaValue: 0.01,
    money: 0,
    won: false,
    easterEgg: {
        clickedAmount: 0,
        currentBubble: 1,
        clickingOrder: [1, 2]
    }
};

// state mutators (ui updates still delegated to global helpers for now)
export const state = {
    // change the player's money amount
    changeMoney(amount) {
        gameState.money = formatMoney(Number(gameState.money) + Number(amount));
        updateStatus();
    },

    // change the player's boba amount
    changeBoba(amount) {
        gameState.boba += Number(amount);
        updateStatus();
    }
};

const SAVE_KEY = "boba-game-save-v1";

function applySavedState(saved) {
    if (!saved || typeof saved !== "object") return false;
    Object.assign(gameState, {
        brew: { ...gameState.brew, ...(saved.brew || {}) },
        sell: { ...gameState.sell, ...(saved.sell || {}) },
        advertise: { ...gameState.advertise, ...(saved.advertise || {}) },
        machine: { ...gameState.machine, ...(saved.machine || {}) },
        boba: Number(saved.boba) || 0,
        bobaValue: Number(saved.bobaValue) || 0.01,
        money: Number(saved.money) || 0,
        won: Boolean(saved.won),
        easterEgg: { ...gameState.easterEgg, ...(saved.easterEgg || {}) }
    });
    return true;
}

export function saveGame() {
    try {
        const savedAt = Date.now();
        localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, savedAt, state: gameState }));
        return savedAt;
    } catch (error) {
        console.warn("Could not save boba game locally.", error);
        return false;
    }
}

export function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        const payload = JSON.parse(raw);
        return applySavedState(payload?.state) ? (payload.savedAt || Date.now()) : false;
    } catch (error) {
        console.warn("Could not load boba game locally.", error);
        return false;
    }
}

export function clearSavedGame() {
    try { localStorage.removeItem(SAVE_KEY); return true; }
    catch (error) { console.warn("Could not clear local save.", error); return false; }
}

export function getSaveInfo() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        const payload = JSON.parse(raw);
        return { savedAt: payload?.savedAt || null, version: payload?.version || 1 };
    } catch { return null; }
}

// function to update gamestate, right now just quests and upgrades will use this
export function updateGameState() {
    // update quest progress
    updateQuestProgress();

    // update upgrade buttons
    updateUpgradesProgress();
}

// button flags
export const flags = {
    brewingAllowed: true,
    advertisingAllowed: true,
    buyMachineAllowed: true,
    upgradesUnlocked: false,
    isVerticalPanelOpen: false,

    // convert a button id to its controlling flag
    toFlag(id) {
        switch (id) {
            case "brew":
                return "brewingAllowed";
            case "advertise":
                return "advertisingAllowed";
            case "buy-machine":
                return "buyMachineAllowed";
            default:
                throw new Error(`${id} does not have a flag!`);
        }
    }
};

