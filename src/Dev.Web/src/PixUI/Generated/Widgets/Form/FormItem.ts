import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class FormItem extends PixUI.Widget {
    public constructor(label: string, widget: PixUI.Widget, columnSpan: number = 1) {
        super();
        if (columnSpan < 1) throw new System.ArgumentException();

        this._widget = widget;
        this._widget.Parent = this;
        this._label = label;
        this.ColumnSpan = columnSpan;
    }

    private readonly _widget: PixUI.Widget;
    private readonly _label: string;

    public readonly ColumnSpan: number;
    //TODO: tooltip property to show some tips

    private _cachedLabelParagraph: Nullable<PixUI.Paragraph>;


    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        action(this._widget);
    }

    public Layout(availableWidth: number, availableHeight: number) {
        this.CachedAvailableWidth = availableWidth;
        this.CachedAvailableHeight = availableHeight;

        this._cachedLabelParagraph ??= PixUI.TextPainter.BuildParagraph(this._label, Number.POSITIVE_INFINITY, PixUI.Theme.DefaultFontSize, PixUI.Colors.Black, null, 1);

        let lableWidth = (<PixUI.Form><unknown>this.Parent!).LabelWidth + 5;
        this._widget.Layout(availableWidth - lableWidth, availableHeight);
        this._widget.SetPosition(lableWidth, 0);

        this.SetSize(availableWidth, Math.max(this._cachedLabelParagraph.getHeight(), this._widget.H));
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        //TODO: 考虑画边框

        let parent = <PixUI.Form><unknown>this.Parent!;
        let lableWidth = parent.LabelWidth;
        let alignment = parent.LabelAlignment;
        //先画Label
        let x = 0;
        if (alignment == PixUI.HorizontalAlignment.Center)
            x = (lableWidth - this._cachedLabelParagraph!.getMaxIntrinsicWidth()) / 2;
        else if (alignment == PixUI.HorizontalAlignment.Right)
            x = lableWidth - this._cachedLabelParagraph!.getMaxIntrinsicWidth();
        canvas.save(); //TODO:优化不必要的Save and Clip
        canvas.clipRect(PixUI.Rect.FromLTWH(0, 0, lableWidth, this.H), CanvasKit.ClipOp.Intersect, false);
        canvas.drawParagraph(this._cachedLabelParagraph!, x, (this.H - this._cachedLabelParagraph!.getHeight()) / 2);
        canvas.restore();

        //再画Widget
        this.PaintChildren(canvas, area);
    }

    public Init(props: Partial<FormItem>): FormItem {
        Object.assign(this, props);
        return this;
    }

}
