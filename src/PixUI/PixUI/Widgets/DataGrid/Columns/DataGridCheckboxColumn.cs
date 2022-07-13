using System;

namespace PixUI
{
    public sealed class DataGridCheckboxColumn<T> : DataGridHostColumn<T>
    {
        public DataGridCheckboxColumn(string label,
            Func<T, bool> cellValueGetter,
            Action<T, bool>? cellValueSetter = null,
            ColumnWidth? width = null, CellStyle? headerCellStyle = null,
            CellStyle? cellStyle = null, Func<T, int, CellStyle>? cellStyleGetter = null,
            bool frozen = false)
            : base(label, (data, _) =>
                {
                    var state = new RxProperty<bool>(() => cellValueGetter(data),
                        cellValueSetter == null ? null : v => cellValueSetter(data, v));
                    return new Checkbox(state);
                },
                width, headerCellStyle, cellStyle, cellStyleGetter, frozen) { }
    }
}