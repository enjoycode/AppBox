export enum ZoomAndPanMode {
    None = 0,

    X = 1 << 0,

    Y = 1 << 1,

    Both = ZoomAndPanMode.X | ZoomAndPanMode.Y
}
