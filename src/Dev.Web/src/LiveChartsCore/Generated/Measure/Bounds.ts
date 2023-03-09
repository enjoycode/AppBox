export class Bounds {
    public constructor() {
    }

    // /// <summary>
    // /// Creates a new instance of the <see cref="Bounds"/> class. based on the given <see cref="Bounds"/>.
    // /// </summary>
    // /// <param name="bounds"></param>
    // public Bounds(Bounds bounds)
    // {
    //     IsEmpty = bounds.IsEmpty;
    //     Max = bounds.Max;
    //     Min = bounds.Min;
    //     PaddingMax = bounds.PaddingMax;
    //     PaddingMin = bounds.PaddingMin;
    //     RequestedGeometrySize = bounds.RequestedGeometrySize;
    //     MinDelta = bounds.MinDelta;
    // }

    #IsEmpty: boolean = true;
    public get IsEmpty() {
        return this.#IsEmpty;
    }

    public set IsEmpty(value) {
        this.#IsEmpty = value;
    }

    #Max: number = Number.MIN_VALUE;
    public get Max() {
        return this.#Max;
    }

    public set Max(value) {
        this.#Max = value;
    }

    #Min: number = Number.MAX_VALUE;
    public get Min() {
        return this.#Min;
    }

    public set Min(value) {
        this.#Min = value;
    }

    #PaddingMax: number = 0;
    public get PaddingMax() {
        return this.#PaddingMax;
    }

    public set PaddingMax(value) {
        this.#PaddingMax = value;
    }

    #PaddingMin: number = 0;
    public get PaddingMin() {
        return this.#PaddingMin;
    }

    public set PaddingMin(value) {
        this.#PaddingMin = value;
    }

    #RequestedGeometrySize: number = 0;
    public get RequestedGeometrySize() {
        return this.#RequestedGeometrySize;
    }

    public set RequestedGeometrySize(value) {
        this.#RequestedGeometrySize = value;
    }

    public get Delta(): number {
        return this.Max - this.Min;
    }

    #MinDelta: number = Number.MAX_VALUE;
    public get MinDelta() {
        return this.#MinDelta;
    }

    public set MinDelta(value) {
        this.#MinDelta = value;
    }

    public AppendValue(value: number) {
        if (this.Max <= value) this.Max = value;
        if (this.Min >= value) this.Min = value;
        this.IsEmpty = false;
    }

    public AppendValueByBounds(bounds: Bounds) {
        if (this.Max <= bounds.Max) this.Max = bounds.Max;
        if (this.Min >= bounds.Min) this.Min = bounds.Min;
        if (bounds.MinDelta < this.MinDelta) this.MinDelta = bounds.MinDelta;
        if (this.RequestedGeometrySize < bounds.RequestedGeometrySize) this.RequestedGeometrySize = bounds.RequestedGeometrySize;
        if (this.PaddingMin < bounds.PaddingMin) this.PaddingMin = bounds.PaddingMin;
        if (this.PaddingMax < bounds.PaddingMax) this.PaddingMax = bounds.PaddingMax;
        this.IsEmpty = false;
    }

    public HasSameLimitTo(bounds: Bounds): boolean {
        return this.Max == bounds.Max && this.Min == bounds.Min;
    }
}
