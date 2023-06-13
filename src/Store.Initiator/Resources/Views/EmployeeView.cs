using sys.Entities;

namespace sys.Views;

public sealed class EmployeeView : View
{
    public static EmployeeView Preview() => new(new());

    public EmployeeView(RxEntity<Employee> state)
    {
        Child = new Form
        {
            Padding = EdgeInsets.All(10),
            LabelWidth = 50,
            Children = new FormItem[]
            {
                new ("姓名:", new Input(state.Observe(e => e.Name)))
            }
        };
    }

}