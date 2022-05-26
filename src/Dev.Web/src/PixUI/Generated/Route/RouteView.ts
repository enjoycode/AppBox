import * as PixUI from '@/PixUI'

export class RouteView extends PixUI.DynamicView {
    #Navigator: PixUI.Navigator;
    public get Navigator() {
        return this.#Navigator;
    }

    private set Navigator(value) {
        this.#Navigator = value;
    }

    //OnNavigateIn, OnNavigateOut

    public constructor(navigator: PixUI.Navigator) {
        super();
        this.Navigator = navigator;
        this.Navigator.OnRouteChanged = this.OnRouteChanged.bind(this);
        this.Child = this.Navigator.GetCurrentRoute();
    }

    private OnRouteChanged(action: PixUI.RouteChangeAction, route: PixUI.Route) {
        //TODO: stop running transition.

        if (route.EnteringBuilder == null) {
            this.ReplaceTo(this.Navigator.GetCurrentRoute());
        } else {
            let from = this.Child!;
            from.SuspendingMount = true; //动画开始前挂起

            let to:
                PixUI.Widget;
            let reverse = action == PixUI.RouteChangeAction.Pop;
            if (reverse) {
                to = from;
                from = this.Navigator.GetCurrentRoute();
            } else {
                to = this.Navigator.GetCurrentRoute();
            }

            this.AnimateTo(from, to, route.Duration, reverse, route.EnteringBuilder, route.ExistingBuilder);
        }
    }

    public Init(props: Partial<RouteView>): RouteView {
        Object.assign(this, props);
        return this;
    }
}
