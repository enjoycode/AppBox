import {PointerButtons} from "./Generated/Input/PointerEvent";
import {Keys} from "./Generated/Input/Keys";

export function ConvertToButtons(ev: MouseEvent): PointerButtons {
    switch (ev.buttons) {
        case 1:
            return PointerButtons.Left;
        case 2:
            return PointerButtons.Right;
        case 3:
            return PointerButtons.Middle;
        default:
            return PointerButtons.None;
    }
}

export function ConvertToKeys(ev: KeyboardEvent): Keys {
    let keys = Keys.None;

    if (ev.shiftKey) keys |= Keys.Shift;
    if (ev.ctrlKey) keys |= Keys.Control;
    if (ev.altKey) keys |= Keys.Alt;

    if (ev.key.length == 1) {
        let keyValue = ev.key.charCodeAt(0);
        if (keyValue >= 0x41 && keyValue <= 0x5A) { //A-Z
            return keys | <Keys>keyValue;
        }
        if (keyValue >= 0x61 && keyValue <= 0x7A) { //a-z
            return keys | <Keys>(keyValue - 32);
        }
    }

    //TODO: others and use map
    switch (ev.code) {
        case 'Backspace':
            return keys | Keys.Back;
        case 'Tab':
            return keys | Keys.Tab;
        case 'Enter':
            return keys | Keys.Return;
        case 'ArrowLeft':
            return keys | Keys.Left;
        case 'ArrowRight':
            return keys | Keys.Right;
        case 'ArrowUp':
            return keys | Keys.Up;
        case 'ArrowDown':
            return keys | Keys.Down;
    }

    return keys;
}
