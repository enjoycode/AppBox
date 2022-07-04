using System;

namespace PixUI
{
    public sealed class Caret
    {
        public Caret(Widget widget, Func<Color> colorBuilder, Func<Rect> boundsBuilder)
        {
            _widget = widget;
            ColorBuilder = colorBuilder;
            BoundsBuilder = boundsBuilder;
        }

        private readonly Widget _widget; //拥有caret的Widget
        internal readonly Func<Color> ColorBuilder;
        internal readonly Func<Rect> BoundsBuilder;
        private CaretDecorator? _decorator;

        public void Show()
        {
            _decorator = new CaretDecorator(this);
            _widget.Overlay?.Show(_decorator);
        }

        public void Hide()
        {
            if (_decorator == null) return;
            ((Overlay)_decorator.Parent!).Remove(_decorator);
            _decorator = null;
        }

        public void NotifyPositionChanged() => _decorator?.Invalidate(InvalidAction.Repaint);
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