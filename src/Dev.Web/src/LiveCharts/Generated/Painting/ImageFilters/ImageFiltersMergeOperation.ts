import * as System from '@/System'
import * as LiveCharts from '@/LiveCharts'

export class ImageFiltersMergeOperation extends LiveCharts.ImageFilter {
    private readonly _filters: LiveCharts.ImageFilter[];

    // private readonly SKImageFilter.CropRect? _cropRect = null;

    public constructor(imageFilters: LiveCharts.ImageFilter[]) {
        super();
        this._filters = imageFilters;
        // _cropRect = cropRect;
    }

    Clone(): LiveCharts.ImageFilter {
        return new ImageFiltersMergeOperation(this._filters);
    }

    CreateFilter(drawingContext: LiveCharts.SkiaDrawingContext) {
        throw new System.NotImplementedException();
        // var imageFilters = new SKImageFilter[_filters.Length];
        // var i = 0;
        //
        // foreach (var item in _filters)
        // {
        //     item.CreateFilter(drawingContext);
        //     if (item.SKImageFilter is null) throw new System.Exception("Image filter is not valid");
        //     imageFilters[i++] = item.SKImageFilter;
        // }
        //
        // SKImageFilter = SKImageFilter.CreateMerge(imageFilters, _cropRect);
    }

    Dispose() {
        for (const item of this._filters) {
            item.Dispose();
        }
    }
}
