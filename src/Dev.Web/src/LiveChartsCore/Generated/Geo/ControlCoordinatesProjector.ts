import * as LiveChartsCore from '@/LiveChartsCore'

export class ControlCoordinatesProjector extends LiveChartsCore.MapProjector {
    private readonly _w: number;
    private readonly _h: number;
    private readonly _ox: number;
    private readonly _oy: number;

    public constructor(mapWidth: number, mapHeight: number, offsetX: number, offsetY: number) {
        super();
        this._w = mapWidth;
        this._h = mapHeight;
        this._ox = offsetX;
        this._oy = offsetY;
        this.XOffset = this._ox;
        this.YOffset = this._oy;
        this.MapWidth = mapWidth;
        this.MapHeight = mapHeight;
    }

    public static get PreferredRatio(): Float32Array {
        return new Float32Array([2, 1]);
    }

    public ToMap(point: Float64Array): Float32Array {

        return new Float32Array([
            <number><unknown>(this._ox + (point[0] + 180) / 360 * this._w),
            <number><unknown>(this._oy + (90 - point[1]) / 180 * this._h)
        ]);


    }
}
