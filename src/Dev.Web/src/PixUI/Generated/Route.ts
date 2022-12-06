import * as PixUI from '@/PixUI'

type RouteWidgetAsyncBuilder = (settings: PixUI.RouteSettings) => Promise<PixUI.Widget>;

export class Route {
    public constructor(name: string, builder: RouteWidgetAsyncBuilder, isDynamic = false,
                       enteringBuilder: PixUI.TransitionBuilder | null = null,
                       existingBuilder: PixUI.TransitionBuilder | null = null,
                       duration: number = 200, reverseDuration: number = 200) {
        this.Name = name;
        this.Builder = builder;
        this.Dynamic = isDynamic;
        this.EnteringBuilder = enteringBuilder;
        this.ExistingBuilder = existingBuilder;
        this.Duration = duration;
        this.ReverseDuration = reverseDuration;
    }

    public readonly Name: string;
    public readonly Builder: RouteWidgetAsyncBuilder;
    public readonly Dynamic: boolean;
    public readonly EnteringBuilder: PixUI.TransitionBuilder | null;
    public readonly ExistingBuilder: PixUI.TransitionBuilder | null;
    public readonly Duration: number;
    public readonly ReverseDuration: number;
}