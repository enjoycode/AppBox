import * as LiveChartsCore from '@/LiveChartsCore'

export class StrokeAndFillDrawable<TDrawingContext extends LiveChartsCore.DrawingContext> {
    public constructor(stroke: Nullable<LiveChartsCore.IPaint<TDrawingContext>>, fill: Nullable<LiveChartsCore.IPaint<TDrawingContext>>, isHoverState: boolean = false) {
        this.Stroke = stroke;
        if (stroke != null) {
            stroke.IsStroke = true;
            stroke.IsFill = false;
        }

        this.Fill = fill;
        if (fill != null) {
            fill.IsStroke = false;
            fill.IsFill = true;
            fill.StrokeThickness = 0;
        }
        this.IsHoverState = isHoverState;
    }

    #Stroke: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    public get Stroke() {
        return this.#Stroke;
    }

    private set Stroke(value) {
        this.#Stroke = value;
    }

    #Fill: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    public get Fill() {
        return this.#Fill;
    }

    private set Fill(value) {
        this.#Fill = value;
    }

    public IsHoverState: boolean = false;
}
