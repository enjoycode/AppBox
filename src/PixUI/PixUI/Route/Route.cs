using System;
using System.Threading.Tasks;

namespace PixUI
{
    public sealed class RouteSettings
    {
        internal static readonly RouteSettings Empty = new RouteSettings();
        //Name or Path and Argument
    }
    
    public delegate Widget RouteWidgetBuilder(RouteSettings settings);

    /// <summary>
    /// 路由配置项
    /// </summary>
    [TSType("PixUI.Route")]
    public sealed class Route
    {
        internal readonly string Name;

        /// <summary>
        /// 是否有动态参数 eg: /user/:id
        /// </summary>
        internal readonly bool Dynamic;

        internal readonly RouteWidgetBuilder Builder;

        internal readonly int Duration;

        internal readonly int ReverseDuration;

        /// <summary>
        /// 进入动画
        /// </summary>
        internal readonly TransitionBuilder? EnteringBuilder;

        /// <summary>
        /// 退出动画
        /// </summary>
        internal readonly TransitionBuilder? ExistingBuilder;

        public Route(string name, RouteWidgetBuilder builder,
            TransitionBuilder? enteringBuilder = null,
            TransitionBuilder? existingBuilder = null,
            int duration = 200, int reverseDuration = 200, bool isDynamic = false)
        {
            //TODO:检查名称有效性
            Name = name;
            Dynamic = isDynamic;
            Builder = builder;
            Duration = duration;
            ReverseDuration = reverseDuration;
            EnteringBuilder = enteringBuilder;
        }
    }
}