using AppBoxClient;
using PixUI;

namespace AppBoxDesign;

internal sealed class NewViewDialog : Dialog
{
    public NewViewDialog(DesignStore designStore)
    {
        _designStore = designStore;
        Width = 300;
        Height = 210;
        Title.Value = "New View";
    }

    private readonly DesignStore _designStore;
    private readonly State<string> _name = "";
    private readonly State<bool> _isDynamic = false;

    protected override Widget BuildBody()
    {
        return new Container()
        {
            Padding = EdgeInsets.All(20),
            Child = new Column()
            {
                Children =
                {
                    new Form()
                    {
                        LabelWidth = 80,
                        Children = new[]
                        {
                            new FormItem("Name:", new TextInput(_name)),
                            new FormItem("Type:", new Row
                            {
                                Children =
                                {
                                    new Text("Code"),
                                    new Radio(_isDynamic.ToReversed()),
                                    new Text("Dynamic"),
                                    new Radio(_isDynamic)
                                }
                            })
                        }
                    }
                }
            }
        };
    }

    protected override bool OnClosing(bool canceled)
    {
        if (!canceled && !string.IsNullOrEmpty(_name.Value))
            CreateAsync();
        return base.OnClosing(canceled);
    }

    private async void CreateAsync()
    {
        var selectedNode = _designStore.TreeController.FirstSelectedNode;
        if (selectedNode == null) return;

        var service = "sys.DesignService.NewViewModel";
        var args = new object[] { (int)selectedNode.Data.Type, selectedNode.Data.Id, _name.Value, _isDynamic.Value };

        var res = await Channel.Invoke<NewNodeResult>(service, args);
        res!.ResolveToTree(_designStore);
        //根据返回结果同步添加新节点
        _designStore.OnNewNode(res!);
    }
}