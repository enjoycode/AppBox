import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class DataGridGroupColumn<T> extends PixUI.DataGridColumn<T> {
    public constructor(label: string, children: PixUI.DataGridColumn<T>[]) {
        super(label);
        this.Children = children;
    }

    public readonly Children: System.IList<PixUI.DataGridColumn<T>>;

    public get LayoutWidth(): number {
        return this.Children.Sum(c => c.LayoutWidth);
    }

    public Init(props: Partial<DataGridGroupColumn<T>>): DataGridGroupColumn<T> {
        Object.assign(this, props);
        return this;
    }
}
