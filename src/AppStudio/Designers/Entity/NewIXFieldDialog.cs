using System;
using System.Linq;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class NewIdxFieldDialog : Dialog
{
    public NewIdxFieldDialog(EntityModel entityModel)
    {
        _entityModel = entityModel;
        Title.Value = "New Indexes Field";
        Width = 380;
        Height = 200;
    }

    private readonly EntityModel _entityModel;
    private readonly State<EntityMemberModel?> _selected = new RxValue<EntityMemberModel?>(null);
    private readonly State<bool> _orderByDesc = false;

    protected override Widget BuildBody() => new Container
    {
        Padding = EdgeInsets.All(20),
        Child = new Form
        {
            Children =
            {
                new FormItem("EntityField:", new Select<EntityMemberModel>(_selected)
                {
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
}