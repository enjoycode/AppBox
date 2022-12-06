namespace PixUI
{
    public sealed class RouteView : DynamicView
    {
        public RouteView(Navigator navigator)
        {
            Navigator = navigator;
            Navigator.OnRouteChanged = OnRouteChanged;
            //Child = Navigator.GetCurrentRoute();
        }

        internal readonly Navigator Navigator;

        //OnNavigateIn, OnNavigateOut

        protected override void OnMounted()
        {
            base.OnMounted();
            
            // Set current Navigator's Parent & HistoryManager
            Navigator.Parent = CurrentNavigator;
            Navigator.HistoryManager = Root!.Window.RouteHistoryManager;
            // Set Child to first route widget
            if (Navigator.HistoryManager.IsEmpty)
            {
                //根路由或地址栏直接输入的路由 eg: http://aa.com/#/about
                Navigator.InitRouteWidget();
            }
            else
            {
                
            }
        }

        protected override void OnUnmounted()
        {
            base.OnUnmounted();

            Navigator.Parent = null;
            Navigator.HistoryManager = null;
        }

        private void OnRouteChanged(RouteChangeAction action, Route route)
        {
            //TODO: stop running transition and check is 404.

            var widget = Navigator.HistoryManager!.GetCurrentWidget();

            if (action == RouteChangeAction.Init || route.EnteringBuilder == null)
            {
                ReplaceTo(widget);
            }
            else
            {
                var from = Child!;
                from.SuspendingMount = true; //动画开始前挂起

                Widget to;
                var reverse = action == RouteChangeAction.Pop;
                if (reverse)
                {
                    to = from;
                    from = widget;
                }
                else
                {
                    to = widget;
                }

                AnimateTo(from, to, route.Duration, reverse, route.EnteringBuilder, route.ExistingBuilder);
            }
        }
    }
}