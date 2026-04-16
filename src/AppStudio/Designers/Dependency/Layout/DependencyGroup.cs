using PixUI;

namespace AppBoxDesign.Dependency;

internal sealed class DependencyGroup
{
    public DependencyGroup(DependencyItem[] items, GroupPosition position)
    {
        _items = items;
        Position = position;
    }

    private readonly DependencyItem[] _items;
    public GroupPosition Position { get; }

    public float Width { get; private set; }
    public float Height { get; private set; }

    public void LayoutItems()
    {
        const int maxCount = 4;
        if (Position is GroupPosition.Top or GroupPosition.Bottom)
        {
            var rows = new List<GroupRow>();
            var rowIndex = 0;
            var y = 0f;
            const float sep = 16f;
            for (var i = 0; i < _items.Length;)
            {
                if (rowIndex != 0) y += sep;

                var rowSpan = _items.AsMemory(i, Math.Min(_items.Length - i, maxCount));
                rows.Add(new GroupRow(rowSpan, y));
                y += DependencyItem.ItemHeight;
                i += rowSpan.Length;
                rowIndex++;
            }

            //居中对齐行
            AlignRows(rows);

            Height = y;
            Width = rows.Max(row => row.Width);
        }
        else
        {
            var cols = new List<GroupColumn>();
            var colIndex = 0;
            var x = 0f;
            const float sep = 16f;
            for (var i = 0; i < _items.Length;)
            {
                if (colIndex != 0) x += sep;

                var colSpan = _items.AsMemory(i, Math.Min(_items.Length - i, maxCount));
                var colGroup = new GroupColumn(colSpan, x);
                cols.Add(colGroup);
                x += colGroup.Width;
                i += colSpan.Length;
                colIndex++;
            }

            //居中对齐列
            AlignColumns(cols);

            Height = cols.Max(col => col.Height);
            Width = x;
        }
    }

    public void Move(float offsetX, float offsetY)
    {
        foreach (var item in _items)
        {
            item.Location = new Point(item.Location.X + offsetX, item.Location.Y + offsetY);
        }
    }

    private static void AlignRows(List<GroupRow> rows)
    {
        var maxWidth = rows.Max(row => row.Width);
        foreach (var row in rows)
        {
            row.MoveOffsetX((maxWidth - row.Width) / 2);
        }
    }

    private static void AlignColumns(List<GroupColumn> columns)
    {
        var maxHeight = columns.Max(col => col.Height);
        foreach (var col in columns)
        {
            col.MoveOffsetY((maxHeight - col.Height) / 2);
        }
    }

    internal enum GroupPosition
    {
        Left,
        Top,
        Right,
        Bottom
    }

    private readonly struct GroupRow
    {
        public GroupRow(ReadOnlyMemory<DependencyItem> items, float y)
        {
            _items = items;

            const float sep = 16f;
            var x = 0f;
            var itemsSpan = items.Span;
            for (var i = 0; i < itemsSpan.Length; i++)
            {
                if (i != 0) x += sep;

                var item = itemsSpan[i];
                item.Location = new Point(x, y);
                x += item.Bounds.Width;
            }

            Width = x;
        }

        private readonly ReadOnlyMemory<DependencyItem> _items;
        public readonly float Width;

        public void MoveOffsetX(float offsetX)
        {
            foreach (var item in _items.Span)
            {
                item.Location = new Point(item.Location.X + offsetX, item.Location.Y);
            }
        }
    }

    private readonly struct GroupColumn
    {
        public GroupColumn(ReadOnlyMemory<DependencyItem> items, float x)
        {
            _items = items;

            const float sep = 16f;
            var y = 0f;
            var itemsSpan = items.Span;
            var maxWidth = 0f;
            for (var i = 0; i < itemsSpan.Length; i++)
            {
                if (i != 0) y += sep;

                var item = itemsSpan[i];
                item.Location = new Point(x, y);
                maxWidth = Math.Max(maxWidth, item.Bounds.Width);
                y += item.Bounds.Height;
            }

            Height = y;
            Width = maxWidth;
        }

        private readonly ReadOnlyMemory<DependencyItem> _items;
        public readonly float Height;
        public readonly float Width;

        public void MoveOffsetY(float offsetY)
        {
            foreach (var item in _items.Span)
            {
                item.Location = new Point(item.Bounds.X, item.Bounds.Y + offsetY);
            }
        }
    }
}