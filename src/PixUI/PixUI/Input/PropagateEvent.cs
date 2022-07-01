namespace PixUI
{
    public abstract class PropagateEvent
    {
        public bool IsHandled { get; private set; } = false;

        public void StopPropagate() => IsHandled = true;

        public void ResetHandled() => IsHandled = false;
    }
}