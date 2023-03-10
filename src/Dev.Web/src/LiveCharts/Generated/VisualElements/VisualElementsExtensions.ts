import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class VisualElementsExtensions {
    public static AsDrawnControl(sketch: LiveChartsCore.Sketch<LiveCharts.SkiaDrawingContext>, baseZIndex: number = 10050): LiveChartsCore.RelativePanel<LiveCharts.SkiaDrawingContext> {
        let relativePanel = new LiveChartsCore.RelativePanel<LiveCharts.SkiaDrawingContext>().Init(
            {
                Size: new LiveChartsCore.LvcSize(<number><unknown>sketch.Width, <number><unknown>sketch.Height)
            });

        for (const schedule of sketch.PaintSchedules) {
            for (const g of schedule.Geometries) {
                let sizedGeometry = <LiveChartsCore.ISizedGeometry<LiveCharts.SkiaDrawingContext>><unknown>g;
                let vgv = new LiveCharts.VariableGeometryVisual(sizedGeometry).Init(
                    {
                        Width: sizedGeometry.Width,
                        Height: sizedGeometry.Height,
                    });

                schedule.PaintTask.ZIndex = schedule.PaintTask.ZIndex + 1 + baseZIndex;

                if (schedule.PaintTask.IsFill) vgv.Fill = schedule.PaintTask;
                if (schedule.PaintTask.IsStroke) vgv.Stroke = schedule.PaintTask;
                relativePanel.Children.Add(vgv);
            }
        }

        return relativePanel;
    }
}
