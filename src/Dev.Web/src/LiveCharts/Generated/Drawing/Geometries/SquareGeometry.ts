import * as PixUI from '@/PixUI'
import * as LiveCharts from '@/LiveCharts'

export class SquareGeometry extends LiveCharts.SizedGeometry {
    public constructor() {
        super();
        this.matchDimensions = true;
    }

    OnDraw(context: LiveCharts.SkiaDrawingContext, paint: PixUI.Paint) {
        context.Canvas.drawRect(PixUI.Rect.FromLTWH(this.X, this.Y, this.Width, this.Height), paint);
    }
}
