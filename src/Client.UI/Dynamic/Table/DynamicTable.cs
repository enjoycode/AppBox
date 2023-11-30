using AppBoxCore;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public sealed class DynamicTable : SingleChildWidget
{
    public DynamicTable()
    {
        Child = new DataGrid<DynamicEntity>(_dgController);
    }

    private readonly DataGridController<DynamicEntity> _dgController = new();
    private ColumnSettings[]? _columns;

    /// <summary>
    /// 绑定的数据集名称
    /// </summary>
    public string? DataSet { get; set; }

    public ColumnSettings[]? Columns
    {
        get => _columns;
        set
        {
            _columns = value;
            OnColumnsChanged();
        }
    }

    private void OnColumnsChanged()
    {
        _dgController.Columns.Clear();
        if (_columns != null)
        {
            foreach (var column in _columns)
            {
                _dgController.Columns.Add(column.BuildColumn());
            }
        }
    }

    protected override void OnMounted() => Fetch();

    private async void Fetch()
    {
        var dynamicView = FindParent(w => w is IDynamicView) as IDynamicView;
        if (dynamicView == null) return;

        var ds = (DynamicDataSet?)await dynamicView.GetDataSet(DataSet);
        if (ds == null) return;

        _dgController.DataSource = ds;
    }

    public override void Paint(Canvas canvas, IDirtyArea? area = null)
    {
        if (_columns == null || _columns.Length == 0)
        {
            var rect = Rect.FromLTWH(0, 0, W, H);
            var borderColor = DataGridTheme.Default.BorderColor;

            DataGridPainter.PaintCellBorder(canvas, rect, borderColor);
            using var ph = DataGridPainter.BuildCellParagraph(rect, CellStyle.AlignCenter(), "No Columns for Table", 1);
            DataGridPainter.PaintCellParagraph(canvas, rect, DataGridTheme.Default.DefaultRowCellStyle, ph);
            return;
        }

        base.Paint(canvas, area);
    }
}