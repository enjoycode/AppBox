export class Tolerance //TODO: maybe struct
{
    private static readonly EpsilonDefault: number = 1e-3;

    public static readonly Default: Tolerance = new Tolerance();

    public readonly Distance: number;


    public readonly Time: number;

    public readonly Velocity: number;

    public constructor(distance: number = Tolerance.EpsilonDefault, time: number = Tolerance.EpsilonDefault,
                       velocity: number = Tolerance.EpsilonDefault) {
        this.Distance = distance;
        this.Time = time;
        this.Velocity = velocity;
    }
}
