using System;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Threading;

namespace PixUI
{
    /// The direction in which an animation is running.
    internal enum AnimationDirection
    {
        /// The animation is running from beginning to end.
        Forward,

        /// The animation is running backwards, from end to beginning.
        Reverse,
    }

    public enum AnimationBehavior
    {
        Normal,
        Preserve,
    }

    [SuppressMessage("ReSharper", "CompareOfFloatsByEqualityOperator")]
    public sealed class AnimationController : Animation<double>
    {
        private double _value;
        private AnimationStatus _status;

        /// <summary>
        /// 持续时间，单位：毫秒
        /// </summary>
        public int? Duration { get; set; }

        /// <summary>
        /// The length of time this animation should last when going in [reverse].
        /// The value of [duration] is used if [reverseDuration] is not specified or
        /// set to null.
        /// </summary>
        public int? ReverseDuration { get; set; }

        private AnimationDirection _direction;
        private readonly AnimationBehavior _animationBehavior;
        private Simulation? _simulation;

        private Ticker? _ticker;

        /// <summary>
        /// The amount of time that has passed between the time the animation started
        /// and the most recent tick of the animation.
        ///
        /// If the controller is not animating, the last elapsed duration is null.
        /// </summary>
        public double? LastElapsedDuration { get; private set; }

        private AnimationStatus _lastReportedStatus = AnimationStatus.Dismissed;

        public readonly double LowerBound = 0;
        public readonly double UpperBound = 1;

        public AnimationController(int duration, double? value = null,
            AnimationBehavior behavior = AnimationBehavior.Normal)
        {
            Duration = duration;
            _animationBehavior = behavior;
            _direction = AnimationDirection.Forward;
            _ticker = new Ticker(Tick);
            SetValueInternal(value ?? LowerBound);
        }

        public bool IsAnimating => _ticker != null && _ticker.IsActive;

        public override AnimationStatus Status => _status;

        public override double Value => _value;

        private void SetValue(double newValue)
        {
            Stop();
            SetValueInternal(newValue);
            NotifyValueChanged();
            CheckStatusChanged();
        }

        private void SetValueInternal(double newValue)
        {
            _value = Math.Clamp(newValue, LowerBound, UpperBound);
            if (_value == LowerBound)
                _status = AnimationStatus.Dismissed;
            else if (_value == UpperBound)
                _status = AnimationStatus.Completed;
            else
                _status = _direction == AnimationDirection.Forward
                    ? AnimationStatus.Forward
                    : AnimationStatus.Reverse;
        }

        public void Stop(bool canceled = true)
        {
            _ticker!.Stop(canceled); //first stop ticker
            _simulation = null;
            LastElapsedDuration = null;
        }

        private void Tick(double elapsedInSeconds)
        {
            if (_simulation == null) return; //TODO:临时判断是否已停止

            LastElapsedDuration = elapsedInSeconds;
            Debug.Assert(elapsedInSeconds >= 0.0);

            _value = Math.Clamp(_simulation!.X(elapsedInSeconds), LowerBound, UpperBound);
            if (_simulation!.IsDone(elapsedInSeconds))
            {
                _status = _direction == AnimationDirection.Forward
                    ? AnimationStatus.Completed
                    : AnimationStatus.Dismissed;
                Stop(false);
            }

            NotifyValueChanged();
            CheckStatusChanged();

// #if !__WEB__ && DEBUG
//             Console.WriteLine(
//                 $"AnimationController Tick: {elapsedInSeconds} Value={_value} Thread={Thread.CurrentThread.ManagedThreadId}");
// #endif
        }


        public void AnimateTo(double target, int? duration = null, Curve? curve = null)
        {
            if (Duration == null && duration == null)
                throw new Exception("Duration not set");

            curve ??= Curves.Linear;
            _direction = AnimationDirection.Forward;
            AnimateToInternal(target, duration, curve);
        }

        public void AnimateBack(double target, int? duration = null, Curve? curve = null)
        {
            if (Duration == null && ReverseDuration == null && duration == null)
                throw new Exception("Duration not set");
            curve ??= Curves.Linear;
            _direction = AnimationDirection.Reverse;
            AnimateToInternal(target, duration, curve);
        }

