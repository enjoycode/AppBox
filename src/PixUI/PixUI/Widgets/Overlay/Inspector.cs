using System.Collections.Generic;

namespace PixUI
{
    public sealed class Inspector : Widget
    {
        private Inspector() { }

        private Widget _target = null!;

        #region ====Show & Remove Method====

        public static Inspector? Show(Widget target)
        {
            if (!target.IsMounted) return null;

            var overlay = target.Overlay!;
            var inspector = overlay.FindEntry(w => w is Inspector);
            if (inspector == null)
            {
                var instance = new Inspector();
                instance._target = target;
                overlay.Show(instance);
                return instance;
            }
            else
            {
                var instance = (Inspector)inspector;
                instance._target = target;
                instance.Invalidate(InvalidAction.Repaint);
                return instance;
            }
        }

        public void Remove()
        {
            ((Overlay)Parent!).Remove(this);
        }

        #endregion

        #region ====Widget Overrides====

        protected internal override bool HitTest(float x, float y, HitTestResult result)
        {
            return false; //Can't hit now
        }

        public override void Layout(float availableWidth, float availableHeight)
        {
            //do nothing
        }

        public override void Paint(Canvas canvas, IDirtyArea? area = null)
        {
            var path = new List<Widget>();
            var temp = _target;
            while (temp.Parent != null)
            {
                path.Add(temp.Parent);
                temp = temp.Parent;
            }

            canvas.Save();
            for (var i = path.Count - 1; i >= 0; i--) //TODO:考虑跳过根节点
            {
                temp = path[i];
                canvas.Translate(temp.X, temp.Y);
                if (temp is IScrollable scrollable)
                    canvas.Translate(-scrollable.ScrollOffsetX, -scrollable.ScrollOffsetY);
                else if (temp is Transform transform)
                    canvas.Concat(transform.EffectiveTransform); //TODO:考虑画未变换前的边框
            }

            var bounds = Rect.FromLTWH(_target.X + 0.5f, _target.Y + 0.5f, _target.W - 1f,
                _target.H - 1f);
            var borderColor = new Color(0x807F7EBE);
            var fillColor = new Color(0x80BDBDFC);
            canvas.DrawRect(bounds, PaintUtils.Shared(fillColor));
            canvas.DrawRect(bounds, PaintUtils.Shared(borderColor, PaintStyle.Stroke));
            canvas.Restore();
        }

        #endregion
    }
}