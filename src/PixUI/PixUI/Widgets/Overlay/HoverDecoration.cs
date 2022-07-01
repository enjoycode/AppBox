using System;

namespace PixUI
{
    [TSNoInitializer]
    public sealed class HoverDecoration
    {
        public HoverDecoration(Widget widget, Func<ShapeBorder> shapeBuilder,
            Func<Rect>? boundsGetter = null, float elevation = 4,
            Color? hoverColor = null)
        {
            Widget = widget;
            ShapeBuilder = shapeBuilder;
            BoundsGetter = boundsGetter;
            Elevation = elevation;
            HoverColor = hoverColor;
        }

        internal readonly Widget Widget;
        internal readonly Func<ShapeBorder> ShapeBuilder;
        internal readonly Func<Rect>? BoundsGetter;
        internal readonly float Elevation;

        internal readonly Color? HoverColor;

        private OverlayEntry? _overlayEntry;

        public void Show()
        {
            _overlayEntry ??= new OverlayEntry(new HoverDecorator(this));
            Widget.Overlay?.Show(_overlayEntry);
        }

        public void Hide() => _overlayEntry?.Remove();

        public void AttachHoverChangedEvent(IMouseRegion widget) =>
            widget.MouseRegion.HoverChanged += _OnHoverChanged;

        private void _OnHoverChanged(bool hover)
        {
            if (hover)
                Show();
            else
                Hide();
        }
    }

    internal sealed class HoverDecorator : Widget
    {
        private readonly HoverDecoration _owner;
        private readonly ShapeBorder _shape;

        internal HoverDecorator(HoverDecoration owner)
        {
            _owner = owner;
            _shape = owner.ShapeBuilder();
        }

        protected internal override bool HitTest(float x, float y, HitTestResult result)
        {
            return false; //Can't hit
        }

        public override void Layout(float availableWidth, float availableHeight)
        {
            //do nothing
        }

        public override void Paint(Canvas canvas, IDirtyArea? area = null)
        {
            Rect bounds;
            if (_owner.BoundsGetter == null)
            {
                var widget = _owner.Widget;
                var pt2Win = widget.LocalToWindow(0, 0);
                bounds = Rect.FromLTWH(pt2Win.X, pt2Win.Y, widget.W, widget.H);
            }
            else
            {
                bounds = _owner.BoundsGetter();
            }

            using var path = _shape.GetOuterPath(bounds);

            // draw shadow
            if (_owner.Elevation > 0)
            {
                canvas.Save();
                canvas.ClipPath(path, ClipOp.Difference, false);
                canvas.DrawShadow(path, Colors.Black, _owner.Elevation, false,
                    Root!.Window.ScaleFactor);
                canvas.Restore();
            }

            // draw hover color
            if (_owner.HoverColor != null)
            {
                canvas.Save();
                canvas.ClipPath(path, ClipOp.Intersect, false);
                var paint = PaintUtils.Shared(_owner.HoverColor.Value);
                // paint.BlendMode = _owner.BlendMode;
                canvas.DrawPath(path, paint);
                canvas.Restore();
            }
        }
    }
}