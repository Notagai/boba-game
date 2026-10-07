// hello here is the main initialization file
// it wires up the ui and game logic modules together
// and initializes the main game buttons

import { gameState as gs, state, updateGameState } from "./game-state.js";
import { get, updateStatus, updateValue, updateProgressBar, flashReject } from "./dom.js";
import { checkOrientation } from "./ui.js";
import { Button } from "./button.js";
import { updateDescription, currentQuest, createQuests } from "./quest.js";
import { formatMoney } from "./utils.js";
import { createUpgrades, initializeUpgradeButtons } from "./upgrades.js";

export const brewBtn = new Button(
    "brew",
    "brew boba",
    "boba brewing...",
    () => gs.brew.brewSpeed,
    null,
    "the thing you dreamed of all your life is finally coming true... brewing boba! wait... do you even know how to use this machine? no? oh...",
    () => [
        "you can brew boba every ",
        gs.brew.brewSpeed,
        ` second${gs.brew.brewSpeed === 1 ? "" : "s"} and make `,
        gs.brew.bobaPerBrew,
        " boba each time"
    ],
    () => {
        if (!brewBtn.getFlagValue()) {
            flashReject(brewBtn.button, "your boba is brewing; wait a sec");
            return false;
        }
        return true;
    },
    () => {
        state.changeBoba(gs.brew.bobaPerBrew);
        gs.brew.bobaMade += gs.brew.bobaPerBrew;
    }
);

export const sellBtn = new Button(
    "sell",
    "sell boba",
    null,
    null,
    null,
    "money is nice. you know what is nicer? boba! why are you selling boba??? so yummy... omnomnomnomnom",
    () => [
        "with a sell multiplier of ",
        gs.sell.sellMultiplier,
        ", you can sell 1 boba for $",
        formatMoney(gs.bobaValue)
    ],
    () => {
        if (gs.boba <= 0) {
            flashReject(sellBtn.button, "no boba to sell; brew some first");
            return false;
        }
        return true;
    },
    () => {
        gs.sell.bobaSold++;
        state.changeBoba(-1);
        state.changeMoney(gs.bobaValue);
    }
);

export const adBtn = new Button(
    "advertise",
    "advertise",
    "running ads...",
    () => gs.advertise.advertisingSpeed,
    null,
    "people really hate ads... too bad for them! you're going to need customers to survive in this boba business. it's a boba-eat-boba world out there.",
    () => [
        "the next ad campaign $",
        gs.advertise.advertisingCost,
        " and increases boba value by $",
        gs.advertise.advertisingEffectiveness
    ],
    () => {
        if (!adBtn.getFlagValue()) {
            flashReject(adBtn.button, "advertising in progress; wait");
            return false;
        }
        if (gs.money < gs.advertise.advertisingCost) {
            flashReject(adBtn.button, "get more money for ads");
            return false;
        }

        state.changeMoney(-gs.advertise.advertisingCost);
        return true;
    },
    () => {
        const ads = gs.advertise;
        ads.advertisementsRan++;
        ads.advertisingCost = formatMoney(ads.advertisingCost * 1.15);
        gs.bobaValue = formatMoney(gs.bobaValue + ads.advertisingEffectiveness);
        updateValue();
        adBtn.setStatsText();
    }
);

export const buyMachineBtn = new Button(
    "buy-machine",
    "buy machine",
    "purchasing...",
    () => gs.machine.buyMachineSpeed,
    null,
    "why do all the work yourself when machines can do it for you? automation is the future! (hopefully this boba brewer machine won't take over the world thoh... at least not without making profit!!)",
    () => [
        "you have ",
        gs.machine.machineCount,
        ` machine${gs.machine.machineCount === 1 ? "" : "s"}. each machine makes 1 boba every `,
        gs.machine.machineSpeed,
        " seconds. next machine costs $",
        gs.machine.machineCost
    ],
    () => {
        if (!buyMachineBtn.getFlagValue()) {
            flashReject(buyMachineBtn.button, "a machine is already on the way; wait");
            return false;
        }
        if (gs.money < gs.machine.machineCost) {
            flashReject(buyMachineBtn.button, "not enough money for a machine");
            return false;
        }

        state.changeMoney(-gs.machine.machineCost);
        updateStatus();
        return true;
    },
    () => {
        gs.machine.machineCount++;
        gs.machine.machineCost = formatMoney(gs.machine.machineCost * 1.5);
        buyMachineBtn.setStatsText();
    },
    true
);

export function initGame() {
    wireUiListeners();
    wireWinCondition();
    wireMachineAutomation();

    brewBtn.unlock();

    createQuests(getButton);
    updateDescription(currentQuest);

    createUpgrades();
    initializeUpgradeButtons();
}

function wireUiListeners() {
    window.addEventListener("load", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
    window.addEventListener("resize", checkOrientation);

    window.addEventListener("load", () => {
        const loadScreen = get("loading-screen");
        setTimeout(() => loadScreen?.classList.add("hidden"), 2500);
    });
}

function wireWinCondition() {
    const easter = gs.easterEgg;

    setInterval(() => {
        if (gs.money >= 25 && !gs.won) {
            const winMessage = get("win-message");
            winMessage.style.display = "block";
            gs.won = true;
            try {
                confetti();
            } catch (e) {
                // confetti is optional
            }
        }
    }, 1000);
}

function wireMachineAutomation() {
    const updateInterval = 50;

    setInterval(() => {
        if (gs.machine.machineCount <= 0) return;

        const progressIncrement = updateInterval / (gs.machine.machineSpeed * 1000);
        gs.machine.machineProgress += progressIncrement;

        if (gs.machine.machineProgress >= 1) {
            state.changeBoba(gs.machine.machineCount);
            gs.machine.machineProgress = 0;
            updateGameState();
        }

        updateProgressBar(buyMachineBtn, gs.machine.machineProgress);
    }, updateInterval);
}

export function getButton(buttonName) {
    switch (buttonName) {
        case "brew":
            return brewBtn;
        case "sell":
            return sellBtn;
        case "advertise":
            return adBtn;
        case "buy-machine":
            return buyMachineBtn;
        default:
            return null;
    }
}
