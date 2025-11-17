// hello this is the game state manager
// it handles changing boba and money amounts (for now)

import { formatMoney } from "./utils.js";
import { updateStatus } from "./dom.js";

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
        advertisingSpeed: 5,
        advertisingEffectiveness: 0.01,
        advertisementsRan: 0,
    },
    machine: {
        buyMachineSpeed: 10,
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

// button flags
export const flags = {
    brewingAllowed: true,
    advertisingAllowed: true,
    buyMachineAllowed: true,

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

