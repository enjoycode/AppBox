import * as PixUI from '@/PixUI'

export class RouteView extends PixUI.DynamicView {
    public constructor(navigator: PixUI.Navigator) {
        super();
        this.Navigator = navigator;
        this.Navigator.OnRouteChanged = this.OnRouteChanged.bind(this);
        //Child = Navigator.GetCurrentRoute();
    }

    public readonly Navigator: PixUI.Navigator;

    //OnNavigateIn, OnNavigateOut

    protected OnMounted() {
        super.OnMounted();

        // Set current Navigator's Parent & HistoryManager
        this.Navigator.Parent = this.CurrentNavigator;
        this.Navigator.HistoryManager = this.Root!.Window.RouteHistoryManager;
        // Set Child to first route widget
        if (this.Navigator.HistoryManager.IsEmpty) {
            //根路由或地址栏直接输入的路由 eg: http://aa.com/#/about
            this.Navigator.InitRouteWidget();
        } else {
            this.Navigator.InitRouteWidget(); //TODO:
        }
    }

    protected OnUnmounted() {
        super.OnUnmounted();

        this.Navigator.Parent = null;
        this.Navigator.HistoryManager = null;
    }

    private async OnRouteChanged(action: PixUI.RouteChangeAction, newEntry: PixUI.RouteHistoryEntry) {
        //TODO: stop running transition and check is 404.

        let widget = await newEntry.GetWidgetAsync();

        let route = newEntry.Route;

        if (action == PixUI.RouteChangeAction.Init || route.EnteringBuilder == null) {
            this.ReplaceTo(widget);
        } else {
            let from = this.Child!;
            from.SuspendingMount = true; //动画开始前挂起

            let to:
                PixUI.Widget;
            let reverse = action == PixUI.RouteChangeAction.Pop;
            if (reverse) {
                to = from;
                from = widget;
            } else {
                to = widget;
            }

            this.AnimateTo(from, to, route.Duration, reverse, route.EnteringBuilder, route.ExistingBuilder);
        }
    }
}
