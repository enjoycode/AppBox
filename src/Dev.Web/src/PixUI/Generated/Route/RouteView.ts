import * as PixUI from '@/PixUI'

export class RouteView extends PixUI.DynamicView {
    public constructor(navigator: PixUI.Navigator, name: Nullable<string> = null) {
        super();
        this.Name = name;
        this.Navigator = navigator;
        this.Navigator.OnRouteChanged = this.OnRouteChanged.bind(this);
        //Child = Navigator.GetCurrentRoute();
    }

    public readonly Navigator: PixUI.Navigator;
    public readonly Name: Nullable<string>;

    //OnNavigateIn, OnNavigateOut

    OnMounted() {
        super.OnMounted();

        let historyManager = this.Root!.Window.RouteHistoryManager;
        //尝试向HistoryManager添加第一条记录
        if (historyManager.Count == 0) {
            let path = historyManager.AssignedPath ?? "/";
            let entry = new PixUI.RouteHistoryEntry(path);
            historyManager.PushEntry(entry);
            PixUI.Navigator.ReplaceWebHistory(path, 0);
        }

        // set Navigator's tree & HistoryManager
        this.Navigator.HistoryManager = historyManager;
        let parentNavigator = this.Parent?.CurrentNavigator ?? historyManager.RootNavigator;
        parentNavigator.AttachChild(this.Navigator, this.Name);
        // init child widget to match route
        this.Navigator.InitRouteWidget();
    }

    OnUnmounted() {
        super.OnUnmounted();

        //detach from parent navigator
        let parentNavigator = this.Navigator.Parent!;
        parentNavigator.DetachChild(this.Navigator);
        this.Navigator.HistoryManager = null;
    }

    private async OnRouteChanged(action: PixUI.RouteChangeAction) {
        //TODO: stop running transition and check is 404.
        //TODO: if action is Goto, and route is keepalive, try get widget instance from cache
        let route = this.Navigator.ActiveRoute;
        let widget = await route.BuildWidgetAsync(this.Navigator.ActiveArgument);

        if (action == PixUI.RouteChangeAction.Init || route.EnteringBuilder == null) {
            this.ReplaceTo(widget);
        } else {
            let from = this.Child!;
            from.SuspendingMount = true; //动画开始前挂起

            let to: PixUI.Widget;
            let reverse = action == PixUI.RouteChangeAction.GotoBack;
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
