import * as PixUI from '@/PixUI'
import * as System from '@/System'

export enum RouteChangeAction {
    Init,
    Push,
    Pop,
    Goto
}

/// <summary>
/// 路由导航器，与RouteView一对一绑定控制其导航
/// </summary>
export class Navigator {
    public constructor(routes: System.IEnumerable<PixUI.Route>) {
        this._routes.AddRange(routes);
    }

    private readonly _routes: System.List<PixUI.Route> = new System.List<PixUI.Route>();
    
    private _activeEntry: PixUI.RouteHistoryEntry;
    
    public get Path(): string {
        if (this.#Parent == null) return '/' + this._activeEntry.Route.Name;
        return this.#Parent.Path + '/' + this._activeEntry.Route.Name;
    }
    
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

        let entry = new PixUI.RouteHistoryEntry(this, this._routes[0], PixUI.RouteSettings.Empty);
        this.HistoryManager!.Push(entry);
        this._activeEntry = entry;
        
        let url = document.location.origin + '/#' + this.Path;
        if (this.HistoryManager.Count == 0)
            history.replaceState(0, entry.Route.Name, url);
        else
            history.pushState(this.HistoryManager.Count - 1, entry.Route.Name, url);
        
        this.OnRouteChanged?.call(this, RouteChangeAction.Init, entry);
    }

    public PushNamed(name: string) {
        //TODO:判断当前路由一致（包括动态参数）,是则忽略

        //查找静态路由表
        let matchRoute = this._routes.Find(r => r.Name == name);
        if (matchRoute == null) //TODO: 404 not found route
            throw new System.ArgumentException(`Can't find route: ${name}`);

        //添加至历史记录
        let entry = new PixUI.RouteHistoryEntry(this, matchRoute, PixUI.RouteSettings.Empty);
        this.HistoryManager!.Push(entry);
        this._activeEntry = entry;
        
        let url = document.location.origin + '/#' + this.Path;
        history.pushState(this.HistoryManager.Count - 1, name, url);

        //通知变更
        this.OnRouteChanged?.call(this, RouteChangeAction.Push, entry);
    }

    public Pop() {
        let old = this.HistoryManager!.Pop();
        if (old != null)
            this.OnRouteChanged?.call(this, RouteChangeAction.Pop, old);
    }
    
    public Goto(entry: PixUI.RouteHistoryEntry) {
        this._activeEntry = entry;
        this.OnRouteChanged?.call(this, RouteChangeAction.Goto, entry);
    }
}
