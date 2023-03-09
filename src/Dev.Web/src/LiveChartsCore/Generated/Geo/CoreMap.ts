import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class CoreMap<TDrawingContext extends LiveChartsCore.DrawingContext> implements System.IDisposable {
    private static readonly $meta_System_IDisposable = true;
    // /// <summary>
    // /// Initializes a new instance of the <see cref="CoreMap{TDrawingContext}"/> class.
    // /// </summary>
    // public CoreMap() { }
    //
    // /// <summary>
    // /// Initializes a new instance of the <see cref="CoreMap{TDrawingContext}"/> class, with the given layer.
    // /// </summary>
    // /// <param name="path">The path to the GeoJson file for the layer.</param>
    // /// <param name="layerName">The layer name.</param>
    // public CoreMap(string path, string layerName = "default") : this(new StreamReader(path), layerName)
    // {
    //     _ = AddLayerFromDirectory(path, layerName);
    // }


    #Layers: System.Dictionary<string, LiveChartsCore.MapLayer<TDrawingContext>> = new System.Dictionary();
    public get Layers() {
        return this.#Layers;
    }

    protected set Layers(value) {
        this.#Layers = value;
    }

    public FindLand(shortName: string, layerName: string = "default"): Nullable<LiveChartsCore.LandDefinition> {
        let land: any;
        return this.Layers.GetAt(layerName).Lands.TryGetValue(shortName, new System.Out(() => land, $v => land = $v)) ? land : null;
    }


    public Dispose() {
        this.Layers.Clear();
    }
}
