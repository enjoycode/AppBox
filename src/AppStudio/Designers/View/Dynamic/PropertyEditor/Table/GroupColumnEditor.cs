using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class GroupColumnEditor : SingleChildWidget
{
    public GroupColumnEditor(RxObject<GroupColumnSettings> obj)
    {
        var lable = obj.Observe(nameof(GroupColumnSettings.Label),
            s => s.Label, (s, v) => s.Label = v);

        Child = new Form()
        {
            LabelWidth = 90,
            Children =
            {
                new("Label:", new TextInput(lable)),
            }
        };
    }
}