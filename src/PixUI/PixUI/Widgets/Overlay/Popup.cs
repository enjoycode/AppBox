namespace PixUI
{
    public abstract class Popup : Widget, IEventHook
    {
        protected Popup(Overlay overlay)
        {
            _overlay = overlay;
        }
        
        private readonly Overlay _overlay;

        public void UpdatePosition(float x, float y)
        {
            SetPosition(x, y);
            Invalidate(InvalidAction.Repaint);
        }

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
            _overlay.Show(this);
        }

        public void Hide( /*TODO:TransitionBuilder*/)
        {
            _overlay.Window.EventHookManager.Remove(this);
            _overlay.Remove(this);
        }

        public virtual EventPreviewResult PreviewEvent(EventType type, object? e)
        {
            return EventPreviewResult.NotProcessed;
        }
    }
}