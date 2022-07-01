namespace PixUI
{
    public sealed class RouteView : DynamicView
    {
        public Navigator Navigator { get; }

        //OnNavigateIn, OnNavigateOut

        public RouteView(Navigator navigator)
        {
            Navigator = navigator;
            Navigator.OnRouteChanged = OnRouteChanged;
            Child = Navigator.GetCurrentRoute();
        }

        private void OnRouteChanged(RouteChangeAction action, Route route)
        {
            //TODO: stop running transition.

            if (route.EnteringBuilder == null)
            {
                ReplaceTo(Navigator.GetCurrentRoute());
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
                    from = Navigator.GetCurrentRoute();
                }
                else
                {
                    to = Navigator.GetCurrentRoute();
                }

                AnimateTo(from, to, route.Duration, reverse, route.EnteringBuilder,
                    route.ExistingBuilder);
            }
        }
    }
}