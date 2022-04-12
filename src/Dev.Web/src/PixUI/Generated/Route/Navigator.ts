import * as System from '@/System'
import * as PixUI from '@/PixUI'

export enum RouteChangeAction {
    Push,
    Pop
}

/// <summary>
/// 路由历史项
/// </summary>
export class RouteEntry {
    private readonly _settings: PixUI.RouteSettings;
    private _widget: Nullable<PixUI.Widget>;

    #Route: PixUI.Route;
    public get Route() {
        return this.#Route;
    }

    private set Route(value) {
        this.#Route = value;
    }

    public constructor(route: PixUI.Route, settings: PixUI.RouteSettings) {
        this.Route = route;
        this._settings = settings;
    }

    public GetWidget(): PixUI.Widget {
        if (this._widget != null) return this._widget;

        this._widget = this.Route.Builder(this._settings);
        return this._widget;
    }

    public Init(props: Partial<RouteEntry>): RouteEntry {
        Object.assign(this, props);
        return this;
    }
}

/// <summary>
/// 路由导航器，与RouteView一对一绑定控制其导航
/// </summary>
export class Navigator {
    private readonly _routes: System.List<PixUI.Route> = new System.List<PixUI.Route>();
    private readonly _history: System.List<RouteEntry> = new System.List<RouteEntry>();
    private _histroyIndex: number = -1;

    public OnRouteChanged: Nullable<System.Action<RouteChangeAction, PixUI.Route>>;

    public constructor(routes: System.IList<PixUI.Route>) {
        this._routes.AddRange(routes);
    }

    public GetCurrentRoute(): PixUI.Widget {
        if (this._routes.length == 0)
            return new PixUI.Text(PixUI.State.op_Implicit_From("Empty routes"));

        if (this._history.length != 0) return this._history[this._histroyIndex].GetWidget();

        //初始化
        let entry = new RouteEntry(this._routes[0], PixUI.RouteSettings.Empty);
        this._history.Add(entry);
        this._histroyIndex = 0;
        return entry.GetWidget();
    }

    public PushNamed(name: string) {
        //TODO:判断当前路由一致（包括动态参数）,是则忽略

        //先清空之后的记录
        if (this._histroyIndex != this._history.length - 1) {
            //TODO: dispose will removed widgets
            this._history.RemoveRange(this._histroyIndex + 1, this._history.length - this._histroyIndex - 1);
        }

        //查找静态路由表
        let matchRoute = this._routes.Find(r => r.Name == name);
        if (matchRoute == null)
            throw new System.ArgumentException(`Can't find route: ${name}`);

        //添加至历史记录
        let entry = new RouteEntry(matchRoute, new PixUI.RouteSettings());
        this._history.Add(entry);
        this._histroyIndex++;

        //通知变更
        // @ts-ignore
        this.OnRouteChanged?.call(this, RouteChangeAction.Push, matchRoute);
    }

    public Pop() {
        if (this._histroyIndex <= 0) return;

        let oldEntry = this._history[this._histroyIndex];
        this._histroyIndex--;

        // @ts-ignore
        this.OnRouteChanged?.call(this, RouteChangeAction.Pop, oldEntry.Route);
    }
}
