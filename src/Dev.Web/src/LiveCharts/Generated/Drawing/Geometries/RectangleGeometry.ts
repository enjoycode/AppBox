import * as PixUI from '@/PixUI'
import * as LiveCharts from '@/LiveCharts'

export class RectangleGeometry extends LiveCharts.SizedGeometry {
    public constructor() {
        super();
    }

    OnDraw(context: LiveCharts.SkiaDrawingContext, paint: PixUI.Paint) {
        context.Canvas.drawRect(PixUI.Rect.FromLTWH(this.X, this.Y, this.Width, this.Height), paint);
    }
}
