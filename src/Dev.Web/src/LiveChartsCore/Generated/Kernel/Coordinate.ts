export class Coordinate {
    public constructor(primaryValue: number, secondaryValue: number, tertiaryValue: number, quaternaryValue: number, quinaryValue: number, isEmpty: boolean = false) {
        this.PrimaryValue = primaryValue;
        this.SecondaryValue = secondaryValue;
        this.TertiaryValue = tertiaryValue;
        this.QuaternaryValue = quaternaryValue;
        this.QuinaryValue = quinaryValue;
        this.IsEmpty = isEmpty;
    }

    public static MakeByXY(x: number, y: number, weight: number = 0): Coordinate {
        return new Coordinate(y, x, weight, 0, 0);
    }

    // /// <summary>
    // /// Initializes a new instance of the <see cref="Coordinate"/> struct.
    // /// </summary>
    // /// <param name="x">The X coordinate.</param>
    // /// <param name="y">The Y coordinate.</param>
    // public Coordinate(double x, double y) : this(y, x, 0, 0, 0)
    // { }

    // /// <summary>
    // /// Initializes a new instance of the <see cref="Coordinate"/> struct.
    // /// </summary>
    // /// <param name="x">The X coordinate.</param>
    // /// <param name="y">The Y coordinate.</param>
    // /// <param name="weight">The weight of the pint.</param>
    // public Coordinate(double x, double y, double weight) : this(y, x, weight, 0, 0)
    // { }

    // private Coordinate(bool isEmpty) : this(0, 0, 0, 0, 0)
    // {
    //     IsEmpty = isEmpty;
    // }

    public static get Empty(): Coordinate {
        return new Coordinate(0, 0, 0, 0, 0, true);
    }

    #IsEmpty: boolean = false;
    public get IsEmpty() {
        return this.#IsEmpty;
    }

    private set IsEmpty(value) {
        this.#IsEmpty = value;
    }

    #PrimaryValue: number = 0;
    public get PrimaryValue() {
        return this.#PrimaryValue;
    }

    private set PrimaryValue(value) {
        this.#PrimaryValue = value;
    }

    #SecondaryValue: number = 0;
    public get SecondaryValue() {
        return this.#SecondaryValue;
    }

    private set SecondaryValue(value) {
        this.#SecondaryValue = value;
    }

    #TertiaryValue: number = 0;
    public get TertiaryValue() {
        return this.#TertiaryValue;
    }

    private set TertiaryValue(value) {
        this.#TertiaryValue = value;
    }

    #QuaternaryValue: number = 0;
    public get QuaternaryValue() {
        return this.#QuaternaryValue;
    }

    private set QuaternaryValue(value) {
        this.#QuaternaryValue = value;
    }

    #QuinaryValue: number = 0;
    public get QuinaryValue() {
        return this.#QuinaryValue;
    }

    private set QuinaryValue(value) {
        this.#QuinaryValue = value;
    }
}
