using sys.Entities;

namespace sys.Views;

public sealed class EnterpriseView : View
{
    public static EnterpriseView Preview() => new(new());

    public EnterpriseView(RxEntity<Enterprise> state)
    {
        Child = new Form
        {
            Padding = EdgeInsets.All(10),
            LabelWidth = 50,
            Children =
            {
                new ("名称:", new Input(state.Observe(e => e.Name))),
                new ("地址:", new Input(state.Observe(e => e.Address)!)),
            }
        };
    }

}