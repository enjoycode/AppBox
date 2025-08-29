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

        _designService = new ReportDesignService();
        _designService.Surface.ToolboxService.Toolbox = _toolbox;

        Child = new Splitter
        {
            Fixed = Splitter.FixedPanel.Panel2,
            Distance = 260,
            Panel1 = new Column
            {
                Children =
                {
                    BuildCommandBar(),
                    _designService.DiagramView,
                }
            },
            Panel2 = _designService.PropertyPanel,
        };
    }

    private bool _hasLoadSourceCode;
    private Report _report = null!;
    private readonly ReportDesignService _designService;
    private readonly ReportToolbox _toolbox = new();
    internal DiagramSurface Surface => _designService.Surface;

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
                _report = AppBox.Reporting.Serialization.JsonSerializer.Deserialize(ref jsonReader);

                //2. 转换为相应的设计器
                var rootDesigner = new ReportRootDesigner(_designService, _report);
                Surface.AddItem(rootDesigner);
                Surface.SelectionService.SelectItem(rootDesigner);

                foreach (var item in _report.Items)
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
        if (_report == null!)
            throw new Exception("Report instance has not created");

        //TODO: 暂转换处理
        var ms = new MemoryStream();
        var jsonWriter = new Utf8JsonWriter(ms);
        AppBox.Reporting.Serialization.JsonSerializer.Serialize(jsonWriter, _report);
        jsonWriter.Flush();

        var jsonText = Encoding.UTF8.GetString(ms.ToArray());
        return ModelNode.SaveAsync(jsonText);
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

    public Widget GetToolboxPad() => _toolbox;
}