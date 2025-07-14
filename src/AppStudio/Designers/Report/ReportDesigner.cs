using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class ReportDesigner : View, IModelDesigner
{
    public ReportDesigner(ModelNode modelNode)
    {
        ModelNode = modelNode;

        Child = new Splitter
        {
            Fixed = Splitter.FixedPanel.Panel2,
            Distance = 260,
            Panel1 = new Column
            {
                Children =
                {
                    BuildCommandBar(),
                    new DiagramView(),
                }
            },
            Panel2 = new Container() { FillColor = Colors.DarkGray } /*TODO: Property Panel*/
        };
    }

    public ModelNode ModelNode { get; }

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

    public Widget? GetToolboxPad()
    {
        //TODO: 
        return null;
    }
}