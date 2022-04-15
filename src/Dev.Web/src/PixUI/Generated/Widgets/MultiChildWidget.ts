import * as System from '@/System'
import * as PixUI from '@/PixUI'
/// <summary>
/// 具有多个子级的Widget
/// </summary>
export abstract class MultiChildWidget extends PixUI.Widget {
    protected constructor() {
        super();
        this._children = new PixUI.WidgetList(this);
    }

    // ReSharper disable once InconsistentNaming
    protected readonly _children: PixUI.WidgetList;

    public set Children(value: PixUI.Widget[]) {
        this._children.Clear();
        for (const child of value) {
            this._children.Add(child);
        }
    }

    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        for (const child of this._children) {
            if (action(child))
                break; //stop visit
        }
    }

    public IndexOfChild(child: PixUI.Widget): number {
        return this._children.IndexOf(child);
    }
}
