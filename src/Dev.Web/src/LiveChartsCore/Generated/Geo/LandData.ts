import * as LiveChartsCore from '@/LiveChartsCore'
import * as System from '@/System'

export class LandData {
    public constructor(coordinates: Float64Array) {
        let c = new System.List<LiveChartsCore.LvcPointD>();

        for (const point of coordinates) {
            let x = point[0];
            let y = point[1];

            if (x > this.MaxBounds[0]) this.MaxBounds[0] = x;
            if (x < this.MinBounds[0]) this.MinBounds[0] = x;

            if (y > this.MaxBounds[1]) this.MaxBounds[1] = y;
            if (y < this.MinBounds[1]) this.MinBounds[1] = y;

            c.Add(new LiveChartsCore.LvcPointD(x, y));
        }

        this.Coordinates = c.ToArray();
        this.BoundsHypotenuse = Math.sqrt(Math.pow(this.MaxBounds[0] - this.MinBounds[0], 2) + Math.pow(this.MaxBounds[1] - this.MinBounds[1], 2));
    }

    public MaxBounds: Float64Array = new Float64Array([-1.7976931348623157E+308/*DoubleMin*/, -1.7976931348623157E+308/*DoubleMin*/]);

    public MinBounds: Float64Array = new Float64Array([1.7976931348623157E+308/*DoubleMax*/, 1.7976931348623157E+308/*DoubleMax*/]);

    #BoundsHypotenuse: number = 0;
    public get BoundsHypotenuse() {
        return this.#BoundsHypotenuse;
    }

    private set BoundsHypotenuse(value) {
        this.#BoundsHypotenuse = value;
    }

    #Coordinates: LiveChartsCore.LvcPointD[];
    public get Coordinates() {
        return this.#Coordinates;
    }

    private set Coordinates(value) {
        this.#Coordinates = value;
    }

    public Shape: any;
}
