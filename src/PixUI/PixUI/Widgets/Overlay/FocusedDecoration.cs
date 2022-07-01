using System;

namespace PixUI
{
    public sealed class FocusedDecoration
    {
        internal readonly Widget Widget;

        // Focus时的Border,用于动画结束
        private readonly Func<ShapeBorder> _focusedBorderBuilder;

        // 未Focus时的Border,用于动画开始
        private readonly Func<ShapeBorder?>? _unfocusedBorderBuilder;

        private OverlayEntry? _overlayEntry;

        public FocusedDecoration(Widget widget, Func<ShapeBorder> focusedBorderBuilder,
            Func<ShapeBorder?>? unfocusedBorderBuilder = null)
        {
            Widget = widget;
            _focusedBorderBuilder = focusedBorderBuilder;
            _unfocusedBorderBuilder = unfocusedBorderBuilder;
        }

        public void AttachFocusChangedEvent(Widget widget)
        {
            if (widget is IFocusable focusable)
                focusable.FocusNode.FocusChanged += _OnFocusChanged;
        }

        private void _OnFocusChanged(bool focused)
        {
            if (focused)
            {
                _overlayEntry ??= new OverlayEntry(new FocusedDecorator(this));
                Widget.Overlay?.Show(_overlayEntry);
            }
            else
            {
                ((FocusedDecorator)_overlayEntry!.Widget).Hide();
            }
        }

        internal ShapeBorder? GetUnfocusedBorder() => _unfocusedBorderBuilder?.Invoke();

        internal ShapeBorder GetFocusedBorder() => _focusedBorderBuilder();

        internal void StopAndReset()
        {
            if (_overlayEntry == null) return;

            ((FocusedDecorator)_overlayEntry!.Widget).Reset(); //will remove overlay
        }

        internal void RemoveOverlayEntry() => _overlayEntry?.Remove();
    }

    internal sealed class FocusedDecorator : Widget
    {
        private readonly FocusedDecoration _owner;
        private readonly ShapeBorder? _from;
        private readonly ShapeBorder _to;
        private readonly ShapeBorder? _tween;
        private AnimationController? _controller;

        internal FocusedDecorator(FocusedDecoration owner)
        {
            _owner = owner;
            _from = owner.GetUnfocusedBorder();
            _to = owner.GetFocusedBorder();
            if (_from != null)
                _tween = _from.Clone();
        }

        internal void Hide()
        {
            if (_from == null)
            {
                _owner.RemoveOverlayEntry();
                return;
            }

            _controller?.Reverse();
        }

        internal void Reset() => _controller?.Reset();

        protected internal override bool HitTest(float x, float y, HitTestResult result)
        {
            return false; // Can't hit
        }

        public override void Layout(float availableWidth, float availableHeight)
        {
            //do nothing
        }

        public override void Paint(Canvas canvas, IDirtyArea? area = null)
        {
            var widget = _owner.Widget;
            var pt2Win = widget.LocalToWindow(0, 0);
            var bounds = Rect.FromLTWH(pt2Win.X, pt2Win.Y, widget.W, widget.H);

            if (_from == null)
            {
                _to.Paint(canvas, bounds);
                return;
            }

            _tween!.Paint(canvas, bounds);
        }

        protected override void OnMounted()
        {
            if (_from == null) return;

            if (_controller == null)
            {
                _controller = new AnimationController(200);
                _controller.ValueChanged += OnAnimationValueChanged;
                _controller.StatusChanged += OnAnimationStateChanged;
            }

            _controller.Forward();
        }

        private void OnAnimationValueChanged()
        {
            _from!.LerpTo(_to, _tween!, _controller!.Value);
            Invalidate(InvalidAction.Repaint);
        }

        private void OnAnimationStateChanged(AnimationStatus status)
        {
            if (status == AnimationStatus.Dismissed)
            {
                _owner.RemoveOverlayEntry();
            }
        }

        public override void Dispose()
        {
            if (_controller != null)
            {
                _controller.ValueChanged -= OnAnimationValueChanged;
                _controller.StatusChanged -= OnAnimationStateChanged;
                _controller.Dispose();
            }

            base.Dispose();
        }
    }
}