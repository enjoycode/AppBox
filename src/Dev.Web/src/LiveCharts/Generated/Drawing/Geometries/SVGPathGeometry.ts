import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as LiveCharts from '@/LiveCharts'

export class SVGPathGeometry extends LiveCharts.SizedGeometry {
    private _svg: string = '';
    public _svgPath: Nullable<PixUI.Path>;

    // /// <summary>
    // /// Initializes a new instance of the <see cref="SVGPathGeometry"/> class.
    // /// </summary>
    // public SVGPathGeometry() : base()
    // { }

    public constructor(svgPath: PixUI.Path) {
        super();
        this._svgPath = svgPath;
    }

    public get SVG(): string {
        return this._svg;
    }

    public set SVG(value: string) {
        this._svg = value;
        this.OnSVGPropertyChanged();
    }

    public FitToSize: boolean = false;

    OnDraw(context: LiveCharts.SkiaDrawingContext, paint: PixUI.Paint) {
        if (this._svgPath == null)
            throw new System.Exception(`${"SVG"} property is null and there is not a defined path to draw.`);

        context.Canvas.save();

        let canvas = context.Canvas;
        let bounds = PixUI.Rect.FromFloat32Array(this._svgPath.getBounds());

        if (this.FitToSize) {
            // fit to both axis
            canvas.translate(this.X + this.Width / 2, this.Y + this.Height / 2);
            canvas.scale(
                this.Width / (bounds.Width + paint.getStrokeWidth()),
                this.Height / (bounds.Height + paint.getStrokeWidth()));
            canvas.translate(-bounds.MidX, -bounds.MidY);
        } else {
            // fit to the max dimension
            // preserve the corresponding scale in the min axis.
            let maxB = bounds.Width < bounds.Height ? bounds.Height : bounds.Width;

            canvas.translate(this.X + this.Width / 2, this.Y + this.Height / 2);
            canvas.scale(
                this.Width / (maxB + paint.getStrokeWidth()),
                this.Height / (maxB + paint.getStrokeWidth()));
            canvas.translate(-bounds.MidX, -bounds.MidY);
        }

        canvas.drawPath(this._svgPath, paint);

        context.Canvas.restore();
    }

    private OnSVGPropertyChanged() {
        throw new System.NotImplementedException();
    }
}
