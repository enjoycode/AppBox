using System.Collections.Generic;
using System.Linq;

namespace PixUI
{
    public sealed class DataGridGroupColumn<T> : DataGridColumn<T>
    {
        public DataGridGroupColumn(string label, IList<DataGridColumn<T>> children,
            ColumnWidth? width = null,
            CellStyle? headerCellStyle = null, bool frozen = false) :
            base(label, width, headerCellStyle, null, null, frozen)
        {
            Children = children;
        }

        public readonly IList<DataGridColumn<T>> Children;

        internal override float LayoutWidth => Children.Sum(c => c.LayoutWidth);
    }
}