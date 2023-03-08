import * as LiveChartsCore from '@/LiveChartsCore'

export interface IDrawable<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IAnimatable {
    Draw(context: TDrawingContext): void;
}
