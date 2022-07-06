using System;

namespace PixUI
{
    /// <summary>
    /// 用于动态视图切换动画
    /// </summary>
    internal sealed class TransitionStack : Widget
    {
        private readonly Widget _from;
        private readonly Widget _to;

        internal TransitionStack(Widget from, Widget to)
        {
            _from = from;
            _from.Parent = this;
            _to = to;
            _to.Parent = this;
        }

        public override void VisitChildren(Func<Widget, bool> action)
        {
            if (!IsMounted) return;
            if (action(_from)) return;
            action(_to);
        }

        public override void Layout(float availableWidth, float availableHeight)
        {
            CachedAvailableWidth = availableWidth;
            CachedAvailableHeight = availableHeight;
            SetSize(availableWidth, availableHeight);

            _from.Layout(W, H);
            _from.SetPosition(0, 0);
            _to.Layout(W, H);
            _to.SetPosition(0, 0);
        }

        protected internal override void OnChildSizeChanged(Widget child, float dx, float dy,
            AffectsByRelayout affects)
        {
            //do nothing
        }

        public override void Paint(Canvas canvas, IDirtyArea? area = null)
        {
            _from.Paint(canvas, area);
            _to.Paint(canvas, area);
        }
    }
}