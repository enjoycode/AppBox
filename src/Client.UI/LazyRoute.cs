using System;
using System.Threading.Tasks;
using AppBoxClient;

namespace PixUI;

/// <summary>
/// 延迟加载视图模型的路由
/// </summary>
public sealed class LazyRoute : Route //继承自Route使转换后类型兼容
{
    public LazyRoute(string name, string viewModelName, bool isDynamic = false,
        TransitionBuilder? enteringBuilder = null, TransitionBuilder? existingBuilder = null,
        int duration = 200, int reverseDuration = 200, Func<ValueTask<bool>>? allowAccess = null)
        : base(name, null, isDynamic, enteringBuilder, existingBuilder, duration, reverseDuration, allowAccess)
    {
        _viewModelName = viewModelName;
    }

    private readonly string _viewModelName;

    public override ValueTask<Widget> BuildWidgetAsync(string? args)
    {
        //TODO:处理args
        return AppAssembiles.MakeViewWidgetAsync(_viewModelName);
    }
}