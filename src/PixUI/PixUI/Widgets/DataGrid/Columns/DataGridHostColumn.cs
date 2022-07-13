using System;
using System.Collections.Generic;

namespace PixUI
{
    /// <summary>
    /// 用于承载Widget的列
    /// </summary>
    public class DataGridHostColumn<T> : DataGridColumn<T>
    {
        public DataGridHostColumn(string label, Func<T, int, Widget> cellBuilder) : base(label)
        {
            _cellBuilder = cellBuilder;
        }

        private readonly Func<T, int, Widget> _cellBuilder;
        private readonly List<CellCachedWidget> _cellWidgets = new List<CellCachedWidget>();

        internal override void PaintCell(Canvas canvas, DataGridController<T> controller,
            int rowIndex, Rect cellRect)
        {
            var cellWidget = GetCellWidget(rowIndex, controller, cellRect);
            //TODO:对齐cellWidget
            canvas.Translate(cellRect.Left, cellRect.Top);
            cellWidget.Paint(canvas, null);
            canvas.Translate(-cellRect.Left, -cellRect.Top);
        }

        /// <summary>
        /// 从缓存中获取承载的Widget,没有则新建并加入缓存
        /// </summary>
        private Widget GetCellWidget(int rowIndex, DataGridController<T> controller,
            in Rect cellRect)
        {
            var pattern = new CellCachedWidget(rowIndex, null);
            var index = _cellWidgets.BinarySearch(pattern, CellCachedWidgetComparer.Default);
            if (index >= 0)
                return _cellWidgets[index].Widget!;

            index = ~index;
            //没找到开始新建
            var row = controller.DataView![rowIndex];
            var cellWidget = _cellBuilder(row, rowIndex);
            cellWidget.Parent = controller.DataGrid;
            cellWidget.Layout(cellRect.Width, cellRect.Height);
            var cellCachedWidget = new CellCachedWidget(rowIndex, cellWidget);
            _cellWidgets.Insert(index, cellCachedWidget);
            return cellWidget;
        }
    }

    internal readonly struct CellCachedWidget
    {
        internal readonly int RowIndex;
        internal readonly Widget? Widget;

        internal CellCachedWidget(int rowIndex, Widget? widget)
        {
            RowIndex = rowIndex;
            Widget = widget;
        }
    }

    internal sealed class CellCachedWidgetComparer : IComparer<CellCachedWidget>
    {
        internal static readonly CellCachedWidgetComparer Default = new();

        public int Compare(CellCachedWidget x, CellCachedWidget y)
            => x.RowIndex.CompareTo(y.RowIndex);
    }
}