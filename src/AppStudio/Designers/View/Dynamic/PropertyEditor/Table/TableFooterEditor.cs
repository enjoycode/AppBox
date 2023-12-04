using System;
using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class TableFooterEditor : SingleChildWidget
{
    public TableFooterEditor(RxObject<TableFooterCell> obj)
    {
        //_element = element;
        var type = obj.Observe(nameof(TableFooterCell.Type),
            s => s.Type, (s, v) => s.Type = v);
        var begin = obj.Observe(nameof(TableFooterCell.BeginColumn),
            s => s.BeginColumn, (s, v) => s.BeginColumn = v);
        var end = obj.Observe(nameof(TableFooterCell.EndColumn),
            s => s.EndColumn, (s, v) => s.EndColumn = v);
        var text = obj.Observe(nameof(TableFooterCell.Text),
            s => s.Text, (s, v) => s.Text = v);

        Child = new Form()
        {
            LabelWidth = 95,
            Children =
            {
                new("Type:", new Select<string>(type.ToComputed(
                    c => c.ToString(),
                    v => type.Value = Enum.Parse<TableFooterCellType>(v))!)
                {
                    Options = Enum.GetNames(typeof(TableFooterCellType))
                }),
                new("BeginColumn:", new NumberInput<int>(begin)),
                new("EndColumn:", new NumberInput<int>(end)),
                new("Text:", new TextInput(text)),
            }
        };
    }
}