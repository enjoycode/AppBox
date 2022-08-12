using System;
using System.Linq;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class FieldWithOrderDialog : Dialog<FieldWithOrder>
{
    public FieldWithOrderDialog(Overlay overlay, EntityModelVO entityModel,
        Action<bool, FieldWithOrder>? onClose = null) : base(overlay, onClose)
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
            Child = new Column()
            {
                Children = new Widget[]
                {
                    new Form()
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
                    },
                    new Row(VerticalAlignment.Middle, 20)
                    {
                        Children = new Widget[]
                        {
                            new Button("Cancel")
                                { Width = 65, OnTap = _ => Close(true) },
                            new Button("OK")
                                { Width = 65, OnTap = _ => Close(_selected.Value == null) },
                        }
                    }
                }
            }
        };
    }

    protected override FieldWithOrder GetResult(bool canceled)
    {
        if (canceled || _selected.Value == null) return new FieldWithOrder(0);

        return new FieldWithOrder(_selected.Value.Id, _orderByDesc.Value);
    }
}