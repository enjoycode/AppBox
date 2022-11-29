import * as PixUI from '@/PixUI'

export class RouteSettings {
    public static readonly Empty: RouteSettings = new RouteSettings();
}

export type RouteWidgetBuilder = (settings: RouteSettings) => PixUI.Widget;

export class Route {
    public readonly Name: string;

    public readonly Dynamic: boolean;

    public readonly Builder: RouteWidgetBuilder;

    public readonly Duration: number;

    public readonly ReverseDuration: number;

    public readonly EnteringBuilder: Nullable<PixUI.TransitionBuilder>;

    public readonly ExistingBuilder: Nullable<PixUI.TransitionBuilder>;

    public constructor(name: string, builder: RouteWidgetBuilder,
                       enteringBuilder: Nullable<PixUI.TransitionBuilder> = null,
                       existingBuilder: Nullable<PixUI.TransitionBuilder> = null,
                       duration: number = 200, reverseDuration: number = 200, isDynamic: boolean = false) {
        //TODO:检查名称有效性
        this.Name = name;
        this.Dynamic = isDynamic;
        this.Builder = builder;
        this.Duration = duration;
        this.ReverseDuration = reverseDuration;
        this.EnteringBuilder = enteringBuilder;
    }
}
