import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class RouteView extends PixUI.DynamicView {
    private readonly _navigator: PixUI.Navigator;

    //OnNavigateIn, OnNavigateOut

    public constructor(navigator: PixUI.Navigator) {
        super();
        this._navigator = navigator;
        this._navigator.OnRouteChanged = this.OnRouteChanged.bind(this);
        this.Child = this._navigator.GetCurrentRoute();
    }

    private OnRouteChanged(action: PixUI.RouteChangeAction, route: PixUI.Route) {
        //TODO: stop running transition.

        let from = this.Child!;
        this.Child = null;

        if (route.EnteringBuilder == null) {
            this.ReplaceTo(this._navigator.GetCurrentRoute());
        } else {
            let to: PixUI.Widget;
            let reverse = action == PixUI.RouteChangeAction.Pop;
            if (reverse) {
                to = from;
                from = this._navigator.GetCurrentRoute();
            } else {
                to = this._navigator.GetCurrentRoute();
            }

            this.AnimateTo(from, to, route.Duration, reverse, route.EnteringBuilder, route.ExistingBuilder);
        }
    }

    public Init(props: Partial<RouteView>): RouteView {
        Object.assign(this, props);
        return this;
    }
}
