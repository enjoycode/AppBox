import * as LiveChartsCore from '@/LiveChartsCore'

export class MapContext<TDrawingContext extends LiveChartsCore.DrawingContext> {
    public constructor(
        core: LiveChartsCore.GeoMap<TDrawingContext>,
        view: LiveChartsCore.IGeoMapView<TDrawingContext>,
        map: LiveChartsCore.CoreMap<TDrawingContext>,
        projector: LiveChartsCore.MapProjector) {
        this.CoreMap = core;
        this.MapFile = map;
        this.Projector = projector;
        this.View = view;
    }

    #CoreMap: LiveChartsCore.GeoMap<TDrawingContext>;
    public get CoreMap() {
        return this.#CoreMap;
    }

    private set CoreMap(value) {
        this.#CoreMap = value;
    }

    #MapFile: LiveChartsCore.CoreMap<TDrawingContext>;
    public get MapFile() {
        return this.#MapFile;
    }

    private set MapFile(value) {
        this.#MapFile = value;
    }

    #Projector: LiveChartsCore.MapProjector;
    public get Projector() {
        return this.#Projector;
    }

    private set Projector(value) {
        this.#Projector = value;
    }

    #View: LiveChartsCore.IGeoMapView<TDrawingContext>;
    public get View() {
        return this.#View;
    }

    private set View(value) {
        this.#View = value;
    }
}
