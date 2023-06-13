using sys.Entities;

namespace sys.Views;

public sealed class WorkgroupView : View
{
    public static WorkgroupView Preview() => new(new());

    public WorkgroupView(RxEntity<Workgroup> state)
    {
        Child = new Form
        {
            Padding = EdgeInsets.All(10),
            LabelWidth = 50,
            Children = new FormItem[]
            {
                new ("名称:", new Input(state.Observe(e => e.Name))),
            }
        };
    }

}