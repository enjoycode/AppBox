import * as PixUI from '@/PixUI'

export class PaintUtils {
    private static _shared: Nullable<PixUI.Paint>; //Do not create instance, web has not init CanvasKit

    public static Shared(color: Nullable<PixUI.Color> = null, style: PixUI.PaintStyle = CanvasKit.PaintStyle.Fill, strokeWidth: number = 1): PixUI.Paint {
        PaintUtils._shared ??= new CanvasKit.Paint();
        PaintUtils._shared.setStyle(style);
        PaintUtils._shared.setColor(color ?? PixUI.Colors.Black);
        PaintUtils._shared.setStrokeWidth(strokeWidth);
        PaintUtils._shared.setStrokeCap(CanvasKit.StrokeCap.Butt);
        PaintUtils._shared.setStrokeJoin(CanvasKit.StrokeJoin.Miter);
        PaintUtils._shared.setMaskFilter(null);
        PaintUtils._shared.setAntiAlias(false);
        //TODO: set other properties to default value
        return PaintUtils._shared;
    }
}
