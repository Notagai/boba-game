// hello this is the console manager for the in-game console
// lets you add messages to the console panel without touching the dom directly

import { get, typeText } from "./dom.js";

export const maxMessages = 5;

export function pushConsole(message) {
    const messagesElement = get("messages");

    const newMessage = document.createElement("p");
    messagesElement.appendChild(newMessage);
    typeText(newMessage, message);

    if (messagesElement.childElementCount > maxMessages) {
        messagesElement.firstElementChild.remove();
    }
}

export function clearConsole() {
    get("messages").innerHTML = "";
}

