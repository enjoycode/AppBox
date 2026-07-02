using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class RenameDialog : Dialog
{
    public RenameDialog(string title, string oldName)
    {
        _oldName = oldName;

        Title.Value = title;
        Width = 380;
        Height = 210;
    }

    private readonly State<string> _oldName;
    private readonly State<string> _newName = "";

    public string OldName => _oldName.Value;
    public string NewName => _newName.Value;

    protected override Widget BuildBody()
    {
        return new Container()
        {
            Padding = EdgeInsets.All(20),
            Child = new Form()
            {
                LabelWidth = 100,
                Children =
                [
                    new FormItem("Old Name:", new TextInput(_oldName) { Readonly = true }),
                    new FormItem("New Name:", new TextInput(_newName))
                ]
            }
        };
    }

    protected override ValueTask<bool> OnClosing(DialogResult result)
    {
        if (result == DialogResult.OK)
        {
            //这里只作基本有效性检查
            if (string.IsNullOrEmpty(NewName))
            {
                Notification.Error("New name cannot be empty.");
                return ValueTask.FromResult(true);
            }

            if (OldName == NewName)
            {
                Notification.Error("New name is same as old name.");
                return ValueTask.FromResult(true);
            }

            if (!CodeUtil.IsValidIdentifier(NewName))
            {
                Notification.Error("New name is invalid.");
                return ValueTask.FromResult(true);
            }
        }

        return ValueTask.FromResult(false);
    }
}