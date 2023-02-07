/// <summary>
/// Structure that specifies maximum allowable magnitudes for distances,
/// durations, and velocity differences to be considered equal.
/// </summary>
export class Tolerance //TODO: maybe struct
{
    private static readonly EpsilonDefault: number = 1e-3;

    public static readonly Default: Tolerance = new Tolerance();

    /// <summary>
    /// The magnitude of the maximum distance between two points for them to be
    /// considered within tolerance.
    /// </summary>
    /// <remarks>
    /// The units for the distance tolerance must be the same as the units used
    /// for the distances that are to be compared to this tolerance.
    /// </remarks>
    public readonly Distance: number;


    /// <summary>
    /// The magnitude of the maximum duration between two times for them to be
    /// considered within tolerance.
    /// </summary>
    /// <remarks>
    /// The units for the time tolerance must be the same as the units used
    /// for the times that are to be compared to this tolerance.
    /// </remarks>
    public readonly Time: number;

    /// <summary>
    /// The magnitude of the maximum difference between two velocities for them to
    /// be considered within tolerance.
    /// </summary>
    /// <remarks>
    /// The units for the velocity tolerance must be the same as the units used
    /// for the velocities that are to be compared to this tolerance.
    /// </remarks>
    public readonly Velocity: number;

    public constructor(distance: number = Tolerance.EpsilonDefault, time: number = Tolerance.EpsilonDefault,
                       velocity: number = Tolerance.EpsilonDefault) {
        this.Distance = distance;
        this.Time = time;
        this.Velocity = velocity;
    }
}
