import { get } from "./dom.js";
import {flags, gameState as gs, state} from "./game-state.js";
import { formatMoney, audio } from "./utils.js";
import { pushConsole } from "./console.js";
import { Button } from "./button.js";
import {createTabButton, showPopup} from "./ui.js";


// defining the upgrade container and purchased upgrades container
const upgradesContainer = document.createElement("div");
upgradesContainer.id = "upgrades-container";
upgradesContainer.classList.add("button-container");

const purchasedUpgradesContainer = document.createElement("div");
purchasedUpgradesContainer.id = "purchased-upgrades-container";
purchasedUpgradesContainer.classList.add("button-container");

// upgrades setter function (to avoid circular dependencies)
let upgrades = null;
export function createUpgrades() {
    upgrades = [
        {
            icon: "🧋",
            name: "test",
            blurb: "this is just a little test upgrade; don't mind me!",
            status: () => ["just for funsies, this upgrade will give you $", 10, " straight out of thin air!"],
            checkRequirement: () => gs.brew.bobaMade > 1,
            isUnlocked: false,
            cost: 0.05,
            effect: () => {
                state.changeMoney(10);
            }
        }
    ]
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
                    showPopup("not enough money to purchase this upgrade!");
                    return false;
                }
                return true;
            },
            // do action, then move button to purchased section
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

// function to update upgrades
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

// function to render upgrades tab content
function renderUpgradesTabContent(contentArea) {
    // available upgrades section
    const availableHeader = document.createElement("h3");
    availableHeader.innerText = "~upgrades available~";
    contentArea.appendChild(availableHeader);
    contentArea.appendChild(upgradesContainer);

    // purchased upgrades section
    const purchasedHeader = document.createElement("h3");
    purchasedHeader.innerText = "~upgrades purchased~";
    contentArea.appendChild(purchasedHeader);
    contentArea.appendChild(purchasedUpgradesContainer);
}

// create the upgrades tab
export function createUpgradesTab() {
    const upgradesTabDefinition = {
        id: "upgrades",
        text: "upgrades",
        updateContent: renderUpgradesTabContent
    };

    createTabButton(upgradesTabDefinition);
}

