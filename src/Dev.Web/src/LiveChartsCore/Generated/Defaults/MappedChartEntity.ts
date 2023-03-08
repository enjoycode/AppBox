import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class MappedChartEntity implements LiveChartsCore.IChartEntity {
    private static readonly $meta_LiveChartsCore_IChartEntity = true;
    public EntityIndex: number = 0;

    public ChartPoints: Nullable<System.ObjectMap<LiveChartsCore.ChartPoint>>;

    #Coordinate: LiveChartsCore.Coordinate = LiveChartsCore.Coordinate.Empty;
    public get Coordinate() {
        return this.#Coordinate;
    }

    private set Coordinate(value) {
        this.#Coordinate = value;
    }

    public UpdateCoordinate(chartPoint: LiveChartsCore.ChartPoint) {
        this.Coordinate = new LiveChartsCore.Coordinate(chartPoint.PrimaryValue, chartPoint.SecondaryValue, chartPoint.TertiaryValue, chartPoint.QuaternaryValue, chartPoint.QuinaryValue);
    }
}
