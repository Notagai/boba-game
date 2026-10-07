import { gameState as gs, state } from "./game-state.js";
import { formatMoney } from "./utils.js";
import { pushConsole } from "./console.js";
import { Button } from "./button.js";
import { createTabButton } from "./ui.js";
import { updateValue, flashReject } from "./dom.js";

const upgradesContainer = document.createElement("div");
upgradesContainer.id = "upgrades-container";
upgradesContainer.classList.add("button-container");

const purchasedUpgradesContainer = document.createElement("div");
purchasedUpgradesContainer.id = "purchased-upgrades-container";
purchasedUpgradesContainer.classList.add("button-container");

let upgrades = null;

export function createUpgrades() {
    upgrades = [
        {
            icon: "⚡",
            name: "faster brewing",
            blurb: "upgrade your brewing technique to make boba faster!",
            status: () => ["reduces brewing time from ", gs.brew.brewSpeed, " seconds to ", gs.brew.brewSpeed * 0.75, " seconds"],
            checkRequirement: () => gs.brew.bobaMade >= 10,
            isUnlocked: false,
            cost: 2,
            effect: () => { gs.brew.brewSpeed *= 0.75; }
        },
        {
            icon: "📦",
            name: "bulk brewing",
            blurb: "brew multiple boba at once! efficiency is key.",
            status: () => ["increases boba per brew from ", gs.brew.bobaPerBrew, " to ", gs.brew.bobaPerBrew + 1, " boba"],
            checkRequirement: () => gs.brew.bobaMade >= 25,
            isUnlocked: false,
            cost: 5,
            effect: () => { gs.brew.bobaPerBrew += 1; }
        },
        {
            icon: "💰",
            name: "premium packaging",
            blurb: "fancy packaging makes customers willing to pay more!",
            status: () => ["increases sell multiplier from ", gs.sell.sellMultiplier, "x to ", (gs.sell.sellMultiplier + 0.5).toFixed(1), "x, boosting your profit per boba"],
            checkRequirement: () => gs.sell.bobaSold >= 20,
            isUnlocked: false,
            cost: 8,
            effect: () => {
                gs.sell.sellMultiplier += 0.5;
                gs.bobaValue = formatMoney(gs.bobaValue * 1.5);
                updateValue();
            }
        },
        {
            icon: "📢",
            name: "ad efficiency",
            blurb: "learn better marketing strategies to get more bang for your buck!",
            status: () => ["increases ad effectiveness from $", gs.advertise.advertisingEffectiveness, " to $", (gs.advertise.advertisingEffectiveness * 1.5).toFixed(3), " per campaign"],
            checkRequirement: () => gs.advertise.advertisementsRan >= 5,
            isUnlocked: false,
            cost: 12,
            effect: () => { gs.advertise.advertisingEffectiveness *= 1.5; }
        },
        {
            icon: "🔧",
            name: "machine optimization",
            blurb: "tune up your machines to make them brew faster!",
            status: () => ["reduces machine brewing time from ", gs.machine.machineSpeed, " seconds to ", gs.machine.machineSpeed * 0.7, " seconds"],
            checkRequirement: () => gs.machine.machineCount >= 2,
            isUnlocked: false,
            cost: 15,
            effect: () => { gs.machine.machineSpeed *= 0.7; }
        },
        {
            icon: "🎯",
            name: "discount coupons",
            blurb: "negotiate better deals on advertising space!",
            status: () => ["reduces advertising cost by 20%, from $", gs.advertise.advertisingCost, " to $", formatMoney(gs.advertise.advertisingCost * 0.8)],
            checkRequirement: () => gs.advertise.advertisementsRan >= 10,
            isUnlocked: false,
            cost: 20,
            effect: () => { gs.advertise.advertisingCost = formatMoney(gs.advertise.advertisingCost * 0.8); }
        },
        {
            icon: "🏭",
            name: "industrial brewing",
            blurb: "upgrade to industrial-grade equipment for massive production!",
            status: () => ["increases boba per brew by 3, from ", gs.brew.bobaPerBrew, " to ", gs.brew.bobaPerBrew + 3, " boba"],
            checkRequirement: () => gs.machine.machineCount >= 5,
            isUnlocked: false,
            cost: 50,
            effect: () => { gs.brew.bobaPerBrew += 3; }
        },
        {
            icon: "⚙️",
            name: "auto-machines",
            blurb: "machines now work twice as efficiently!",
            status: () => ["cuts all machine brewing time in half, from ", gs.machine.machineSpeed, " seconds to ", gs.machine.machineSpeed * 0.5, " seconds"],
            checkRequirement: () => gs.machine.machineCount >= 10,
            isUnlocked: false,
            cost: 100,
            effect: () => { gs.machine.machineSpeed *= 0.5; }
        },
        {
            icon: "💎",
            name: "luxury boba",
            blurb: "create premium boba that sells for top dollar!",
            status: () => ["doubles your boba value! from $", gs.bobaValue, " to ", formatMoney(gs.bobaValue * 2)],
            checkRequirement: () => gs.money >= 75,
            isUnlocked: false,
            cost: 150,
            effect: () => {
                gs.bobaValue = formatMoney(gs.bobaValue * 2);
                updateValue();
            }
        },
        {
            icon: "🚀",
            name: "boba empire",
            blurb: "the ultimate upgrade - you're now a boba tycoon!",
            status: () => ["doubles brewing speed, production, and profit! this is it!"],
            checkRequirement: () => gs.money >= 500,
            isUnlocked: false,
            cost: 500,
            effect: () => {
                gs.brew.brewSpeed *= 0.5;
                gs.brew.bobaPerBrew *= 2;
                gs.bobaValue = formatMoney(gs.bobaValue * 2);
                gs.machine.machineSpeed *= 0.5;
                updateValue();
            }
        }
    ];
}

