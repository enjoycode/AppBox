namespace PixUI
{
    /// <summary>
    /// 每个窗体的根节点
    /// </summary>
    public sealed class Root : SingleChildWidget, IRootWidget
    {
        public UIWindow Window { get; }

        internal Root(UIWindow window, Widget child)
        {
            Window = window;
            // set IsMounted flag before set child
            IsMounted = true;
            Child = child;
        }

        public override void Layout(float availableWidth, float availableHeight)
        {
            CachedAvailableWidth = availableWidth;
            CachedAvailableHeight = availableHeight;
            SetPosition(0, 0);
            SetSize(availableWidth, availableHeight);
            Child!.Layout(W, H);
        }

        protected internal override void OnChildSizeChanged(Widget child, float dx, float dy,
            AffectsByRelayout affects)
        {
            //do nothing
        }
    }
}