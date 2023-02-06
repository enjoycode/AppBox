import * as PixUI from '@/PixUI'
import * as System from '@/System'

export enum RouteChangeAction {
    Init,
    Push,
    GotoBack,
    GotoForward
}

/// <summary>
/// 路由导航器，与RouteView一对一绑定控制其导航
/// </summary>
export class Navigator {
    public constructor(routes: System.IEnumerable<PixUI.Route>) {
        this._routes.AddRange(routes);
    }

    private readonly _routes: System.List<PixUI.Route> = new System.List<PixUI.Route>();
    public HistoryManager: Nullable<PixUI.RouteHistoryManager>;

    public OnRouteChanged: Nullable<System.Action1<RouteChangeAction>>;

    #Parent: Nullable<Navigator>;
    public get Parent() {
        return this.#Parent;
    }

    private set Parent(value) {
        this.#Parent = value;
    }

    #Children: Nullable<System.List<Navigator>>;
    public get Children() {
        return this.#Children;
    }

    private set Children(value) {
        this.#Children = value;
    }

    #NameOfRouteView: Nullable<string>;
    public get NameOfRouteView() {
        return this.#NameOfRouteView;
    }

    private set NameOfRouteView(value) {
        this.#NameOfRouteView = value;
    }

    #ActiveRoute: PixUI.Route;
    public get ActiveRoute() {
        return this.#ActiveRoute;
    }

    private set ActiveRoute(value) {
        this.#ActiveRoute = value;
    }

    #ActiveArgument: Nullable<string>;
    public get ActiveArgument() {
        return this.#ActiveArgument;
    }

    private set ActiveArgument(value) {
        this.#ActiveArgument = value;
    }


    public get IsNamed(): boolean {
        return this.NameOfRouteView != null;
    }

    public get IsInNamed(): boolean {
        return this.GetNamedParent() != null;
    }

    public GetNamedParent(): Nullable<Navigator> {
        let parent = this.Parent;
        while (parent != null) {
            if (parent.IsNamed) return parent;
            parent = parent.Parent;
        }

        return null;
    }


    private get NameAndArgument(): string {
        if (!this.ActiveRoute.Dynamic)
            return this.ActiveRoute.Name;
        return this.ActiveRoute.Name + "/" + this.ActiveArgument; //TODO:未指定参数转换为空
    }

    public get ParentPath(): string {
        if (this.Parent == null)
            return ""; //Only for RootNavigate
        if (this.Parent.IsNamed)
            return this.Parent.NameAndArgument + "/";
        if (this.Parent.Parent == null)
            return "/";
        return this.Parent.ParentPath + this.Parent.NameAndArgument + "/";
    }

    public get Path(): string {
        return this.ParentPath + this.NameAndArgument;
    }


    public AttachChild(child: Navigator, nameOfRouteView: Nullable<string>) {
        //TODO: 检查有效性，比如只允许一个默认路由，不能重名的命名路由
        child.NameOfRouteView = nameOfRouteView;
        child.Parent = this;
        this.Children ??= new System.List<Navigator>();
        this.Children.Add(child);
    }

    public DetachChild(child: Navigator) {
        child.Parent = null;
        this.Children?.Remove(child);
    }

    public GetDefaultRoute(): PixUI.Route {
        return this._routes[0];
    }

    public IsDynamic(name: string): boolean {
        let matchRoute = this._routes.Find(r => r.Name == name);
        if (matchRoute == null) return false;
        return matchRoute.Dynamic;
    }


    public InitRouteWidget() {
        if (this._routes.length == 0) return; //TODO: 404

        //默认指向第一个
        this.ActiveRoute = this._routes[0];
        //处理指定的路由路径
        let asnPath = this.HistoryManager!.AssignedPath;
        if (!System.IsNullOrEmpty(asnPath)) {
            if (this.IsNamed) {
                //TODO: 当前是命名的, eg: /一级路由?命名的路由=当前路由
            } else if (this.IsInNamed) {
                // TODO: 当前是命名的下级, eg: /一级路由?命名的路由=路由1/当前路由
            } else {
                let parentPath = this.ParentPath;
                //排除 eg: asnPath=/一级路由 但当前路径=/一级路由/当前路由
                if (asnPath.length > parentPath.length) {
                    let thisPath = asnPath.substring(asnPath.indexOf(parentPath) + 1);
                    let pss = thisPath.split(String.fromCharCode(47));
                    let matchRoute = this._routes.Find(r => r.Name == pss[0]);
                    if (matchRoute == null) //TODO: 404
                        throw new System.Exception("Can't find route: " + pss[0]);
                    this.ActiveRoute = matchRoute;
                    if (this.ActiveRoute.Dynamic && pss.length > 1)
                        this.ActiveArgument = pss[1];
                }
            }
        }


        this.OnRouteChanged?.call(this, RouteChangeAction.Init);
    }

    public Push(name: string, arg: Nullable<string> = null) {
        name = name.toLowerCase();
        if (arg != null) arg = arg.toLowerCase();
        //判断当前路由一致（包括动态参数）,是则忽略
        if (name == this.ActiveRoute.Name && arg == this.ActiveArgument)
            return;

        //查找静态路由表
        let matchRoute = this._routes.Find(r => r.Name == name);
        if (matchRoute == null) //TODO: 404 not found route
            throw new System.ArgumentException(`Can't find route: ${name}`);
        this.ActiveRoute = matchRoute;
        this.ActiveArgument = arg;

        //添加至历史记录
        let fullPath = this.HistoryManager!.GetFullPath();
        this.HistoryManager.AssignedPath = fullPath;
        let entry = new PixUI.RouteHistoryEntry(fullPath);
        this.HistoryManager!.PushEntry(entry);
        //同步浏览器历史记录
        Navigator.PushWebHistory(fullPath, this.HistoryManager.Count - 1);

        //通知变更
        this.OnRouteChanged?.call(this, RouteChangeAction.Push);
    }

    public Pop() {
        this.HistoryManager!.Pop();
    }

    public Goto(name: string, arg: Nullable<string>, action: RouteChangeAction) {
        let matchRoute = this._routes.Find(r => r.Name == name);
        if (matchRoute == null)
            throw new System.Exception("Can't find route: " + name);
        this.ActiveRoute = matchRoute;
        this.ActiveArgument = arg;

        this.OnRouteChanged?.call(this, action);
    }

    private static PushWebHistory(path: string, index: number) {
        let url = document.location.origin + '/#' + path;
        history.pushState(index, '', url);
    }

    public static ReplaceWebHistory(path: string, index: number) {
        let url = document.location.origin;
        if (path != '/')
            url += '/#' + path;
        history.replaceState(index, '', url);
    }
}
