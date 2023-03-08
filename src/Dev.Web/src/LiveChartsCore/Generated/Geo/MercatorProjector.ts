import * as LiveChartsCore from '@/LiveChartsCore'

export class MercatorProjector extends LiveChartsCore.MapProjector {
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
        return new Float32Array([1, 1]);
    }

    public ToMap(point: Float64Array): Float32Array {
        let lat = point[1];
        let lon = point[0];

        let latRad = lat * Math.PI / 180;
        let mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
        let y = this._h / 2 - this._h * mercN / (2 * Math.PI);

        return new Float32Array([
            <number><unknown>((lon + 180) * (this._w / 360) + this._ox),
            <number><unknown>y + this._oy
        ]);
    }
}
