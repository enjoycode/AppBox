import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class CoreMap<TDrawingContext extends LiveChartsCore.DrawingContext> implements System.IDisposable {
    private static readonly $meta_System_IDisposable = true;


    #Layers: System.StringMap<LiveChartsCore.MapLayer<TDrawingContext>> = new System.StringMap();
    public get Layers() {
        return this.#Layers;
    }

    protected set Layers(value) {
        this.#Layers = value;
    }

    public FindLand(shortName: string, layerName: string = "default"): Nullable<LiveChartsCore.LandDefinition> {
        return this.Layers.get(layerName)!.Lands.get(shortName);
    }


    public Dispose() {
        this.Layers.clear();
    }
}
