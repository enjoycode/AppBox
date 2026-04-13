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
    private static void InitEditors(DesignHub designContext)
    {
        if (DesignSettings.CreateDynamicStateValue != null!) return;

        // 初始化一些动态视图设计时的委托
        DesignSettings.CreateDynamicStateValue = static (type) => type switch
        {
            DynamicStateType.DataTable => new DynamicDataTable(),
            DynamicStateType.DataRow => new DynamicDataRow(),
            _ => new DynamicPrimitive()
        };
        DesignSettings.GetStateEditor = (controller, state) => state.Type switch
        {
            DynamicStateType.DataTable => new DataTableEditDialog(designContext, controller, state),
            DynamicStateType.DataRow => new DataRowEditDialog(designContext, controller, state),
            _ => new ValueStateEditDialog(state)
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
        EventEditor.Register(nameof(FetchData), static (e, m, a) => new FetchDataEditor(e, m, a));
        EventEditor.Register(nameof(SaveData), static (e, m, a) => new SaveDataEditor(e, m, a));
        EventEditor.Register(nameof(DeleteData), static (e, m, a) => new DeleteDataEditor(e, m, a));
        EventEditor.Register(nameof(ShowDialog), (e, m, a) => new ShowDialogEditor(designContext, e, m, a));
    }

    public ViewDynamicDesigner(DesignHub designContext, ModelNode modelNode)
    {
        _designContext = designContext;
        InitEditors(designContext);

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

    private readonly DesignHub _designContext;
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
                new Button("Json") { OnTap = _ => BuildJson() },
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

        try
        {
            using var ms = new MemoryStream(2048);
            await _designContext.TypeSystem.DownloadSourceCode(ms, ModelNode);
            if (ms.Length > 0)
            {
                _designController.Load(ms.GetBuffer().AsSpan(0, (int)ms.Length));
            }
        }
        catch (Exception e)
        {
            Log.Warn($"无法加载动态视图:\n {e.StackTrace}");
            Notification.Error($"无法加载动态视图: {e.Message}");
        }
    }

#if DEBUG
    private void BuildJson()
    {
        using var ms = new MemoryStream();
        using var writer = new Utf8JsonWriter(ms, new JsonWriterOptions() { Indented = true });
        _designController.Write(writer);
        writer.Flush();
        var json = Encoding.UTF8.GetString(ms.GetBuffer().AsSpan(0, (int)ms.Length));
        Log.Debug(json);
    }
#endif

    public async Task SaveAsync()
    {
        await using var ms = new MemoryStream(2048);
        await using var writer = new Utf8JsonWriter(ms);
        _designController.Write(writer);
        await writer.FlushAsync();
        ms.Seek(0, SeekOrigin.Begin);

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

    void IDesigner.OnClose() { }
}