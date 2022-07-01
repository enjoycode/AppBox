using System;

namespace PixUI
{
    public sealed class Caret
    {
        private readonly Widget _widget;
        internal readonly Func<Color> ColorBuilder;
        internal readonly Func<Rect> BoundsBuilder;

        private OverlayEntry? _overlayEntry;

        public Caret(Widget widget, Func<Color> colorBuilder, Func<Rect> boundsBuilder)
        {
            _widget = widget;
            ColorBuilder = colorBuilder;
            BoundsBuilder = boundsBuilder;
        }

        public void Show()
        {
            _overlayEntry ??= new OverlayEntry(new CaretDecorator(this));
            _widget.Overlay?.Show(_overlayEntry);
        }

        public void Hide() => _overlayEntry?.Remove();

        public void NotifyPositionChanged() => _overlayEntry?.Invalidate();
    }

    internal sealed class CaretDecorator : Widget
    {
        private readonly Caret _owner;

        public CaretDecorator(Caret owner)
        {
            _owner = owner;
        }

        public override void Layout(float availableWidth, float availableHeight)
        {
            //do nothing
        }

        public override void Paint(Canvas canvas, IDirtyArea? area = null)
        {
            var paint = PaintUtils.Shared(_owner.ColorBuilder(), PaintStyle.Fill);
            var bounds = _owner.BoundsBuilder();
            canvas.DrawRect(Rect.FromLTWH(bounds.Left, bounds.Top, bounds.Width, bounds.Height),
                paint);
        }

        protected override void OnMounted()
        {
            //TODO: start animation
        }

        protected override void OnUnmounted()
        {
            //TODO: stop animation
        }
    }
}