import * as PixUI from '@/PixUI'
import * as System from '@/System'

export enum RouteChangeAction {
    Init,
    Push,
    Pop
}

/// <summary>
/// 路由导航器，与RouteView一对一绑定控制其导航
/// </summary>
export class Navigator {
    public constructor(routes: System.IEnumerable<PixUI.Route>) {
        this._routes.AddRange(routes);
    }

    private readonly _routes: System.List<PixUI.Route> = new System.List<PixUI.Route>();
    #Parent: Nullable<Navigator>;
    public get Parent() {
        return this.#Parent;
    }

    public set Parent(value) {
        this.#Parent = value;
    }

    public HistoryManager: Nullable<PixUI.RouteHistoryManager>;

    public OnRouteChanged: Nullable<System.Action2<RouteChangeAction, PixUI.RouteHistoryEntry>>;

    public InitRouteWidget() {
        if (this._routes.length == 0) return;

        //TODO:获取Url指定的路由

        let entry = new PixUI.RouteHistoryEntry(this._routes[0], PixUI.RouteSettings.Empty);
        this.HistoryManager!.Push(entry);
        this.OnRouteChanged?.call(this, RouteChangeAction.Init, entry);
    }

    public PushNamed(name: string) {
        //TODO:判断当前路由一致（包括动态参数）,是则忽略

        //查找静态路由表
        let matchRoute = this._routes.Find(r => r.Name == name);
        if (matchRoute == null) //TODO: 404 not found route
            throw new System.ArgumentException(`Can't find route: ${name}`);

        //添加至历史记录
        let entry = new PixUI.RouteHistoryEntry(matchRoute, PixUI.RouteSettings.Empty);
        this.HistoryManager!.Push(entry);

        //通知变更
        this.OnRouteChanged?.call(this, RouteChangeAction.Push, entry);
    }

    public Pop() {
        let old = this.HistoryManager!.Pop();
        if (old != null)
            this.OnRouteChanged?.call(this, RouteChangeAction.Pop, old);
    }
}
