import * as PixUI from '@/PixUI'
import * as System from '@/System'

export type RouteWidgetBuilder = (arg: Nullable<string>) => System.Task<PixUI.Widget>;

/// <summary>
/// 路由配置项
/// </summary>
export class Route {
    public readonly Name: string;

    public readonly Dynamic: boolean;

    public readonly Builder: RouteWidgetBuilder;

    public readonly Duration: number;

    public readonly ReverseDuration: number;

    public readonly EnteringBuilder: Nullable<PixUI.TransitionBuilder>;

    public readonly ExistingBuilder: Nullable<PixUI.TransitionBuilder>;

    public constructor(name: string, builder: RouteWidgetBuilder, isDynamic: boolean = false,
                       enteringBuilder: Nullable<PixUI.TransitionBuilder> = null, existingBuilder: Nullable<PixUI.TransitionBuilder> = null,
                       duration: number = 200, reverseDuration: number = 200) {
        //TODO:检查名称有效性
        this.Name = name.toLowerCase();
        this.Dynamic = isDynamic;
        this.Builder = builder;
        this.Duration = duration;
        this.ReverseDuration = reverseDuration;
        this.EnteringBuilder = enteringBuilder;
    }
}
