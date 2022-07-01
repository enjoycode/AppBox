namespace PixUI
{
    public abstract class Simulation
    {
        /// <summary>
        /// How close to the actual end of the simulation a value at a particular time
        /// must be before [isDone] considers the simulation to be "done".
        /// </summary>
        /// <remarks>
        /// A simulation with an asymptotic curve would never technically be "done",
        /// but once the difference from the value at a particular time and the
        /// asymptote itself could not be seen, it would be pointless to continue. The
        /// tolerance defines how to determine if the difference could not be seen.
        /// </remarks>
        public Tolerance Tolerance { get; private set; }

        public Simulation(Tolerance? tolerance = null)
        {
            Tolerance = tolerance ?? Tolerance.Default;
        }

        /// <summary>
        /// The position of the object in the simulation at the given time.
        /// </summary>
        public abstract double X(double time);

        /// <summary>
        /// The velocity of the object in the simulation at the given time.
        /// </summary>
        public abstract double Dx(double time);

        /// <summary>
        ///  Whether the simulation is "done" at the given time.
        /// </summary>
        public abstract bool IsDone(double time);
    }
}