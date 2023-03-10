import * as LiveCharts from '@/LiveCharts'
import * as PixUI from '@/PixUI'
import * as System from '@/System'

export abstract class ImageFilter implements System.IDisposable {
    private static readonly $meta_System_IDisposable = true;
    public SKImageFilter: Nullable<PixUI.ImageFilter>;

    public abstract CreateFilter(drawingContext: LiveCharts.SkiaDrawingContext): void;

    public abstract Clone(): ImageFilter ;

    public Dispose() {
        if (this.SKImageFilter == null) return;
        this.SKImageFilter.delete();
        this.SKImageFilter = null;
    }
}
