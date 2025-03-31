using System.Text;
using System.Text.Json;
using AppBoxClient.Dynamic;
using AppBoxClient.Dynamic.Events;
using AppBoxDesign.EventEditors;
using AppBoxDesign.PropertyEditors;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

internal sealed class ViewDynamicDesigner : View, IModelDesigner
{
    static ViewDynamicDesigner()
    {
        if (DesignSettings.CreateDynamicStateValue != null!) return;

        // 初始化一些动态视图设计时的委托
        DesignSettings.CreateDynamicStateValue = static (type) =>
        {
            if (type == DynamicStateType.DataTable)
                return new DynamicDataTable();
            return new DynamicPrimitive();
        };
        DesignSettings.GetStateEditor = static (controller, state) =>
        {
            if (state.Type == DynamicStateType.DataTable)
                return new TableStateEditDialog(controller, state);
            return new ValueStateEditDialog(state);
        };
        DesignSettings.GetEventEditor = static (element, meta) => new EventEditDialog(element, meta);

        // 初始化其他属性编辑器
        PropertyEditor.RegisterClassValueEditor<string, DataSourcePropEditor>(false,
            DynamicInitiator.DataSourceEditorName);
        PropertyEditor.RegisterClassValueEditor<CartesianSeriesSettings[], CartesianSeriesPropEditor>(true);
        PropertyEditor.RegisterClassValueEditor<ChartAxisSettings[], AxesPropEditor>(true);
        PropertyEditor.RegisterClassValueEditor<PieSeriesSettings, PieSeriesPropEditor>(true);
        PropertyEditor.RegisterClassValueEditor<TableColumnSettings[], TableColumnsPropEditor>(true);
        PropertyEditor.RegisterClassValueEditor<TableFooterCell[], TableFooterPropEditor>(true);
        PropertyEditor.RegisterClassValueEditor<TableStyles, TableStylesPropEditor>(true);
        // 初始化其他事件编辑器
        EventEditor.Register(nameof(FetchDataSource), static (e, m, a) => new FetchEntityListEditor(e, m, a));
    }

    public ViewDynamicDesigner(ModelNode modelNode)
    {
        ModelNode = modelNode;
        _toolboxPad = new Toolbox(_designController);
        _outlinePad = new DynamicOutlinePad(_designController);

        Child = new Splitter
        {
            Fixed = Splitter.FixedPanel.Panel2,
            Distance = 260,
            Panel1 = new Column
            {
                Children =
                {
                    BuildCommandBar(),
                    new DesignCanvas(_designController)
                }
            },
            Panel2 = new PropertyPanel(_designController),
        };
    }

    private readonly DesignController _designController = new();
    private readonly Toolbox _toolboxPad;
    private readonly DynamicOutlinePad _outlinePad;
    private bool _hasLoadSourceCode;

    public ModelNode ModelNode { get; }

    private Container BuildCommandBar() => new Container
    {
        Height = 40,
        Padding = EdgeInsets.All(5),
        FillColor = Colors.Gray,
        Child = new Row(VerticalAlignment.Middle, 5f)
        {
            Children =
            {
                new Button("Add") { OnTap = OnAdd },
                new Button("Remove") { OnTap = OnRemove },
                new Button("Background") { OnTap = OnSetBackground },
#if DEBUG
                new Button("Json")
                {
                    OnTap = _ => { Log.Debug(BuildJson(new JsonWriterOptions() { Indented = true })); }
                },
#endif
            }
        }
    };

    protected override void OnMounted()
    {
        base.OnMounted();
        TryLoadSourceCode();
    }

    private async void TryLoadSourceCode()
    {
        if (_hasLoadSourceCode) return;
        _hasLoadSourceCode = true;

        if (await DynamicInitiator.TryInitAsync())
            _toolboxPad.Rebuild();

        //TODO:直接获取utf8 bytes
        try
        {
            var srcCode = await DesignHub.Current.TypeSystem.LoadSourceCode(null, ModelNode);
            if (srcCode != null!)
            {
                var jsonData = Encoding.UTF8.GetBytes(srcCode);
                _designController.Load(jsonData);
            }
        }
        catch (Exception e)
        {
            Log.Warn($"无法加载动态视图:\n {e.StackTrace}");
            Notification.Error($"无法加载动态视图: {e.Message}");
        }
    }

    private string BuildJson(JsonWriterOptions options = default)
    {
        using var ms = new MemoryStream();
        using var writer = new Utf8JsonWriter(ms, options);
        _designController.Write(writer);
        writer.Flush();
        return Encoding.UTF8.GetString(ms.ToArray());
    }

    public Task SaveAsync()
    {
        return ModelNode.SaveAsync(BuildJson());
    }

    public Task RefreshAsync()
    {
        throw new NotImplementedException();
    }

    public void GotoLocation(ILocation location)
    {
        throw new NotImplementedException();
    }

    public Widget GetOutlinePad() => _outlinePad;

    public Widget GetToolboxPad() => _toolboxPad;

    private void OnAdd(PointerEvent e)
    {
        if (_designController.FirstSelected == null) return;

        var meta = _designController.CurrentToolboxItem;
        if (meta == null) return;

        var active = _designController.FirstSelected!;
        active.AddElement(meta, Point.Empty);
    }

    private void OnRemove(PointerEvent e)
    {
        var cmd = new DeleteElementsCommand();
        cmd.Run(_designController);
    }

    private async void OnSetBackground(PointerEvent e)
    {
        var dlg = new BackgroundDialog();
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        var bg = dlg.GetBackground();
        _designController.Background = bg;
    }
}