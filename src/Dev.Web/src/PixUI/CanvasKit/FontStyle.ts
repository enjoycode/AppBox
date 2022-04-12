import {FontSlant, FontStyle as CkFontStyle, FontWeight} from "canvaskit-wasm";

export class FontStyle implements CkFontStyle {
    public weight: FontWeight;
    public slant: FontSlant;

    constructor(weight: FontWeight, slant: FontSlant) {
        this.weight = weight;
        this.slant = slant;
    }
}
