export abstract class MapProjector {
    #MapWidth: number = 0;
    public get MapWidth() {
        return this.#MapWidth;
    }

    protected set MapWidth(value) {
        this.#MapWidth = value;
    }

    #MapHeight: number = 0;
    public get MapHeight() {
        return this.#MapHeight;
    }

    protected set MapHeight(value) {
        this.#MapHeight = value;
    }

    #XOffset: number = 0;
    public get XOffset() {
        return this.#XOffset;
    }

    protected set XOffset(value) {
        this.#XOffset = value;
    }

    #YOffset: number = 0;
    public get YOffset() {
        return this.#YOffset;
    }

    protected set YOffset(value) {
        this.#YOffset = value;
    }

    public abstract ToMap(point: Float64Array): Float32Array;
}
