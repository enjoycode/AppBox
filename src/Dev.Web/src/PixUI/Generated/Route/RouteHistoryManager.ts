import * as PixUI from '@/PixUI'
import * as System from '@/System'
/// <summary>
/// 路由历史项
/// </summary>
export class RouteHistoryEntry {
    public constructor(path: string) {
        this.Path = path;
    }

    public readonly Path: string;
    //TODO: cache of keepalive widget, think about use Map<PathString, Widget>
}

export class BuildPathContext {
    public constructor() {
        this.LeafNamed = new System.StringMap<PixUI.Navigator>([]);
    }

    public LeafDefault: PixUI.Navigator;
    public readonly LeafNamed: System.StringMap<PixUI.Navigator>;

    public GetFullPath(): string {
        let fullPath = this.LeafDefault.Path;
        if (this.LeafNamed.size > 0) {
            fullPath += "?";
            let first = true;
            for (const key of this.LeafNamed.keys()) {
                if (first) first = false;
                else fullPath += "&";

                fullPath += key + "=" + this.LeafNamed.get(key)!.Path;
            }
        }

        return fullPath;
    }
}

/// <summary>
/// 路由历史管理，一个UIWindow对应一个实例
/// </summary>
export class RouteHistoryManager {
    private readonly _history: System.List<RouteHistoryEntry> = new System.List<RouteHistoryEntry>();
    private _historyIndex: number = -1;

    public readonly RootNavigator: PixUI.Navigator = new PixUI.Navigator([]);

    public AssignedPath: Nullable<string>;

    public get Count(): number {
        return this._history.length;
    }

    /// <summary>
    /// 获取当前路由的全路径
    /// </summary>
    public GetFullPath(): string {
        if (this.RootNavigator.Children == null || this.RootNavigator.Children.length == 0)
            return "";

        let ctx = new BuildPathContext();
        RouteHistoryManager.BuildFullPath(ctx, this.RootNavigator);
        return ctx.GetFullPath();
    }

    private static BuildFullPath(ctx: BuildPathContext, navigator: PixUI.Navigator) {
        if (navigator.IsNamed) {
            ctx.LeafNamed.set(navigator.NameOfRouteView!, navigator);
        } else if (navigator.IsInNamed) {
            let named = navigator.GetNamedParent()!;
            ctx.LeafNamed.set(named.NameOfRouteView!, navigator);
        } else {
            ctx.LeafDefault = navigator;
        }

        if (navigator.Children != null) {
            for (const child of navigator.Children) {
                RouteHistoryManager.BuildFullPath(ctx, child);
            }
        }
    }

    public PushEntry(entry: RouteHistoryEntry) {
        //先清空之后的记录
        if (this._historyIndex != this._history.length - 1) {
            //TODO: dispose will removed widgets
            this._history.RemoveRange(this._historyIndex + 1, this._history.length - this._historyIndex - 1);
        }

        this._history.Add(entry);
        this._historyIndex++;
    }

    public Pop(): Nullable<RouteHistoryEntry> {
        if (this._historyIndex <= 0) return null;

        let oldEntry = this._history[this._historyIndex];
        this.Goto(this._historyIndex - 1);
        return oldEntry;
    }

    public Goto(index: number) {
        if (index < 0 || index >= this._history.length)
            throw new System.Exception("index out of range");

        let action = index < this._historyIndex ? PixUI.RouteChangeAction.GotoBack : PixUI.RouteChangeAction.GotoForward;
        this._historyIndex = index;
        let newEntry = this._history[this._historyIndex];
        this.AssignedPath = newEntry.Path;

        this.NavigateTo(newEntry.Path, action);
    }

    public Push(fullPath: string) {
        //TODO: 验证fullPath start with '/' and convert to lowercase
        this.AssignedPath = fullPath;
        let newEntry = new RouteHistoryEntry(fullPath); //TODO:考虑已存在则改为Goto
        this.PushEntry(newEntry);

        this.NavigateTo(fullPath, PixUI.RouteChangeAction.Push);
    }

    private NavigateTo(fullPath: string, action: PixUI.RouteChangeAction) {
        //从根开始比较
        let psa = fullPath.split(String.fromCharCode(63));
        let defaultPath = psa[0];
        let defaultPss = defaultPath.split(String.fromCharCode(47));

        //先比较处理默认路径
        let navigator = RouteHistoryManager.GetDefaultNavigator(this.RootNavigator);
        this.ComparePath(navigator, defaultPss, 1, action);
        //TODO: 再处理各命名路由的路径
    }

    private ComparePath(navigator: Nullable<PixUI.Navigator>, pss: string[], index: number, action: PixUI.RouteChangeAction): boolean {
        if (navigator == null) return false;

        let name = pss[index];
        if (name == "")
            name = navigator.GetDefaultRoute().Name;
        let arg: Nullable<string> = null;
        if (navigator.IsDynamic(name)) {
            arg = pss[index + 1];
            index++;
        }

        if (name != navigator.ActiveRoute.Name || arg != navigator.ActiveArgument) {
            navigator.Goto(name, arg, action);
            return true;
        }

        if (index == pss.length - 1)
            return false;
        return this.ComparePath(RouteHistoryManager.GetDefaultNavigator(navigator), pss, index + 1, action);
    }

    /// <summary>
    /// 获取默认路由（惟一的非命名的）
    /// </summary>
    private static GetDefaultNavigator(navigator: PixUI.Navigator): Nullable<PixUI.Navigator> {
        if (navigator.Children == null || navigator.Children.length == 0)
            return null;

        for (let i = 0; i < navigator.Children.length; i++) {
            if (!navigator.Children[i].IsNamed)
                return navigator.Children[i];
        }

        return null;
    }
}
