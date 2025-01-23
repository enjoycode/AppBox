using System.Threading.Tasks;
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
                                    new Radio(_isDynamic.ToReversed()),
                                    new Text("Code"),
                                    new Radio(_isDynamic),
                                    new Text("Dynamic"),
                                }
                            })
                        }
                    }
                }
            }
        };
    }

    protected override ValueTask<bool> OnClosing(string result)
    {
        if (result == DialogResult.OK && !string.IsNullOrEmpty(_name.Value))
            CreateAsync();
        return base.OnClosing(result);
    }

    private async void CreateAsync()
    {
        var selectedNode = _designStore.TreeController.FirstSelectedNode;
        if (selectedNode == null) return;
        
        var res = await NewViewModel.Execute(selectedNode.Data, _name.Value, _isDynamic.Value);
        //根据返回结果同步添加新节点
        res!.ResolveToTree(_designStore);
        _designStore.OnNewNode(res!);
    }
}