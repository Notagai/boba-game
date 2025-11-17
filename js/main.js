// hello this is the file for the game logic of the boba game
// it keeps track of state (money, boba, quality), quests/progress,
// and exposes the main actions as globals so the buttons can call the

import { initGame, brewBtn, sellBtn, adBtn, buyMachineBtn } from "./init.js";

// let the games begin :)
initGame();

// main game actions, this one brews boba
function brew() {
    brewBtn.run();
}
window.brew = brew;

// this one sells boba
function sell() {
    sellBtn.run();
}
window.sell = sell;

// this one runs advertising
function advertise() {
    adBtn.run();
}
window.advertise = advertise;

// this one buys a machine
function buyMachine() {
    buyMachineBtn.run();
}
window.buyMachine = buyMachine;

