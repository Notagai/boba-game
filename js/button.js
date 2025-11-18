// hello this is the button class for creating interactive buttons
// it handles button state, colors, and action callbacks

import { get } from "./dom.js";
import { flags } from "./game-state.js";
import { updateGameState } from "./game-state.js";
import { updateQuestProgress } from "./quest.js";
import { audio } from "./utils.js";

export class Button {
    constructor(id, enabledText, disabledText,
                getWaitTime = null, tooltipHeader = null, tooltipText = null, tooltipStatsTextSupplier = null, preRunCheck = null, buttonAction = null,
                addProgressBar = false, containerId = "button-container", enabledColor = "#ffd079", disabledColor = "#dbd0baff", runningColor = "#c1fafb") {
        this.id = id;
        this.enabledText = enabledText;
        this.disabledText = disabledText;
        this.getWaitTime = (typeof getWaitTime === "function") ? getWaitTime : () => 0;
        this.tooltipHeader = tooltipHeader;
        this.tooltipText = tooltipText;
        this.textPartsSupplier = tooltipStatsTextSupplier;
        this.preRunCheck = preRunCheck;
        this.buttonAction = buttonAction;
        this.addProgressBar = addProgressBar;
        this.containerId = containerId;
        this.enabledColor = enabledColor;
        this.disabledColor = disabledColor;
        this.runningColor = runningColor;
        this.shouldContinue = true;
    }

    // function to get flag
    getFlag() {
        return (this.getWaitTime() > 0) ? flags.toFlag(this.id) : null;
    }

    // function to get flag value
    getFlagValue() {
        const flag = this.getFlag();
        return (flag) ? flags[flag] : true;
    }

    // function to enable the button
    enable() {
        this.button.style.cursor = "pointer";
        this.button.style.backgroundColor = this.enabledColor;
        this.button.innerText = this.enabledText;
        flags[this.getFlag()] = true;
    }

    // function to disable the button
    disable() {
        this.button.style.cursor = "not-allowed";
        this.button.style.backgroundColor = this.disabledColor;
        this.button.innerText = this.disabledText;
        flags[this.getFlag()] = false;
    }

    // function to set stats text
    setStatsText() {
        if (!this.textPartsSupplier) return;
        this.stats.innerHTML = "";

        this.textPartsSupplier().forEach(part => {
            // check if the part is a string or a number, puts strings in p elements and numbers in highlight spans
            const element = (typeof part === "string") ? document.createTextNode(part) : document.createElement("span");
            if (typeof part === "number") {
                element.className = "highlight";
                element.innerText = part.toString();
            }
            this.stats.appendChild(element);
        });
    }

    // function to unlock a button with an optional message
    unlock() {
        this.buttonWrapper = document.createElement("div");
        this.buttonWrapper.className = "button-wrapper";

        // this makes the actual button element
        this.button = document.createElement("button");
        this.button.id = this.id;
        this.enable();
        this.button.addEventListener("click", () => this.run());
        this.buttonWrapper.appendChild(this.button);

        // this adds a tooltip if needed
        if (this.tooltipHeader || this.tooltipText || this.textPartsSupplier) {
            this.tooltip = document.createElement("span");
            this.tooltip.className = "tooltip";
            this.buttonWrapper.appendChild(this.tooltip);
        }

        // this adds a tooltip header if provided
        if (this.tooltipHeader) {
            const header = document.createElement("h3");
            header.innerText = this.tooltipHeader;
            this.tooltip.appendChild(header);
        }

        // this adds tooltip text if provided
        if (this.tooltipText) {
            const blurb = document.createElement("p");
            blurb.innerText = this.tooltipText;
            this.tooltip.appendChild(blurb);
        }

        // things to do only if stats text supplier is provided
        if (this.textPartsSupplier) {
            const horizontalRule = document.createElement("hr");
            this.tooltip.appendChild(horizontalRule);

            this.stats = document.createElement("div");
            this.stats.className = "tooltip-stats";
            this.tooltip.appendChild(this.stats);

            // update stats text every time tooltip is shown
            this.button.addEventListener("mouseover", () => {
                this.setStatsText();
            });
        }

        // check if tooltip is off-screen, flip if it is
        if (this.tooltip) {
            this.button.addEventListener("mouseover", () => {
                const rect = this.button.getBoundingClientRect();
                if (rect.right + this.tooltip.offsetWidth > window.innerWidth) {
                    // should flip tooltip around the center of the button
                    this.tooltip.style.left = `calc(-1rem - ${this.tooltip.offsetWidth}px)`;
                } else {
                    this.tooltip.style.left = "calc(100% + 1rem)";
                }
            });
        }

        // add a progress bar if requested
        if (this.addProgressBar) {
            const progressContainer = document.createElement("div");
            progressContainer.className = "button-progress-container";

            this.progressBar = document.createElement("div");
            this.progressBar.className = "button-progress-bar";

            progressContainer.appendChild(this.progressBar);
            this.buttonWrapper.appendChild(progressContainer);
        }

        // flip the tooltip if no space on the right
        //if (this.tooltip && this.tooltip.parentNode.)

        const buttonContainer = get(this.containerId);
        buttonContainer.appendChild(this.buttonWrapper);
    }

    // function to remove the button (aka delete it from the DOM)
    remove() {
        if (this.buttonWrapper && this.buttonWrapper.parentNode) {
            this.buttonWrapper.parentNode.removeChild(this.buttonWrapper);
        }
    }

    // the run cycle of the function
    run() {
        if (this.preRunCheck) this.shouldContinue = this.preRunCheck();
        if (!this.shouldContinue) return;

        // play the audio.pop sound effect
        const click = audio.pop.cloneNode()
        click.play();

        updateQuestProgress(); // this one in case the pre-run check changes the quest progress

        const waitTime = this.getWaitTime() * 1000; // convert to milliseconds, as waitTime is in seconds

        if (waitTime > 0) {
            this.disable();

            this.button.style.transform = "none";
            this.button.style.transition = `background-size ${waitTime}ms linear`;
            this.button.style.background = `linear-gradient(to right, ${this.runningColor}, ${this.runningColor}) no-repeat, ${this.disabledColor}`;
            this.button.style.backgroundSize = "0% 100%";
            this.button.offsetHeight;
            this.button.style.backgroundSize = "100% 100%";
        }

        if (this.buttonAction) {
            setTimeout(() => {
                this.button.style.transform = "";
                this.button.style.background = "";
                this.button.style.backgroundSize = "";
                this.button.style.transition = "";

                this.buttonAction();
                this.enable();
                updateGameState(); // this one for if the action changes the quest progress
            }, waitTime);
        }
    }
}