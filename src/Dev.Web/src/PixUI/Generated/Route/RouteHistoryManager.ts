import * as System from '@/System'
import * as PixUI from '@/PixUI'
/// <summary>
/// 路由历史项
/// </summary>
export class RouteHistoryEntry {
    public constructor(route: PixUI.Route, settings: PixUI.RouteSettings) {
        this.Route = route;
        this._settings = settings;
    }

    private readonly _settings: PixUI.RouteSettings;
    private _widget: Nullable<PixUI.Widget>;

    public readonly Route: PixUI.Route;

    public GetWidgetAsync(): Promise<PixUI.Widget> {
        return this.Route.Builder(this._settings);
    }
}

/// <summary>
/// 路由历史管理，一个UIWindow对应一个实例
/// </summary>
export class RouteHistoryManager {
    private readonly _history: System.List<RouteHistoryEntry> = new System.List<RouteHistoryEntry>();
    private _historyIndex: number = -1;

    public get IsEmpty(): boolean {
        return this._history.length == 0;
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
        this._historyIndex--;
        return oldEntry;
    }
}
