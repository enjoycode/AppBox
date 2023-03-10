import * as PixUI from '@/PixUI'
import * as LiveCharts from '@/LiveCharts'

export class OvalGeometry extends LiveCharts.SizedGeometry {
    public constructor() {
        super();
    }

    OnDraw(context: LiveCharts.SkiaDrawingContext, paint: PixUI.Paint) {
        let rx = this.Width / 2;
        let ry = this.Height / 2;
        context.Canvas.drawOval(new PixUI.Rect(this.X + rx, this.Y + ry, rx, ry), paint);
    }
}
