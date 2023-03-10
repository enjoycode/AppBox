import * as PixUI from '@/PixUI'

export class DataGridGroupColumn<T> extends PixUI.DataGridColumn<T> {
    public constructor(label: string, children: PixUI.DataGridColumn<T>[]) {
        super(label);
        this.Children = children;
    }

    public readonly Children: PixUI.DataGridColumn<T>[];

    get LayoutWidth(): number {
        return this.Children.Sum(c => c.LayoutWidth);
    }
}
