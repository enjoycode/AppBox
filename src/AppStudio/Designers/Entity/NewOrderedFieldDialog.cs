using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class NewOrderedFieldDialog : Dialog
{
    public NewOrderedFieldDialog(EntityModel entityModel)
    {
        _entityModel = entityModel;
        Title.Value = "New Indexes Field";
        Width = 380;
        Height = 200;
    }

    private readonly EntityModel _entityModel;
    private readonly State<EntityMember?> _selected = new RxValue<EntityMember?>(null);
    private readonly State<bool> _orderByDesc = false;

    protected override Widget BuildBody() => new Container
    {
        Padding = EdgeInsets.All(20),
        Child = new Form
        {
            Children =
            {
                new FormItem("EntityField:", new Select<EntityMember>(_selected)
                {
                    LabelGetter = m => m.Name,
                    Options = _entityModel.Members
                        .Where(m => m.Type == EntityMemberType.EntityField)
                        .ToArray()
                }),
                new FormItem("OrderByDesc:", new Checkbox(_orderByDesc))
            }
        }
    };

    internal OrderedField? GetResult()
    {
        if (_selected.Value == null) return null;
        return new OrderedField(_selected.Value.MemberId, _orderByDesc.Value);
    }

    protected override ValueTask<bool> OnClosing(DialogResult result)
    {
        if (result == DialogResult.OK)
        {
            if (_selected.Value == null)
            {
                Notification.Error("You must select a field");
                return ValueTask.FromResult(true);
            }
        }

        return base.OnClosing(result);
    }
}