using System;
using System.Collections.Generic;

namespace PixUI
{
    public sealed class Overlay : Widget, IRootWidget
    {
        internal Overlay(UIWindow window)
        {
            Window = window;
            IsMounted = true;
        }

        public UIWindow Window { get; }
        private readonly List<OverlayEntry> _entries = new List<OverlayEntry>();
        internal bool HasEntry => _entries.Count > 0;

        public OverlayEntry? FindEntry(Predicate<OverlayEntry> predicate)
        {
            foreach (var entry in _entries)
            {
                if (predicate(entry)) return entry;
            }

            return null;
        }

        #region ====Show & Hide====

        public void Show(OverlayEntry entry)
        {
            if (_entries.Contains(entry)) return;

            _entries.Add(entry);
            entry.Owner = this;
            entry.Widget.Parent = this;
            entry.Widget.Layout(Window.Width, Window.Height);

            Invalidate(InvalidAction.Repaint);
        }

        public void ShowBelow(OverlayEntry entry, OverlayEntry below)
        {
            throw new NotImplementedException();
        }

        public void ShowAbove(OverlayEntry entry, OverlayEntry above)
        {
            throw new NotImplementedException();
        }

        public void Remove(OverlayEntry entry)
        {
            if (!_entries.Remove(entry)) return;

            entry.Widget.Parent = null;

            Invalidate(InvalidAction.Repaint);
        }

        #endregion

        #region ====Overrides====

        protected internal override bool HitTest(float x, float y, HitTestResult result)
        {
            foreach (var entry in _entries)
            {
                if (HitTestChild(entry.Widget, x, y, result))
                    break;
            }

            return result.IsHitAnyMouseRegion;
        }

        public override void Layout(float availableWidth, float availableHeight)
        {
            foreach (var entry in _entries)
            {
                entry.Widget.Layout(availableWidth, availableHeight);
            }
        }

        public override void Paint(Canvas canvas, IDirtyArea? area = null)
        {
            foreach (var entry in _entries)
            {
                // if (entry.Widget.W <= 0 || entry.Widget.H <= 0)
                //     continue;

                var needTranslate = entry.Widget.X != 0 || entry.Widget.Y != 0;
                if (needTranslate)
                    canvas.Translate(entry.Widget.X, entry.Widget.Y);
                entry.Widget.Paint(canvas, area);
                if (needTranslate)
                    canvas.Translate(-entry.Widget.X, -entry.Widget.Y);
            }
        }

        #endregion
    }
}