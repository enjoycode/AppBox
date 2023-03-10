import * as PixUI from '@/PixUI'
import * as LiveCharts from '@/LiveCharts'

export class CircleGeometry extends LiveCharts.SizedGeometry {
    public constructor() {
        super();
        this.matchDimensions = true;
    }

    OnDraw(context: LiveCharts.SkiaDrawingContext, paint: PixUI.Paint) {
        let rx = this.Width / 2;
        context.Canvas.drawCircle(this.X + rx, this.Y + rx, rx, paint);
    }
}
