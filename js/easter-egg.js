// here be easter eggs

import { gameState as gs, state } from "./game-state.js";
import { showPopup } from "./ui.js";

function bubble(bubbleNumber) {
    const easter = gs.easterEgg;

    if (bubbleNumber === easter.currentBubble) {
        easter.clickedAmount ++;
        if (easter.clickedAmount === easter.clickingOrder.length) {
            state.changeMoney(10);
            return;
        }

        easter.currentBubble = easter.clickingOrder[easter.clickedAmount];
    } else {
        easter.clickedAmount = 0;
        easter.currentBubble = easter.clickingOrder[0];
    }

    if (bubbleNumber === 5) {
        showPopup("wow you found an easter egg! here's some confetti for your effort 🎉");
        try{ confetti(); } catch(e){}
    } else if (bubbleNumber === 10) {
        showPopup("nice try ts is not giving you more confetti");
    }

    console.log(`Clicked bubble ${bubbleNumber}, clickedAmount: ${easter.clickedAmount}, currentBubble: ${easter.currentBubble}`);
}
window.bubble = bubble;
