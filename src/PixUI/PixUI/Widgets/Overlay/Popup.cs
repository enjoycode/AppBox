namespace PixUI
{
    public interface IPopup
    {
        public void Hide();
    }

    public abstract class Popup : Widget, IPopup, IEventHook
    {
        private readonly Overlay _overlay;
        private readonly OverlayEntry _overlayEntry;

        protected Popup(Overlay overlay)
        {
            _overlay = overlay;
            _overlayEntry = new OverlayEntry(this);
        }

        public void UpdatePosition(float x, float y) => _overlayEntry.UpdatePosition(x, y);

        public void Show(Widget? relativeTo = null,
            Offset? relativeOffset = null /*TODO:TransitionBuilder*/)
        {
            if (relativeTo != null)
            {
                //TODO: 暂只实现在下方显示，应该入参确定相对位置
                var winPt = relativeTo.LocalToWindow(0, 0);
                var offsetX = relativeOffset?.Dx ?? 0;
                var offsetY = relativeOffset?.Dy ?? 0;
                SetPosition(winPt.X + offsetX, winPt.Y + relativeTo.H + offsetY);
            }

            _overlay.Window.EventHookManager.Add(this);
            _overlay.Show(_overlayEntry);
        }

        public void Hide( /*TODO:TransitionBuilder*/)
        {
            _overlay.Window.EventHookManager.Remove(this);
            _overlay.Remove(_overlayEntry);
        }

        public virtual EventPreviewResult PreviewEvent(EventType type, object? e)
        {
            return EventPreviewResult.NotProcessed;
        }
    }
}