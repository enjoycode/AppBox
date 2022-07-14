using PixUI;

namespace AppBoxDesign;

internal sealed class SqlStoreOptionsDesigner : View
{
    internal SqlStoreOptionsDesigner()
    {
        Child = new Column()
        {
            Children = new Widget[]
            {
                new Text("Primary Keys:") { FontSize = 28, FontWeight = FontWeight.Bold },
                new ButtonGroup()
                {
                    Children = new[]
                    {
                        new Button("Add", Icons.Filled.Add),
                        new Button("Remove", Icons.Filled.Remove)
                    }
                },
                
            }
        };
    }
     
}