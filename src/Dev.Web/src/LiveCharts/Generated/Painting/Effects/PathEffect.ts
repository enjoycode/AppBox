import * as LiveCharts from '@/LiveCharts'
import * as PixUI from '@/PixUI'
import * as System from '@/System'

export abstract class PathEffect implements System.IDisposable {
    private static readonly $meta_System_IDisposable = true;
    public SKPathEffect: Nullable<PixUI.PathEffect>;

    public abstract Clone(): PathEffect ;

    public abstract CreateEffect(drawingContext: LiveCharts.SkiaDrawingContext): void;

    public Dispose() {
        if (this.SKPathEffect == null) return;
        this.SKPathEffect.delete();
        this.SKPathEffect = null;
    }
}
