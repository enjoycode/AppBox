using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 新建数据库索引对话框
/// </summary>
internal sealed class NewSqlIndexDialog : Dialog
{
    public NewSqlIndexDialog(SqlStoreOptions sqlStoreOptions)
    {
        _sqlStoreOptions = sqlStoreOptions;

        Title.Value = "New Sql Index";
        Width = 430;
        Height = 380;
    }

    private readonly SqlStoreOptions _sqlStoreOptions;
    private readonly State<string> _name = string.Empty;
    private readonly State<bool> _unique = false;
    private readonly List<OrderedField> _fields = [];

    protected override Widget BuildBody() => new Container
    {
        Padding = EdgeInsets.All(20),
        Child = new Form
        {
            LabelWidth = 80,
            Children =
            {
                new("Name:", new TextInput(_name)),
                new("Unique:", new Checkbox(_unique)),
                new("Fields:", new OrderedFieldListEditor(_sqlStoreOptions, _fields))
                    { LabelVerticalAlignment = VerticalAlignment.Top },
            }
        }
    };

    protected override ValueTask<bool> OnClosing(DialogResult result)
    {
        if (result == DialogResult.OK)
        {
            if (string.IsNullOrEmpty(_name.Value))
            {
                Notification.Error("Name is required");
                return ValueTask.FromResult(true);
            }

            if (_fields.Count == 0)
            {
                Notification.Error("Fields are required");
                return ValueTask.FromResult(true);
            }
        }

        return base.OnClosing(result);
    }

    public SqlIndex GetResult()
    {
        return new SqlIndex(_sqlStoreOptions.Owner, _name.Value, _unique.Value, _fields.ToArray());
    }
}