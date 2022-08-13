using System;
using System.Linq;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class FieldWithOrderDialog : Dialog
{
    public FieldWithOrderDialog(EntityModelVO entityModel)
    {
        _entityModel = entityModel;
        Width = 380;
        Height = 200;
        Title.Value = "EntityFieldWithOrder";
    }

    private readonly EntityModelVO _entityModel;
    private readonly State<EntityMemberVO?> _selected = new Rx<EntityMemberVO?>(null);
    private readonly State<bool> _orderByDesc = false;

    protected override Widget BuildBody()
    {
        return new Container
        {
            Padding = EdgeInsets.All(20),
            Child = new Form()
            {
                Children = new[]
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
    }

    internal FieldWithOrder? GetResult()
    {
        if (_selected.Value == null) return null;
        return new FieldWithOrder(_selected.Value.Id, _orderByDesc.Value);
    }
}