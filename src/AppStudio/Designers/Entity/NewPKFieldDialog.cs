using System.Linq;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class NewPKFieldDialog : Dialog
{
    public NewPKFieldDialog(EntityModel entityModel)
    {
        _entityModel = entityModel;
        Title.Value = "New Primary Key Field";
        Width = 380;
        Height = 250;
    }

    private readonly EntityModel _entityModel;
    private readonly State<EntityMemberModel?> _selected = new RxValue<EntityMemberModel?>(null);
    private readonly State<bool> _orderByDesc = false;
    private readonly State<bool> _allowChange = true;

    protected override Widget BuildBody() => new Container
    {
        Padding = EdgeInsets.All(20),
        Child = new Form
        {
            Children =
            {
                new("EntityField:", new Select<EntityMemberModel>(_selected)
                {
                    Options = _entityModel.Members
                        .Where(m => m.Type == EntityMemberType.EntityField)
                        .ToArray()
                }),
                new("OrderByDesc:", new Checkbox(_orderByDesc)),
                new("AllowChange:", new Checkbox(_allowChange))
            }
        }
    };

    internal PrimaryKeyField? GetResult()
    {
        if (_selected.Value == null) return null;
        return new PrimaryKeyField(_selected.Value.MemberId, _allowChange.Value, _orderByDesc.Value);
    }
}