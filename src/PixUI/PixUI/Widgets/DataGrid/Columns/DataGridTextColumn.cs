using System;

namespace PixUI
{
    public sealed class DataGridTextColumn<T> : DataGridColumn<T>
    {
        public DataGridTextColumn(string label, Func<T, string> cellValueGetter,
            ColumnWidth? width = null,
            CellStyle? headerCellStyle = null, CellStyle? cellStyle = null,
            Func<T, int, CellStyle>? cellStyleGetter = null, bool frozen = false) :
            base(label, width, headerCellStyle, cellStyle, cellStyleGetter, frozen)
        {
            _cellValueGetter = cellValueGetter;
        }

        private readonly Func<T, string> _cellValueGetter;

        internal override void PaintCell(Canvas canvas, DataGridController<T> controller,
            int rowIndex, Rect cellRect)
        {
            var row = controller.DataView![rowIndex];
            var cellValue = _cellValueGetter(row);
            if (string.IsNullOrEmpty(cellValue)) return;

            var style = CellStyleGetter != null
                ? CellStyleGetter(row, rowIndex)
                : CellStyle ?? controller.Theme.DefaultRowCellStyle;

            //TODO: cache cell paragraph
            using var ph = BuildCellParagraph(cellRect, style, cellValue, 1);
            PaintCellParagraph(canvas, cellRect, style, ph);
        }
    }
}