using System.Text.Json.Serialization;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public sealed class DynamicTable : SingleChildWidget, IDataSetBinder
{
    public DynamicTable()
    {
        Child = new DataGrid<DynamicEntity>(Controller);
    }

    private string? _dataset;
    private TableColumnSettings[]? _columns;
    private TableFooterCell[]? _footer;

    [JsonIgnore] internal DataGridController<DynamicEntity> Controller { get; } = new();

    /// <summary>
    /// 绑定的数据集名称
    /// </summary>
    public string? DataSet
    {
        get => _dataset;
        set
        {
            _dataset = value;
            if (IsMounted)
                Fetch();
        }
    }

    public TableColumnSettings[]? Columns
    {
        get => _columns;
        set
        {
            _columns = value;
            OnColumnsChanged();
        }
    }

    public TableFooterCell[]? Footer
    {
        get => _footer;
        set
        {
            _footer = value;
            OnFooterChanged();
        }
    }

    private void OnColumnsChanged()
    {
        Controller.Columns.Clear();
        if (_columns != null)
        {
            foreach (var column in _columns)
            {
                Controller.Columns.Add(column.BuildColumn());
            }
        }
    }

    private void OnFooterChanged()
    {
        Controller.DataGrid.FooterCells = null;
        if (_footer is { Length: > 0 })
        {
            var cells = new DataGridFooterCell[_footer.Length];
            for (var i = 0; i < cells.Length; i++)
            {
                cells[i] = _footer[i].Build(this);
            }

            Controller.DataGrid.FooterCells = cells;
        }
    }

    protected override void OnMounted() => Fetch();

    private async void Fetch()
    {
        if (string.IsNullOrEmpty(DataSet))
        {
            Controller.DataSource = null;
            return;
        }

        var dynamicView = FindParent(w => w is IDynamicView) as IDynamicView;
        if (dynamicView == null) return;

        var ds = (DynamicDataSet?)await dynamicView.GetDataSet(DataSet);
        Controller.DataSource = ds;
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

    #region ====IDataSetBinder====

    string IDataSetBinder.DataSetPropertyName => nameof(DataSet);

    void IDataSetBinder.OnDataSetChanged()
    {
        _columns = null;
        _footer = null;
    }

    #endregion
}