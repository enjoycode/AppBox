import * as PixUI from '@/PixUI'
import * as System from '@/System'

export enum RouteChangeAction {
    Init,
    Push,
    Pop, //TODO: remove, same as Goto
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

    private _parent: Navigator | null;
    private _children: Nullable<System.List<Navigator>>;
    private _name: string | null;
    private _activeRoute: PixUI.Route;
    private _activeArgument: string | null;

    public get ActiveRoute(): PixUI.Route {
        return this._activeRoute;
    }

    public get ActiveArgument(): string | null {
        return this._activeArgument;
    }
    
    public get NamedName(): string | null {
        return this._name;
    }

    public get Parent(): Navigator | null {
        return this._parent;
    }
    
    public get Children(): System.List<Navigator> | null {
        return this._children;
    }
    
    private get NameAndArgument() : string {
        if (this._activeRoute.Dynamic) {
            //TODO: 如果未指定参数
            return this._activeRoute.Name + '/' + this._activeArgument;
        } else {
            return this._activeRoute.Name
        }
    }
    
    public get Path(): string {
        if (this._parent == null) return '/'; //Only for Root
        return this.ParentPath + this.NameAndArgument;
    }

    public get ParentPath(): string {
        if (this._parent == null)
            return ''; //Only for RootNavigator
        if (this._parent.IsNamed)
            return this._parent.NameAndArgument + '/';
        if (this._parent._parent == null)
            return '/';

        return this._parent.ParentPath + this._parent.NameAndArgument + '/';
    }

    public get IsNamed(): boolean {
        return this._name != null;
    }

    public get IsInNamed(): boolean {
        return this.GetNamedParent() != null;
    }

    public HistoryManager: Nullable<PixUI.RouteHistoryManager>;

    public OnRouteChanged: Nullable<System.Action1<RouteChangeAction>>;
    
    public GetNamedParent(): PixUI.Navigator | null {
        let parent = this._parent;
        while (parent != null) {
            if (parent.IsNamed) return parent;
            parent = parent._parent;
        }
        return null;
    }
    
    public GetDefaultRoute(): PixUI.Route {
        return this._routes[0];
    }
    
    public IsDynamic(name: string) : boolean {
        let matchRoute = this._routes.Find(r => r.Name == name);
        if (matchRoute == null)
            throw new System.ArgumentException(`Can't find route: ${name}`);
        return matchRoute.Dynamic;
    }

    public AttachChild(child: Navigator, name: string | null) {
        //TODO: 检查有效性
        child._name = name;
        child._parent = this;
        this._children ??= new System.List<Navigator>();
        this._children.Add(child);
    }

    public DetachChild(child: Navigator) {
        child._parent = null;
        this._children?.Remove(child);
    }

    public InitRouteWidget() {
        if (this._routes.length == 0) return; //TODO: show 404

        //默认第一个
        this._activeRoute = this._routes[0];
        //获取Url指定的路由
        let asnPath = this.HistoryManager.AssignedPath;
        if (asnPath) {
            if (this.IsNamed) {
                // TODO: 当前是命名的, eg: /一级路由?命名的路由=当前路由
            } else if (this.IsInNamed) {
                // TODO: 当前是命名的下级, eg: /一级路由?命名的路由=路由1/当前路由
            } else {
                let parentPath = this.ParentPath;
                //排除 eg: asnPath=/一级路由 但当前路径=/一级路由/当前路由
                if (asnPath.length > parentPath.length) {
                    let thisPath = asnPath.substring(asnPath.indexOf(parentPath) + 1);
                    let pss = thisPath.split('/');
                    let matchRoute = this._routes.Find(r => r.Name == pss[0]);
                    if (matchRoute == null) //TODO: 404 not found route
                        throw new System.ArgumentException(`Can't find route: ${pss[0]}`);
                    this._activeRoute = matchRoute;
                    if (this._activeRoute.Dynamic && pss.length > 1) {
                        this._activeArgument = pss[1];
                    }
                }
            }
        }

        this.OnRouteChanged?.call(this, RouteChangeAction.Init);
    }

    public PushNamed(name: string) {
        //TODO:判断当前路由一致（包括动态参数）,是则忽略
        if (name == this._activeRoute.Name) return;

        //查找静态路由表
        let matchRoute = this._routes.Find(r => r.Name == name);
        if (matchRoute == null) //TODO: 404 not found route
            throw new System.ArgumentException(`Can't find route: ${name}`);
        this._activeRoute = matchRoute;

        //添加至历史记录
        let fullPath = this.HistoryManager.GetFullPath();
        this.HistoryManager.AssignedPath = fullPath;
        let entry = new PixUI.RouteHistoryEntry(fullPath);
        this.HistoryManager!.Push(entry);
        //同步添加至的浏览器的历史记录
        let url = document.location.origin + '/#' + fullPath;
        history.pushState(this.HistoryManager.Count - 1, name, url);

        //通知变更
        this.OnRouteChanged?.call(this, RouteChangeAction.Push);
    }
    
    public Goto(name: string) {
        //查找静态路由表
        let matchRoute = this._routes.Find(r => r.Name == name);
        if (matchRoute == null) //TODO: 404 not found route
            throw new System.ArgumentException(`Can't find route: ${name}`);
        this._activeRoute = matchRoute;

        //通知变更
        this.OnRouteChanged?.call(this, RouteChangeAction.Goto);
    }

    
}
