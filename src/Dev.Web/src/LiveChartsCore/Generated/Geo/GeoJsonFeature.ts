import * as LiveChartsCore from '@/LiveChartsCore'
import * as System from '@/System'

export class GeoJsonFeature {
    public Type: Nullable<string>;

    public Properties: Nullable<System.StringMap<string>>;

    public Geometry: Nullable<LiveChartsCore.MultiPoligonGeometry>;
}
