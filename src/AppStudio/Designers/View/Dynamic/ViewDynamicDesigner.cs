using System.Text;
using System.Threading.Tasks;
using AppBoxClient;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

internal sealed class ViewDynamicDesigner : View, IModelDesigner
{
    public ViewDynamicDesigner(ModelNodeVO modelNode)
    {
        ModelNode = modelNode;

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
                            new Button("Add"),
                            new Button("Remove"),
                        }
                    }
                },
                // Designer
                new Row
                {
                    Children =
                    {
                        new Expanded { Child = new DesignCanvas(_designController) },
                        new Container { Width = 220, Child = new PropertyPanel(_designController) }
                    }
                },
            }
        };
    }

    private readonly DesignController _designController = new();
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
        throw new System.NotImplementedException();
    }

    public Task RefreshAsync()
    {
        throw new System.NotImplementedException();
    }

    public void GotoDefinition(ReferenceVO reference)
    {
        throw new System.NotImplementedException();
    }

    public Widget? GetOutlinePad()
    {
        return null;
    }
}