using sys.Entities;

namespace sys.Views;

public sealed class EnterpriseView : View
{
    public static EnterpriseView Preview() => new(new());

    public EnterpriseView(RxEnterprise state)
    {
        Child = new Form
        {
            Padding = EdgeInsets.All(10),
            LabelWidth = 50,
            Children =
            {
                new ("名称:", new TextInput(state.Name)),
                new ("地址:", new TextInput(state.Address!)),
            }
        };
    }

}