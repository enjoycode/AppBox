import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Form extends PixUI.MultiChildWidget<PixUI.FormItem> {
    public constructor() {
        super();
    }

    private _columns: number = 1;
    private _labelAlignment: PixUI.HorizontalAlignment = PixUI.HorizontalAlignment.Right;
    private _labelWidth: number = 120;
    private _padding: PixUI.EdgeInsets = PixUI.EdgeInsets.All(5);
    private _horizontalSpacing: number = 5;
    private _verticalSpacing: number = 5;

    public get Columns(): number {
        return this._columns;
    }

    public set Columns(value: number) {
        if (this._columns == value) return;
        this._columns = value;
        if (this.IsMounted) this.Invalidate(PixUI.InvalidAction.Relayout);
    }

    public get Padding(): PixUI.EdgeInsets {
        return this._padding;
    }

    public set Padding(value: PixUI.EdgeInsets) {
        if (System.OpEquality(this._padding, value)) return;
        this._padding = value;
        if (this.IsMounted) this.Invalidate(PixUI.InvalidAction.Relayout);
    }

    public get LabelAlignment(): PixUI.HorizontalAlignment {
        return this._labelAlignment;
    }

    public set LabelAlignment(value: PixUI.HorizontalAlignment) {
        if (this._labelAlignment == value) return;
        this._labelAlignment = value;
        if (this.IsMounted) this.Invalidate(PixUI.InvalidAction.Relayout);
    }

    public get LabelWidth(): number {
        return this._labelWidth;
    }

    public set LabelWidth(value: number) {
        if (this._labelWidth == value) return;
        this._labelWidth = value;
        if (this.IsMounted) this.Invalidate(PixUI.InvalidAction.Relayout);
    }


    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        //单列可用宽度
        let columnWidth = (width - (this._columns - 1) * this._horizontalSpacing
            - this._padding.Left - this._padding.Right) / this._columns;

        let y = this._padding.Top;
        let colIndex = 0;
        let rowHeight = 0; //同一行中的最高的那个子组件
        for (let i = 0; i < this._children.length; i++) {
            let leftHeight = height - y;
            if (leftHeight <= 0) break;

            let child = this._children[i];
            let span = Math.min(child.ColumnSpan, this._columns - colIndex);
            child.Layout(columnWidth * span + (span - 1) * this._horizontalSpacing, leftHeight);
            child.SetPosition(
                this._padding.Left + colIndex * this._horizontalSpacing + colIndex * columnWidth, y);
            rowHeight = Math.max(rowHeight, child.H);

            colIndex += span;
            if (colIndex == this._columns) {
                y += this._verticalSpacing + rowHeight;
                colIndex = 0;
                rowHeight = 0;
            } else if (i == this._children.length - 1) {
                //eg:  | 1 | 2 |
                //     | 3 | 没有了
                y += rowHeight;
            }
        }

        this.SetSize(width, Math.min(y + this._padding.Bottom, height));
    }

    public Init(props: Partial<Form>): Form {
        Object.assign(this, props);
        return this;
    }

}
