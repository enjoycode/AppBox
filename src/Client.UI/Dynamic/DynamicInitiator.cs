using System.Threading;
using System.Threading.Tasks;
using LiveChartsCore.Measure;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

/// <summary>
/// 初始化设计时及运行时的动态组件
/// </summary>
public static class DynamicInitiator
{
    private static int _initFlag = 0;
    private static Task _initTask = null!;

    public const string DataSourceEditorName = "DataSourceSelect";

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
        const string dataCatalog = "Data";

        //初始化事件行为管理器
        DynamicWidgetManager.TryInitEventActionManager(() => new EventActionManager());

        //注册表格动态组件
        DynamicWidgetManager.Register<DynamicTable>(MaterialIcons.GridOn,
            catalog: dataCatalog,
            name: "Table",
            properties: new DynamicPropertyMeta[]
            {
                new(nameof(DynamicTable.DataSource), typeof(string), true, editorName: DataSourceEditorName),
                new(nameof(DynamicTable.Columns), typeof(TableColumnSettings[]), true),
                new(nameof(DynamicTable.Footer), typeof(TableFooterCell[]), true),
                new(nameof(DynamicTable.Styles), typeof(TableStyles), true),
            });

        //注册图表动态组件
        DynamicWidgetManager.Register<DynamicCartesianChart>(MaterialIcons.BarChart,
            catalog: dataCatalog,
            name: "CartesianChart",
            properties: new DynamicPropertyMeta[]
            {
                new(nameof(DynamicCartesianChart.DataSource), typeof(string), true, editorName: DataSourceEditorName),
                new(nameof(DynamicCartesianChart.Series), typeof(CartesianSeriesSettings[]), true),
                new(nameof(DynamicCartesianChart.XAxes), typeof(ChartAxisSettings[]), true),
                new(nameof(DynamicCartesianChart.YAxes), typeof(ChartAxisSettings[]), true)
            });
        DynamicWidgetManager.Register<DynamicPieChart>(MaterialIcons.PieChart,
            catalog: dataCatalog,
            name: "PieChart",
            properties: new DynamicPropertyMeta[]
            {
                new(nameof(DynamicPieChart.DataSource), typeof(string), true, editorName: DataSourceEditorName),
                new(nameof(DynamicPieChart.Series), typeof(PieSeriesSettings), true),
                new(nameof(DynamicPieChart.LegendPosition), typeof(LegendPosition), false),
                new(nameof(DynamicPieChart.LegendColor), typeof(Color), true),
            });

        //注册标为动态组件的视图模型
        var widgets = await Channel.Invoke<string[]>("sys.SystemService.LoadDynamicWidgets");
        foreach (var viewModelName in widgets!)
        {
            var widgetType = await AppAssemblies.TryGetViewType(viewModelName);
            if (widgetType == null) continue;

            DynamicWidgetManager.Register(widgetType, true);
        }
    }

    public static async Task RebuildDynamicToolbox()
    {
        AppAssemblies.Reset(); //TODO:暂简单清除

        var widgets = await Channel.Invoke<string[]>("sys.SystemService.LoadDynamicWidgets");
        foreach (var viewModelName in widgets!)
        {
            var widgetType = await AppAssemblies.TryGetViewType(viewModelName);
            if (widgetType == null) continue;

            DynamicWidgetManager.Register(widgetType, true);
        }
        //TODO：DynamicWidgetManager移除不存在的
    }
}