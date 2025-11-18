// hello this is the lil toolbox for the boba game
// tiny helpers that other files can just use without thinking

// quick check: are we on mobile? (used for orientation hints)
export function isMobile() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

// make money nice (2 decimals) but keep it as a number so math still works
export function formatMoney(value) {
    return Math.round(Number(value) * 100) / 100;
}

// audio files
export const audio = {
    // not good for ear
    fahhh: new Audio("../fahhhhhhhhhhhhhh.mp3"),
    // tactile button feedback
    pop: new Audio("../pop.mp3")
};

// constants for reference
export const UNLOCK = 1;
export const letters = "abcdefghijklmnopqrstuvwxyz";
