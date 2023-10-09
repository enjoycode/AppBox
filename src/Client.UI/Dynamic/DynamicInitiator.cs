using System.Threading;
using System.Threading.Tasks;
using LiveChartsCore.Measure;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public static class DynamicInitiator
{
    private static int _initFlag = 0;
    private static Task _initTask = null!;

    public static async Task<bool> TryInitAsync()
    {
        var res = false;
        if (Interlocked.CompareExchange(ref _initFlag, 1, 0) == 0)
        {
            _initTask = Init();
            res = true;
        }

        await _initTask;
        return res;
    }

    private static async Task Init()
    {
        //注册图表动态组件
        DynamicWidgetManager.Register<DynamicCartesianChart>(MaterialIcons.BarChart,
            catalog: "Chart",
            name: "CartesianChart",
            properties: new DynamicPropertyMeta[]
            {
                new("Series", typeof(CartesianSeriesSettings[]), true),
                new("XAxes", typeof(AxisSettings[]), true),
                new("YAxes", typeof(AxisSettings[]), true)
            });
        DynamicWidgetManager.Register<DynamicPieChart>(MaterialIcons.PieChart,
            catalog: "Chart",
            name: "PieChart",
            properties: new DynamicPropertyMeta[]
            {
                new("Series", typeof(PieSeriesSettings), true),
                new("LegendPosition", typeof(LegendPosition), false),
            });

        //注册标为动态组件的视图模型
        var widgets = await Channel.Invoke<string[]>("sys.SystemService.LoadDynamicWidgets");
        foreach (var viewModelName in widgets!)
        {
            var widgetType = await AppAssembiles.TryGetViewType(viewModelName);
            if (widgetType == null) continue;

            DynamicWidgetManager.Register(widgetType, true);
        }
    }

    public static async Task RebuildDynamicToolbox()
    {
        AppAssembiles.Reset(); //TODO:暂简单清除
        
        var widgets = await Channel.Invoke<string[]>("sys.SystemService.LoadDynamicWidgets");
        foreach (var viewModelName in widgets!)
        {
            var widgetType = await AppAssembiles.TryGetViewType(viewModelName);
            if (widgetType == null) continue;

            DynamicWidgetManager.Register(widgetType, true);
        }
        //TODO：DynamicWidgetManager移除不存在的
    }
}