using System;

namespace PixUI
{
    public sealed class OverlayEntry
    {
        public OverlayEntry(Widget widget)
        {
            Widget = widget;
        }

        internal readonly Widget Widget;

        internal Overlay? Owner; //显示时缓存，防止动画关闭后找不到实例

        //TODO: property for can handle input events

        public void Invalidate() => Owner?.Invalidate(InvalidAction.Repaint);

        /// <summary>
        /// 手动更新相对于窗体的位置坐标并重绘
        /// </summary>
        public void UpdatePosition(float x, float y)
        {
            Widget.SetPosition(x, y);
            if (Widget.IsMounted)
                Invalidate();
        }

        public void Remove() => Owner?.Remove(this);
    }
}