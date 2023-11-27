using System;
using System.Linq;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class NewIXFieldDialog : Dialog
{
    public NewIXFieldDialog(EntityModelVO entityModel)
    {
        _entityModel = entityModel;
        Title.Value = "New Indexes Field";
        Width = 380;
        Height = 200;
    }

    private readonly EntityModelVO _entityModel;
    private readonly State<EntityMemberVO?> _selected = new RxValue<EntityMemberVO?>(null);
    private readonly State<bool> _orderByDesc = false;

    protected override Widget BuildBody() => new Container
    {
        Padding = EdgeInsets.All(20),
        Child = new Form
        {
            Children =
            {
                new FormItem("EntityField:", new Select<EntityMemberVO>(_selected)
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
        return new OrderedField(_selected.Value.Id, _orderByDesc.Value);
    }
}