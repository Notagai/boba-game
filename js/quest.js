// hello this is the quest manager
// it handles quest descriptions and progress

import { get, typeText } from "./dom.js";
import {UNLOCK_BUTTON, UNLOCK_TAB} from "./utils.js";
import { gameState as gs } from "./game-state.js";
import { pushConsole } from "./console.js";
import { createUpgradesTab } from "./upgrades.js";

let quests = null;
export function createQuests(getButton){
    quests = [
        {
            target: 1,
            getValue: () => gs.boba,
            description: "make your first boba!",
            reward: [UNLOCK_BUTTON, getButton("sell")],
            completeMessage: ">boba-game/console: great job, you made boba. try to make $0.10 selling boba"
        },
        {
            target: 0.10,
            getValue: () => gs.money,
            description: "earn $0.10 selling your boba",
            reward: [UNLOCK_BUTTON, getButton("advertise")],
            completeMessage: ">boba-game/console: let's make the boba start selling more by advertising. click button to tell the world about your boba!"
        },
        {
            target: 1,
            getValue: () => gs.advertise.advertisementsRan,
            description: "run your first advertisement!",
            completeMessage: ">boba-game/console: nice! your ads are working, and profitability is up! betcha can't make $1 selling boba now..."
        },
        {
            target: 1,
            getValue: () => gs.money,
            description: "earn $1 selling your boba!",
            reward: [UNLOCK_BUTTON, getButton("buy-machine")],
            completeMessage: ">boba-game/console: awesome! now you can afford to automate your boba production. try buying a machine!"
        },
        {
            target: 1,
            getValue: () => gs.machine.machineCount,
            description: "buy your first boba-making machine!",
            completeMessage: "boba-game/console: wow, a machine! it's a bit on the slow side, but at least it works. how about $5 next? you think you can do it?"
        },
        {
            target: 5,
            getValue: () => gs.money,
            description: "earn $5 selling your boba!",
            reward: [UNLOCK_TAB, createUpgradesTab],
            completeMessage: ">boba-game/console: incredible! you're really making a name for yourself in the boba world. check out the upgrades tab!"
        }
    ];
}

export let currentQuest = 0;

// function to advance to the next quest
export function nextQuest() {
    currentQuest++;
}

// function to update the quest description with a typewriter effect
export function updateDescription(questNumber) {
    return new Promise((resolve) => {
        const questDesc = get("quest-description");
        typeText(questDesc, quests[questNumber].description, resolve);
    });
}

// function to update the quest progress bar
export function updateQuestProgress() {
    if (currentQuest >= quests.length) return;

    const quest = quests[currentQuest];
    let progress = quest.getValue() / quest.target;
    if (progress > 1) progress = 1;

    const progressBar = get("progress-bar-inner");
    if (progressBar) {
        progressBar.style.width = `${progress * 100}%`;
        progressBar.textContent = `${Math.round(progress * 100)}%`;
    }

    if (quest.getValue() >= quest.target) {
        try { confetti(); } catch (e) {}
        nextQuest();

        switch (quest.reward?.[0]) {
            case UNLOCK_BUTTON:
                const button = quest.reward[1];
                button.unlock();
                break;
            case UNLOCK_TAB:
                const tabFunction = quest.reward[1];
                tabFunction();
                break;
        }

        if (quest.completeMessage) pushConsole(quest.completeMessage);

        if (currentQuest < quests.length) updateDescription(currentQuest).then(() => updateQuestProgress());
    }
}
