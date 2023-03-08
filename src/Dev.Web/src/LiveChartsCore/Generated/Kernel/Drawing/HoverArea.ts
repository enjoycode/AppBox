import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class HoverArea {
    public abstract DistanceTo(point: LiveChartsCore.LvcPoint): number;

    public abstract IsPointerOver(pointerLocation: LiveChartsCore.LvcPoint, strategy: LiveChartsCore.TooltipFindingStrategy): boolean;

    public abstract SuggestTooltipPlacement(context: LiveChartsCore.TooltipPlacementContext): void;
}
