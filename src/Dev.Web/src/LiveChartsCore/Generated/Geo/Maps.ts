import * as LiveChartsCore from '@/LiveChartsCore'

export class Maps {

    public static BuildProjector(projection: LiveChartsCore.MapProjection, mapWidth: number, mapHeight: number): LiveChartsCore.MapProjector {
        let mapRatio = projection == LiveChartsCore.MapProjection.Default
            ? LiveChartsCore.ControlCoordinatesProjector.PreferredRatio
            : LiveChartsCore.MercatorProjector.PreferredRatio;

        let normalizedW = mapWidth / mapRatio[0];
        let normalizedH = mapHeight / mapRatio[1];
        let ox: number = 0;
        let oy: number = 0;

        if (normalizedW < normalizedH) {
            let h = mapWidth * mapRatio[1] / mapRatio[0];
            oy = (mapHeight - h) * 0.5;
            mapHeight = h;
        } else {
            let w = mapHeight * mapRatio[0] / mapRatio[1];
            ox = (mapWidth - w) * 0.5;
            mapWidth = w;
        }

        return projection == LiveChartsCore.MapProjection.Default
            ? new LiveChartsCore.ControlCoordinatesProjector(mapWidth, mapHeight, ox, oy)
            : new LiveChartsCore.MercatorProjector(mapWidth, mapHeight, ox, oy);
    }
}
