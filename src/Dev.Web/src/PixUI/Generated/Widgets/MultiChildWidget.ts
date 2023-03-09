import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class MultiChildWidget<T extends PixUI.Widget> extends PixUI.Widget {
    protected constructor() {
        super();
        this._children = new PixUI.WidgetList<T>(this);
    }

    // ReSharper disable once InconsistentNaming
    protected readonly _children: PixUI.WidgetList<T>;

    public set Children(value: T[]) {
        this._children.Clear();
        for (const child of value) {
            this._children.Add(child);
        }
    }

    public GetChildAt(index: number): PixUI.Widget {
        return this._children[index];
    }

    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        for (const child of this._children) {
            if (action(child))
                break; //stop visit
        }
    }

    public IndexOfChild(child: PixUI.Widget): number {
        return this._children.IndexOf(<T><unknown>child);
    }
}
