import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class MapLayer<TDrawingContext extends LiveChartsCore.DrawingContext> {
    public constructor(layerName: string, stroke: LiveChartsCore.IPaint<TDrawingContext>, fill: LiveChartsCore.IPaint<TDrawingContext>) {
        this.Name = layerName;
        this.Stroke = stroke;
        this.Fill = fill;
    }

    public Name: string = "";

    public ProcessIndex: number = 0;

    public IsVisible: boolean = true;

    public Stroke: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    public Fill: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    public Max: Float64Array = new Float64Array();

    public Min: Float64Array = new Float64Array();

    #Lands: System.StringMap<LiveChartsCore.LandDefinition> = new System.StringMap();
    public get Lands() {
        return this.#Lands;
    }

    private set Lands(value) {
        this.#Lands = value;
    }

    public AddLandWhen: Nullable<System.Func3<LiveChartsCore.LandDefinition, LiveChartsCore.CoreMap<TDrawingContext>, boolean>>;

}
