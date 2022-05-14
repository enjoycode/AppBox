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
    //TODO: others
    switch (ev.code) {
        case 'Backspace':
            keys = Keys.Back;
            break;
        case 'Tab':
            keys = Keys.Tab;
            break;
        case 'Enter':
            keys = Keys.Return;
            break;
        case 'ArrowLeft':
            keys = Keys.Left;
            break;
        case 'ArrowRight':
            keys = Keys.Right;
            break;
        case 'ArrowUp':
            keys = Keys.Up;
            break;
        case 'ArrowDown':
            keys = Keys.Down;
            break;
    }

    if (ev.shiftKey) keys |= Keys.Shift;
    if (ev.ctrlKey) keys |= Keys.Control;
    if (ev.altKey) keys |= Keys.Alt;

    return keys;
}
