import * as LiveChartsCore from '@/LiveChartsCore'

export class SeriesBounds {
    private readonly _isPrevious: boolean;

    public constructor(bounds: LiveChartsCore.DimensionalBounds, isPrevious: boolean) {
        this.Bounds = bounds;
        this._isPrevious = this.HasData;
    }

    #Bounds: LiveChartsCore.DimensionalBounds;
    public get Bounds() {
        return this.#Bounds;
    }

    private set Bounds(value) {
        this.#Bounds = value;
    }

    public get HasData(): boolean {
        return this._isPrevious || this.Bounds.IsEmpty;
    }
}
