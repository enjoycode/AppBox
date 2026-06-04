using System.Text.Json;
using AppBox.ReportDataSource;
using AppBox.Reporting;
using AppBoxDesign.Reporting;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class ReportDesigner : View, IModelDesigner
{
    public ReportDesigner(DesignContext designContext, ModelNode modelNode)
    {
        _designContext = designContext;
        ModelNode = modelNode;
        _diagramService = new ReportDiagramService(designContext);

        Child = new Splitter
        {
            Fixed = Splitter.FixedPanel.Panel2,
            Distance = 260,
            Panel1 = new Column
            {
                Children =
                {
                    BuildCommandBar(),
                    new IfConditional(_isPreview,
                        () => new ReportPreviewer(() => _report),
                        () => new DiagramView(_diagramService))
                }
            },
            Panel2 = _diagramService.PropertyPanel,
        };
    }

    private readonly DesignContext _designContext;
    private bool _hasLoadSourceCode;
    private Report _report = null!;
    private readonly ReportDiagramService _diagramService;
    private readonly State<bool> _isPreview = false;

    internal DiagramSurface Surface => _diagramService.Surface;

    public ModelNode ModelNode { get; }

    protected override void OnMounted()
    {
        base.OnMounted();
        TryLoadSourceCode();
    }

    private async void TryLoadSourceCode()
    {
        try
        {
            if (_hasLoadSourceCode) return;
            _hasLoadSourceCode = true;

            await using var ms = new MemoryStream(2048);
            await _designContext.TypeSystem.DownloadSourceCode(ms, ModelNode);
            if (ms.Length > 0)
            {
                var jsonReader = new Utf8JsonReader(ms.GetBuffer().AsSpan(0, (int)ms.Length));
                var ctx = new ReportDeserializeContext();
                _report = AppBox.Reporting.Serialization.JsonSerializer.Deserialize(ref jsonReader, ctx);

                //2. 转换为相应的设计器
                var rootDesigner = new ReportRootDesigner(_diagramService, _report);
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
        var designer = ReportDesignerFactory.CreateDesigner(item);
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
        Child = new Row(VerticalAlignment.Middle, 10f)
        {
            Children =
            {
                new ButtonGroup
                {
                    Children =
                    [
                        new Button("Design") { Width = 75, OnTap = _ => _isPreview.Value = false },
                        new Button("Preview") { Width = 75, OnTap = _ => _isPreview.Value = true },
                    ]
                },
                new ButtonGroup()
                {
                    Children =
                    [
                        new Button("Add"),
                        new Button("Remove") { OnTap = _ => _diagramService.DeleteSelection() },
                    ]
                },
            }
        }
    };

    public async Task SaveAsync()
    {
        if (_report == null!)
            throw new Exception("Report instance has not created");

        //TODO: 暂转换处理
        await using var ms = new MemoryStream(2048);
        var jsonWriter = new Utf8JsonWriter(ms);
        AppBox.Reporting.Serialization.JsonSerializer.Serialize(jsonWriter, _report);
        await jsonWriter.FlushAsync();
        ms.Position = 0;

        await ModelNode.SaveAsync(ms);
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

    public Widget GetToolboxPad() => _diagramService.Toolbox;

    void IDesigner.OnClose() { }
}