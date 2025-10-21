using System;
using System.Collections.Generic;
using System.Linq;
using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditors;

internal class TableColumnEditor<T> : SingleChildWidget where T : TableColumnSettings, new()
{
    internal TableColumnEditor(RxObject<T> column, DesignElement element)
    {
        Column = column;
        Element = element;

        var label = column.Observe(nameof(TextColumnSettings.Label),
            s => s.Label, (s, v) => s.Label = v);

        // ReSharper disable once VirtualMemberCallInConstructor
        var extProps = GetExtProps().ToArray();
        var formItems = new List<FormItem>
        {
            new("Label:", new TextInput(label)),
        };
        if (typeof(T) != typeof(GroupColumnSettings))
        {
            var width = column.Observe(nameof(TextColumnSettings.Width),
                s => s.Width, (s, v) => s.Width = v);
            var hAlign = column.Observe(nameof(TextColumnSettings.HorizontalAlignment),
                s => s.HorizontalAlignment, (s, v) => s.HorizontalAlignment = v);
            var vAlign = column.Observe(nameof(TextColumnSettings.VerticalAlignment),
                s => s.VerticalAlignment, (s, v) => s.VerticalAlignment = v);

            formItems.Add(new("Width:", new TextInput(width)));
            formItems.Add(new("HAlign:", new EnumSelect<HorizontalAlignment>(hAlign)));
            formItems.Add(new("VAlign:", new EnumSelect<VerticalAlignment>(vAlign)));
        }

        formItems.AddRange(extProps.Select(prop => new FormItem(prop.Item1, prop.Item3)));

        Child = new Form
        {
            LabelWidth = 90,
            Children = formItems,
        };
    }

    protected readonly RxObject<T> Column;
    protected readonly DesignElement Element;

    protected virtual IEnumerable<ValueTuple<string, State, Widget>> GetExtProps()
    {
        yield break;
    }
}