export function initializeUpgradeButtons() {
    if (!upgrades) return;

    upgrades.forEach(upgrade => {
        upgrade.button = new Button(
            `upgrade-${upgrade.name.toLowerCase().replace(/\s+/g, "-")}`,
            upgrade.icon,
            upgrade.icon,
            null,
            upgrade.name,
            upgrade.blurb,
            () => [...upgrade.status(), "\ncost: $", formatMoney(upgrade.cost)],
            () => {
                if (gs.money < upgrade.cost) {
                    flashReject(upgrade.button.button, "not enough money to purchase this upgrade");
                    return false;
                }
                return true;
            },
            () => {
                state.changeMoney(-upgrade.cost);
                upgrade.effect();
                upgrade.button.remove();
                upgrade.button.containerId = "purchased-upgrades-container";
                upgrade.button.preRunCheck = () => false;
                upgrade.button.disable();
                upgrade.button.unlock();
                pushConsole(`>boba-game/console: purchased upgrade: ${upgrade.name}`);
            },
            false,
            "upgrades-container"
        );
    });
}

export function updateUpgradesProgress() {
    if (!upgrades) return;

    upgrades.forEach(upgrade => {
        if (upgrade.checkRequirement() && !upgrade.isUnlocked) {
            upgrade.button.unlock();
            pushConsole(`>boba-game/console: upgrade available: ${upgrade.name}`);
            upgrade.isUnlocked = true;
        }
    });
}

function renderUpgradesTabContent(contentArea) {
    const availableHeader = document.createElement("h3");
    availableHeader.innerText = "~upgrades available~";
    contentArea.appendChild(availableHeader);
    contentArea.appendChild(upgradesContainer);

    const purchasedHeader = document.createElement("h3");
    purchasedHeader.innerText = "~upgrades purchased~";
    contentArea.appendChild(purchasedHeader);
    contentArea.appendChild(purchasedUpgradesContainer);
}

export function createUpgradesTab() {
    const upgradesTabDefinition = {
        id: "upgrades",
        text: "upgrades",
        updateContent: renderUpgradesTabContent
    };

    createTabButton(upgradesTabDefinition);
}
