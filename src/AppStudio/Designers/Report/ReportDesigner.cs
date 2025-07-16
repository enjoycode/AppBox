using System.Text;
using System.Text.Json;
using AppBox.Reporting;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class ReportDesigner : View, IModelDesigner
{
    public ReportDesigner(ModelNode modelNode)
    {
        ModelNode = modelNode;

        _diagramView = new DiagramView();
        _diagramView.Surface.ToolboxService.Toolbox = _toolbox;

        Child = new Splitter
        {
            Fixed = Splitter.FixedPanel.Panel2,
            Distance = 260,
            Panel1 = new Column
            {
                Children =
                {
                    BuildCommandBar(),
                    _diagramView,
                }
            },
            Panel2 = new Container() { FillColor = Colors.DarkGray } /*TODO: Property Panel*/
        };
    }

    private bool _hasLoadSourceCode;
    private readonly DiagramView _diagramView;
    private readonly ReportToolbox _toolbox = new();
    internal DiagramSurface Surface => _diagramView.Surface;

    public ModelNode ModelNode { get; }

    protected override void OnMounted()
    {
        base.OnMounted();
        TryLoadSourceCode();
    }

    private async void TryLoadSourceCode()
    {
        if (_hasLoadSourceCode) return;
        _hasLoadSourceCode = true;

        //TODO:直接获取utf8 bytes
        try
        {
            var srcCode = await DesignHub.Current.TypeSystem.LoadSourceCode(null, ModelNode);
            if (srcCode != null!)
            {
                var jsonData = Encoding.UTF8.GetBytes(srcCode);
                var jsonReader = new Utf8JsonReader(jsonData.AsSpan());
                var report = AppBox.Reporting.Serialization.JsonSerializer.Deserialize(ref jsonReader);

                //2. 转换为相应的设计器
                var rootDesigner = new ReportRootDesigner(report);
                Surface.AddItem(rootDesigner);

                foreach (var item in report.Items)
                {
                    LoadDesigners(item, rootDesigner);
                }

                //3. 布局刷新画布
                rootDesigner.PerformLayout();
                Surface.Repaint();
            }
        }
        catch (Exception e)
        {
            Log.Warn($"无法加载报表定义:\n {e.StackTrace}");
            Notification.Error($"无法加载报表定义: {e.Message}");
        }
    }

    private static void LoadDesigners(ReportItemBase item, IReportItemDesigner parentDesigner)
    {
        var designer = DesignerFactory.CreateDesigner(item);
        ((DiagramItem)parentDesigner).AddItem(designer);

        foreach (var child in item.Items)
        {
            LoadDesigners(child, (IReportItemDesigner)designer);
        }
    }

    private Container BuildCommandBar() => new()
    {
        Height = 40,
        Padding = EdgeInsets.All(5),
        FillColor = Colors.Gray,
        Child = new Row(VerticalAlignment.Middle, 5f)
        {
            Children =
            {
                new Button("Add"),
                new Button("Remove"),
            }
        }
    };

    public Task SaveAsync()
    {
        throw new NotImplementedException();
    }

    public Task RefreshAsync()
    {
        throw new NotImplementedException();
    }

    public void GotoLocation(ILocation location)
    {
        throw new NotImplementedException();
    }

    public Widget? GetOutlinePad()
    {
        //TODO:
        return null;
    }

    public Widget? GetToolboxPad() => _toolbox;
}