        private void AnimateToInternal(double target, int? duration = null,
            Curve? curve = null)
        {
            curve ??= Curves.Linear;

            var scale = 1.0;
            var simulationDuration = duration;
            if (simulationDuration == null)
            {
                Debug.Assert(!(Duration == null && _direction == AnimationDirection.Forward));
                Debug.Assert(!(Duration == null && _direction == AnimationDirection.Reverse &&
                               ReverseDuration == null));

                var range = UpperBound - LowerBound;
                var remainingFraction =
                    double.IsFinite(range) ? Math.Abs(target - _value) / range : 1.0;
                var directionDuration =
                    _direction == AnimationDirection.Reverse && ReverseDuration != null
                        ? ReverseDuration.Value
                        : Duration!.Value;
                simulationDuration = (int)(directionDuration * remainingFraction);
            }
            else if (target == _value)
            {
                simulationDuration = 0; // Already at target, don't animate.
            }

            Stop();

            if (simulationDuration == 0)
            {
                if (_value != target)
                {
                    _value = Math.Clamp(target, LowerBound, UpperBound);
                    NotifyValueChanged();
                }

                _status = _direction == AnimationDirection.Forward
                    ? AnimationStatus.Completed
                    : AnimationStatus.Dismissed;
                CheckStatusChanged();
                return;
            }

            Debug.Assert(simulationDuration > 0);
            Debug.Assert(!IsAnimating);
            StartSimulation(new InterpolationSimulation(_value, target, simulationDuration.Value,
                curve, scale));
        }

        private void StartSimulation(Simulation simulation)
        {
            Debug.Assert(!IsAnimating);

            _simulation = simulation;
            LastElapsedDuration = 0.0;
            _value = Math.Clamp(simulation.X(0.0), LowerBound, UpperBound);
            _ticker!.Start();
            _status = _direction == AnimationDirection.Forward
                ? AnimationStatus.Forward
                : AnimationStatus.Reverse;
            CheckStatusChanged();
        }

        public void Forward(double? from = null)
        {
            if (Duration == null) throw new Exception("Duration not set");
            _direction = AnimationDirection.Forward;
            if (from != null)
                SetValue(from.Value);

            AnimateToInternal(UpperBound);
        }

        public void Reverse(double? from = null)
        {
            if (Duration == null && ReverseDuration == null)
                throw new Exception("Duration and ReverseDuration not set");
            _direction = AnimationDirection.Reverse;
            if (from != null)
                SetValue(from.Value);

            AnimateToInternal(LowerBound);
        }

        public void Reset() => SetValue(LowerBound);

        public void Dispose()
        {
            _ticker?.Stop(true);
            _ticker = null;
        }

        #region ====Events====

        public override event Action? ValueChanged;
        public override event Action<AnimationStatus>? StatusChanged;

        private void CheckStatusChanged()
        {
            var newStatus = _status;
            if (_lastReportedStatus == newStatus) return;

            _lastReportedStatus = newStatus;
            StatusChanged?.Invoke(newStatus);
        }

        private void NotifyValueChanged() => ValueChanged?.Invoke();

        #endregion
    }

    [SuppressMessage("ReSharper", "CompareOfFloatsByEqualityOperator")]
    internal sealed class InterpolationSimulation : Simulation
    {
        private readonly double _durationInSeconds;
        private readonly double _begin;
        private readonly double _end;
        private readonly Curve _curve;

        internal InterpolationSimulation(double begin, double end, double duration, Curve curve,
            double scale)
        {
            Debug.Assert(duration > 0);

            _begin = begin;
            _end = end;
            _curve = curve;

            _durationInSeconds = (duration * scale) / 1000;
        }

        public override double X(double timeInSeconds)
        {
            var t = Math.Clamp((timeInSeconds / _durationInSeconds), 0.0, 1.0);
            if (t == 0.0) return _begin;
            if (t == 1.0) return _end;
            return _begin + (_end - _begin) * _curve.Transform(t);
        }

        public override double Dx(double timeInSeconds)
        {
            var epsilon = Tolerance.Time;
            return (X(timeInSeconds + epsilon) - X(timeInSeconds - epsilon)) / (2 * epsilon);
        }

        public override bool IsDone(double timeInSeconds) => timeInSeconds > _durationInSeconds;
    }
}