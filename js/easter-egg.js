// here be easter eggs

import { gameState as gs, state } from "./game-state.js";
import { get, flashReject } from "./dom.js";

function bubble(bubbleNumber) {
    const easter = gs.easterEgg;
    const bubbleEl = get(`bubble${bubbleNumber}`);

    if (bubbleNumber === easter.currentBubble) {
        easter.clickedAmount++;
        if (easter.clickedAmount === easter.clickingOrder.length) {
            state.changeMoney(10);
            flashReject(bubbleEl, "easter egg complete");
            try { confetti(); } catch (e) {}
            return;
        }

        easter.currentBubble = easter.clickingOrder[easter.clickedAmount];
    } else {
        easter.clickedAmount = 0;
        easter.currentBubble = easter.clickingOrder[0];
        flashReject(bubbleEl, "wrong bubble");
    }

    console.log(`Clicked bubble ${bubbleNumber}, clickedAmount: ${easter.clickedAmount}, currentBubble: ${easter.currentBubble}`);
}
window.bubble = bubble;
