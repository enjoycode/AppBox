using sys.Entities;

namespace sys.Views;

public sealed class EmployeeView : View
{
    public static EmployeeView Preview() => new(new());

    public EmployeeView(RxEmployee state)
    {
        Child = new Form
        {
            Padding = EdgeInsets.All(10),
            LabelWidth = 50,
            Children =
            {
                new ("姓名:", new TextInput(state.Name)),
                new ("生日:", new DatePicker(state.Birthday)),
                new ("性别:", new Row { Children =
                {
                    new Text("男"),
                    new Radio(state.Male),
                    new Text("女"),
                    new Radio(state.Male.ToReversed())
                }})
            }
        };
    }

}