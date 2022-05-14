import * as PixUI from '@/PixUI'
import * as System from '@/System'

export class PaintDebugger {
    public static readonly EnableChanged = new System.Event();

    private static _enable: boolean = false;

    public static Switch() {
        PaintDebugger._enable = !PaintDebugger._enable;
        PaintDebugger.EnableChanged.Invoke();
    }

    public static PaintWidgetBorder(widget: PixUI.Widget, canvas: PixUI.Canvas) {
        if (!PaintDebugger._enable) return;

        let paint = PixUI.PaintUtils.Shared(PixUI.Colors.Random(125), CanvasKit.PaintStyle.Stroke, 2);
        canvas.drawRect(PixUI.Rect.FromLTWH(widget.X + 1, widget.Y + 1, widget.W - 2, widget.H - 2), paint);
    }
}
