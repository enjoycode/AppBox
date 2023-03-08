import * as LiveChartsCore from '@/LiveChartsCore'

export class LandDefinition {
    public constructor(shortName: string, name: string, setOf: string) {
        this.Name = name;
        this.ShortName = shortName;
        this.SetOf = setOf;
    }

    #ShortName: string = "";
    public get ShortName() {
        return this.#ShortName;
    }

    private set ShortName(value) {
        this.#ShortName = value;
    }

    #Name: string = "";
    public get Name() {
        return this.#Name;
    }

    private set Name(value) {
        this.#Name = value;
    }

    public SetOf: string = "";

    #HSize: number = 0;
    public get HSize() {
        return this.#HSize;
    }

    public set HSize(value) {
        this.#HSize = value;
    }

    #HCenter: number = 0;
    public get HCenter() {
        return this.#HCenter;
    }

    public set HCenter(value) {
        this.#HCenter = value;
    }

    public MaxBounds: Float64Array = new Float64Array([Number.MIN_VALUE, Number.MIN_VALUE]);

    public MinBounds: Float64Array = new Float64Array([Number.MAX_VALUE, Number.MAX_VALUE]);

    public Data: LiveChartsCore.LandData[] = [];
}
