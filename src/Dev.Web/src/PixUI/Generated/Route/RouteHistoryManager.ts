import * as System from '@/System'
import * as PixUI from '@/PixUI'
/// <summary>
/// 路由历史项
/// </summary>
export class RouteHistoryEntry {
    public constructor(path: string) {
        this.Path = path;
    }

    private _keepAliveWidgets: Nullable<Map<string, PixUI.Widget>>;

    public readonly Path: string;
}

export class BuildPathContext {
    public constructor() {
        this.LeafNamed = new Map<string, PixUI.Navigator>();
    }

    public LeafDefault: PixUI.Navigator;
    public readonly LeafNamed: Map<string, PixUI.Navigator>;
    
    public GetFullPath(): string {
        let fullPath = this.LeafDefault.Path;
        if (this.LeafNamed.size > 0) {
            fullPath += '?';
            let first = true;
            for (const key of this.LeafNamed.keys()) {
                if (!first) fullPath += '&';
                else first = false;
                
                fullPath += key + '=' + this.LeafNamed[key].Path;
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
    private _assignedPath: string | null; //地址栏指定的路由

    public readonly RootNavigator: PixUI.Navigator;
    
    public constructor() {
        this.RootNavigator = new PixUI.Navigator([]);
    }

    public get AssignedPath(): string | null {
        return this._assignedPath;
    }
    public set AssignedPath(value) {
        this._assignedPath = value;
    }

    public get Count(): number {
        return this._history.length;
    }

    // 获取当前路由的全路径
    public GetFullPath(): string {
        if (this.RootNavigator == null) return '';

        let ctx = new BuildPathContext();
        RouteHistoryManager.BuildFullPath(ctx, this.RootNavigator);
        return ctx.GetFullPath();
    }
    
    private static BuildFullPath(ctx: BuildPathContext, navigator: PixUI.Navigator) {
        if (navigator.IsNamed) {
            ctx.LeafNamed.set(navigator.NamedName, navigator);
        } else if (navigator.IsInNamed) {
            let named = navigator.GetNamedParent();
            ctx.LeafNamed[named.NamedName] = navigator;
        } else {
            ctx.LeafDefault = navigator;
        }
        
        if (navigator.Children != null) {
            for (const child of navigator.Children) {
                this.BuildFullPath(ctx, child);
            }
        }
    }

    public Push(entry: RouteHistoryEntry) {
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

    public PushPath(fullPath: string) {
        this._assignedPath = fullPath;
        let newEntry = new PixUI.RouteHistoryEntry(fullPath); //TODO:是否考虑已存在改为Goto已存在的
        this.Push(newEntry);
        
        this.NavigateTo(fullPath);
    }
    
    public Goto(index: number) {
        if (index < 0 || index >= this._history.length)
            throw new System.ArgumentOutOfRangeException();

        this._historyIndex = index;
        let newEntry = this._history[this._historyIndex];
        this._assignedPath = newEntry.Path;
        
        this.NavigateTo(newEntry.Path);
    }
    
    private static GetDefaultNavigator(navigator: PixUI.Navigator): PixUI.Navigator | null {
        if (navigator.Children == null || navigator.Children.length == 0)
            return null;

        for (let i = 0; i < navigator.Children.length; i++) {
            if (!navigator.Children[i].IsNamed)
                return navigator.Children[i];
        }
        
        return null;
    }
    
    private NavigateTo(fullPath: string) {
        //从根开始比较
        let psa = fullPath.split('?');
        let defaultPath = psa[0];
        let defaultPss = defaultPath.split('/');

        //先比较处理默认路径
        let navigator = RouteHistoryManager.GetDefaultNavigator(this.RootNavigator);
        let changed = this.ComparePath(navigator, defaultPss, 1);

        //TODO:再处理各命名的路由的路径
    }
    
    private ComparePath(navigator: PixUI.Navigator, pss: string[], index: number): boolean {
        let name = pss[index];
        if (name == "")
            name = navigator.GetDefaultRoute().Name;
        let arg: string | null = null;
        if (navigator.IsDynamic(name)) {
            arg = pss[index + 1];
            index++;
        }
        
        if (name != navigator.ActiveRoute.Name || arg != navigator.ActiveArgument) {
            navigator.Goto(name); //TODO: change action type
            return true;
        } else {
            if(index == pss.length - 1) 
                return false;
            return this.ComparePath(RouteHistoryManager.GetDefaultNavigator(navigator), pss, index + 1);
        }
    }
}
