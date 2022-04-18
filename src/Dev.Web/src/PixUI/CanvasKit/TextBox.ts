import {Rect} from './Rect'
import {TextDirection} from "canvaskit-wasm";

export class TextBox {
    public Rect: Rect;
    public Direction: TextDirection;

    public Clone(): TextBox {
        let clone = new TextBox();
        clone.Rect = this.Rect;
        clone.Direction = this.Direction;
        return clone;
    }
}
