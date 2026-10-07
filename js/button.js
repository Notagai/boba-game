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

    getFlag() {
        return this.getWaitTime() > 0 ? flags.toFlag(this.id) : null;
    }

    getFlagValue() {
        const flag = this.getFlag();
        return flag ? flags[flag] : true;
    }

    enable() {
        this.button.style.cursor = "pointer";
        this.button.style.backgroundColor = this.enabledColor;
        this.button.innerText = this.enabledText;

        const flag = this.getFlag();
        if (flag) flags[flag] = true;
    }

    disable() {
        this.button.style.cursor = "not-allowed";
        this.button.style.backgroundColor = this.disabledColor;
        this.button.innerText = this.disabledText;

        const flag = this.getFlag();
        if (flag) flags[flag] = false;
    }

    setStatsText() {
        if (!this.textPartsSupplier || !this.stats) return;
        this.stats.innerHTML = "";

        this.textPartsSupplier().forEach(part => {
            const element = typeof part === "string"
                ? document.createTextNode(part)
                : document.createElement("span");

            if (typeof part === "number") {
                element.className = "highlight";
                element.innerText = part.toString();
            }
            this.stats.appendChild(element);
        });
    }

    unlock() {
        if (this.buttonWrapper?.isConnected) return;

        this.buttonWrapper = document.createElement("div");
        this.buttonWrapper.className = "button-wrapper";

        this.button = document.createElement("button");
        this.button.id = this.id;
        this.button.type = "button";
        this.enable();
        this.button.addEventListener("click", () => this.run());
        this.buttonWrapper.appendChild(this.button);

        if (this.tooltipHeader || this.tooltipText || this.textPartsSupplier) {
            this.tooltip = document.createElement("span");
            this.tooltip.className = "tooltip";
            this.buttonWrapper.appendChild(this.tooltip);
        }

        if (this.tooltipHeader) {
            const header = document.createElement("h3");
            header.innerText = this.tooltipHeader;
            this.tooltip.appendChild(header);
        }

        if (this.tooltipText) {
            const blurb = document.createElement("p");
            blurb.innerText = this.tooltipText;
            this.tooltip.appendChild(blurb);
        }

        if (this.textPartsSupplier) {
            const horizontalRule = document.createElement("hr");
            this.tooltip.appendChild(horizontalRule);

            this.stats = document.createElement("div");
            this.stats.className = "tooltip-stats";
            this.tooltip.appendChild(this.stats);

            this.button.addEventListener("mouseenter", () => this.setStatsText());
            this.button.addEventListener("focus", () => this.setStatsText());
        }

        if (this.tooltip) {
            const positionTooltip = () => {
                const rect = this.button.getBoundingClientRect();
                if (rect.right + this.tooltip.offsetWidth > window.innerWidth - 8) {
                    this.tooltip.style.left = `calc(-1rem - ${this.tooltip.offsetWidth}px)`;
                } else {
                    this.tooltip.style.left = "calc(100% + 1rem)";
                }
            };
            this.button.addEventListener("mouseenter", positionTooltip);
            this.button.addEventListener("focus", positionTooltip);
        }

        if (this.addProgressBar) {
            const progressContainer = document.createElement("div");
            progressContainer.className = "button-progress-container";

            this.progressBar = document.createElement("div");
            this.progressBar.className = "button-progress-bar";

            progressContainer.appendChild(this.progressBar);
            this.buttonWrapper.appendChild(progressContainer);
        }

        const buttonContainer = get(this.containerId);
        buttonContainer?.appendChild(this.buttonWrapper);
    }

    remove() {
        if (this.buttonWrapper?.parentNode) {
            this.buttonWrapper.parentNode.removeChild(this.buttonWrapper);
        }
    }

    run() {
        this.shouldContinue = this.preRunCheck ? this.preRunCheck() : true;
        if (!this.shouldContinue) return;

        const click = audio.pop.cloneNode();
        click.play().catch(() => {});

        updateQuestProgress();

        const waitTime = Math.max(0, Number(this.getWaitTime()) || 0) * 1000;

        if (waitTime > 0) {
            this.disable();

            this.button.style.transform = "none";
            this.button.style.transition = `background-size ${waitTime}ms linear`;
            this.button.style.background = `linear-gradient(to right, ${this.runningColor}, ${this.runningColor}) no-repeat, ${this.disabledColor}`;
            this.button.style.backgroundSize = "0% 100%";
            void this.button.offsetHeight;
            this.button.style.backgroundSize = "100% 100%";
        }

        if (this.buttonAction) {
            setTimeout(() => {
                if (!this.button?.isConnected) return;

                this.button.style.transform = "";
                this.button.style.background = "";
                this.button.style.backgroundSize = "";
                this.button.style.transition = "";

                this.buttonAction();
                this.enable();
                updateGameState();
            }, waitTime);
        }
    }
}
