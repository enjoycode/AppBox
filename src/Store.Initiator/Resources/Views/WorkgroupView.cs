using sys.Entities;

namespace sys.Views;

public sealed class WorkgroupView : View
{
    public static WorkgroupView Preview() => new(new());

    public WorkgroupView(RxWorkgroup state)
    {
        Child = new Form
        {
            Padding = EdgeInsets.All(10),
            LabelWidth = 50,
            Children = 
            {
                new ("名称:", new TextInput(state.Name)),
            }
        };
    }

}