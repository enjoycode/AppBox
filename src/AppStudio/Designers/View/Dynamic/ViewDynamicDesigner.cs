using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using AppBoxClient;
using AppBoxClient.Dynamic;
using AppBoxCore;
using AppBoxDesign.PropertyEditor;
using LiveChartsCore;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

internal sealed class ViewDynamicDesigner : View, IModelDesigner
{
    static ViewDynamicDesigner()
    {
        if (DesignSettings.GetDataSetEditor == null)
        {
            // 初始化一些动态视图设计时的委托
            DesignSettings.GetDataSetEditor = (state) => new DataSetEditDialog(state);
            DesignSettings.MakeDataSetSettings = () => new DataSetSettings();

            // 初始化其他动态组件
            DynamicInitiator.TryInit();
            // 初始化其他属性编辑器
            PixUI.Dynamic.Design.PropertyEditor
                .RegisterClassValueEditor<CartesianSeriesSettings[], CartesianSeriesPropEditor>(true);
            PixUI.Dynamic.Design.PropertyEditor
                .RegisterClassValueEditor<AxisSettings[], AxesPropEditor>(true);
            PixUI.Dynamic.Design.PropertyEditor
                .RegisterClassValueEditor<PieSeriesSettings, PieSeriesPropEditor>(true);
        }
    }

    public ViewDynamicDesigner(ModelNodeVO modelNode)
    {
        ModelNode = modelNode;
        _toolboxPad = new Toolbox(_designController);
        _outlinePad = new DynamicOutlinePad(_designController);

        Child = new Column
        {
            Children =
            {
                // CommandBar
                new Container
                {
                    Height = 40,
                    Padding = EdgeInsets.All(5),
                    BgColor = Colors.Gray,
                    Child = new Row(VerticalAlignment.Middle, 5f)
                    {
                        Children =
                        {
                            new Button("Add") { OnTap = OnAdd },
                            new Button("Remove") { OnTap = OnRemove },
                        }
                    }
                },
                // Designer
                new Row
                {
                    Children =
                    {
                        new Expanded { Child = new DesignCanvas(_designController) },
                        new Container { Width = 260, Child = new PropertyPanel(_designController) }
                    }
                },
            }
        };
    }

    private readonly DesignController _designController = new();
    private readonly Toolbox _toolboxPad;
    private readonly DynamicOutlinePad _outlinePad;
    private bool _hasLoadSourceCode = false;

    public ModelNodeVO ModelNode { get; }

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
        var srcCode = await Channel.Invoke<string>("sys.DesignService.OpenCodeModel", new object[] { ModelNode.Id });
        if (srcCode != null)
        {
            var jsonData = Encoding.UTF8.GetBytes(srcCode);
            _designController.Load(jsonData);
        }
    }

    public Task SaveAsync()
    {
        //TODO:直接传输utf8 bytes
        using var ms = new MemoryStream();
        using var writer = new Utf8JsonWriter(ms);
        _designController.Write(writer);
        writer.Flush();
        var json = Encoding.UTF8.GetString(ms.ToArray());

        return Channel.Invoke("sys.DesignService.SaveModel", new object?[] { ModelNode.Id, json });
    }

    public Task RefreshAsync()
    {
        throw new System.NotImplementedException();
    }

    public void GotoDefinition(ReferenceVO reference)
    {
        throw new System.NotImplementedException();
    }

    public Widget? GetOutlinePad() => _outlinePad;

    public Widget? GetToolboxPad() => _toolboxPad;

    private void OnAdd(PointerEvent e)
    {
        if (_designController.FirstSelected == null) return;

        var meta = _designController.CurrentToolboxItem;
        if (meta == null) return;

        var active = _designController.FirstSelected!;
        active.OnDrop(meta);

        _outlinePad.RefreshOutline(); //TODO: remove when impl DesignController.RefreshOutline
    }

    private void OnRemove(PointerEvent e)
    {
        _designController.DeleteElements();

        _outlinePad.RefreshOutline(); //TODO: remove when impl DesignController.RefreshOutline
    }
}