import * as PixUI from '@/PixUI'

export class ButtonGroup extends PixUI.MultiChildWidget<PixUI.Button> {
    public constructor() {
        super();
    }


    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        let xPos = 0;
        let buttonHeight: PixUI.State<number> = PixUI.State.op_Implicit_From(Math.min(height, PixUI.Button.DefaultHeight)); //暂强制同高
        for (let i = 0; i < this._children.length; i++) {
            this._children[i].Height = buttonHeight;
            this._children[i].Shape = PixUI.ButtonShape.Square;
            this._children[i].Layout(Math.max(0, width - xPos), buttonHeight.Value);
            this._children[i].SetPosition(xPos, 0);

            xPos += this._children[i].W;
        }

        this.SetSize(xPos, buttonHeight.Value);
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        //clip to round rectangle
        let rrect = PixUI.RRect.FromRectAndRadius(PixUI.Rect.FromLTWH(0, 0, this.W, this.H),
            PixUI.Button.StandardRadius, PixUI.Button.StandardRadius);
        let path = new CanvasKit.Path();
        path.addRRect(rrect);
        canvas.save();
        canvas.clipPath(path, CanvasKit.ClipOp.Intersect, true);

        super.Paint(canvas, area);

        //画分隔条
        let paint = PixUI.PaintUtils.Shared(PixUI.Colors.White, CanvasKit.PaintStyle.Stroke, 1);
        for (let i = 1; i < this._children.length; i++) {
            let x = this._children[i].X - 0.5;
            canvas.drawLine(x, 0, x, this.H, paint);
        }

        canvas.restore();
        path.delete();
    }

}
