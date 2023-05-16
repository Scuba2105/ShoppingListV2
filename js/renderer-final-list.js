// Pressed keys
keysPressed = [];

// Listen for the print command
window.addEventListener('keydown', addKeytoArray);
window.addEventListener('keyup', removeKeyFromArray);

function addKeytoArray(event) {
    if (!keysPressed.includes(event.key)) {
        keysPressed.push(event.key);
        if (keysPressed.join(' + ') == 'Control + p') {
            window.electronAPI.printList();
        }
    }
}

function removeKeyFromArray(event) {
    const index = keysPressed.indexOf(event.key);
    keysPressed.splice(index, 1);
}