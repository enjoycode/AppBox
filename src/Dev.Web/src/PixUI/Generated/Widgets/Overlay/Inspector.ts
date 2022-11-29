import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Inspector extends PixUI.Widget {
    private constructor() {
        super();
    }

    private _target: PixUI.Widget;


    public static Show(target: PixUI.Widget): Nullable<Inspector> {
        if (!target.IsMounted) return null;

        let overlay = target.Overlay!;
        let inspector = overlay.FindEntry(w => w instanceof Inspector);
        if (inspector == null) {
            let instance = new Inspector();
            instance._target = target;
            overlay.Show(instance);
            return instance;
        } else {
            let instance = <Inspector><unknown>inspector;
            instance._target = target;
            instance.Invalidate(PixUI.InvalidAction.Repaint);
            return instance;
        }
    }

    public Remove() {
        (<PixUI.Overlay><unknown>this.Parent!).Remove(this);
    }


    public HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        return false; //Can't hit now
    }

    public Layout(availableWidth: number, availableHeight: number) {
        //do nothing
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        let path = new System.List<PixUI.Widget>();
        let temp = this._target;
        while (temp.Parent != null) {
            path.Add(temp.Parent);
            temp = temp.Parent;
        }

        canvas.save();
        for (let i = path.length - 1; i >= 0; i--) //TODO:考虑跳过根节点
        {
            temp = path[i];
            canvas.translate(temp.X, temp.Y);
            if (PixUI.IsInterfaceOfIScrollable(temp)) {
                const scrollable = temp;
                canvas.translate(-scrollable.ScrollOffsetX, -scrollable.ScrollOffsetY);
            } else if (temp instanceof PixUI.Transform) {
                const transform = temp;
                canvas.concat(transform.EffectiveTransform.TransponseTo()); //TODO:考虑画未变换前的边框
            }
        }

        //draw bounds border
        let bounds = PixUI.Rect.FromLTWH(this._target.X + 0.5, this._target.Y + 0.5, this._target.W - 1,
            this._target.H - 1);
        let borderColor = new PixUI.Color(0x807F7EBE);
        let fillColor = new PixUI.Color(0x80BDBDFC);
        canvas.drawRect(bounds, PixUI.PaintUtils.Shared(fillColor));
        canvas.drawRect(bounds, PixUI.PaintUtils.Shared(borderColor, CanvasKit.PaintStyle.Stroke));

        //draw bounds text
        // var text = $"X: {_target.X} Y: {_target.Y} W: {_target.W} H: {_target.H}";
        // using var ph = TextPainter.BuildParagraph(text, float.PositiveInfinity, 12, Colors.Red);
        // canvas.DrawParagraph(ph, bounds.Left + 1, bounds.Top + 1);
        canvas.restore();
    }

}
