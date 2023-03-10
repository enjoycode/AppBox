import * as PixUI from '@/PixUI'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class PathCommand extends LiveChartsCore.Animatable implements LiveChartsCore.IPathCommand<PixUI.Path> {
    public Id: number = 0;

    public abstract Execute(path: PixUI.Path, currentTime: bigint, pathGeometry: LiveChartsCore.Animatable): void;
}
