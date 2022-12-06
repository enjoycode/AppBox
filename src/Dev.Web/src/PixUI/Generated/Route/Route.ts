import * as PixUI from '@/PixUI'

export class RouteSettings {
    public static readonly Empty: RouteSettings = new RouteSettings();
    //Name or Path and Argument
}

export type RouteWidgetBuilder = (settings: RouteSettings) => PixUI.Widget;
