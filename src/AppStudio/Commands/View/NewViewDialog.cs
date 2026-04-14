using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class NewViewDialog : Dialog
{
    public NewViewDialog(DesignHub designContext)
    {
        _designContext = designContext;
        Width = 300;
        Height = 210;
        Title.Value = "New View";
    }

    private readonly DesignHub _designContext;
    private DesignStore DesignStore => (DesignStore)_designContext.DesignUIService;
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
        var selectedNode = DesignStore.TreeController.FirstSelectedNode;
        if (selectedNode == null) return;

        var res = await NewView(_designContext, selectedNode.Data, _name.Value, _isDynamic.Value);
        //根据返回结果同步添加新节点
        res!.ResolveToTree(DesignStore);
        DesignStore.OnNewNode(res!);
    }

    private static Task<NewNodeResult> NewView(DesignHub context, DesignNode selectedNode, string name, bool isDynamic)
    {
        var selectedNodeType = selectedNode.Type;
        var selectedNodeId = selectedNode.Id;

        if (isDynamic)
        {
            return ModelCreator.Make(context, ModelType.View,
                id => new ViewModel(id, name, ViewModelType.PixUIDynamic),
                selectedNodeType, selectedNodeId, name,
                _ => """
                     {
                       "Root": {
                         "Type": "Center",
                         "Child": {
                           "Type": "Button",
                           "Text": { "Const": "Button" }
                         }
                       }
                     }
                     """
            );
        }

        return ModelCreator.Make(context, ModelType.View,
            id => new ViewModel(id, name),
            selectedNodeType, selectedNodeId, name,
            appName => $$"""
                         namespace {{appName}}.Views;

                         public sealed class {{name}} : View
                         {
                             public {{name}}()
                             {
                                 Child = new Center()
                                 {
                                     Child = new Text("Hello World") { FontSize = 50 }
                                 };
                             }
                         }
                         """);
    }
}