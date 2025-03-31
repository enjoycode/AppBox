using System.Text.Json.Serialization;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public sealed class DynamicTableView : SingleChildWidget, IDataSourceBinder
{
    public DynamicTableView()
    {
        Child = new DataGrid<DynamicRow>(Controller);
    }

    private string? _dataSource;
    private TableColumnSettings[]? _columns;
    private TableFooterCell[]? _footer;
    private TableStyles? _styles;
    [JsonIgnore] private IDynamicContext? _dynamicContext;

    [JsonIgnore] internal DataGridController<DynamicRow> Controller { get; } = new();

    /// <summary>
    /// 绑定的数据源名称
    /// </summary>
    public string? DataSource
    {
        get => _dataSource;
        set
        {
            //设计时改变了重置并取消监听数据集变更
            if (IsMounted && !string.IsNullOrEmpty(_dataSource))
            {
                _columns = null;
                _footer = null;
                _dynamicContext?.UnbindFromDataSource(this, _dataSource);
            }

            _dataSource = value;

            if (IsMounted)
                Fetch();
        }
    }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public TableStyles? Styles
    {
        get => _styles;
        set
        {
            _styles = value;
            Controller.Theme = _styles == null ? DataGridTheme.Default : _styles.ToRuntimeStyles();

            if (_columns is { Length: > 0 })
                Controller.Refresh();
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

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
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
                Controller.Columns.Add(column.BuildColumn(Controller));
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

    protected override void OnMounted()
    {
        base.OnMounted();
        //监听目标数据集变更
        _dynamicContext = FindParent(w => w is IDynamicContext) as IDynamicContext;
        _dynamicContext?.BindToDataSource(this, _dataSource);
        //填充数据集
        Fetch();
    }

    protected override void OnUnmounted()
    {
        //取消监听数据集变更
        _dynamicContext?.UnbindFromDataSource(this, _dataSource);
        base.OnUnmounted();
    }

    private async void Fetch()
    {
        if (string.IsNullOrEmpty(DataSource))
        {
            Controller.DataSource = null;
            return;
        }

        if (_dynamicContext == null) return;

        var ds = (DynamicTable?)await _dynamicContext.GetDataSource(DataSource);
        Controller.DataSource = ds;
    }

    public override void Paint(Canvas canvas, IDirtyArea? area = null)
    {
        if (_columns == null || _columns.Length == 0)
        {
            var rect = Rect.FromLTWH(0, 0, W, H);
            var borderColor = DataGridTheme.Default.BorderColor;

            DataGridPainter.PaintCellBorder(canvas, rect, borderColor);
            using var ph = DataGridPainter.BuildCellParagraph(rect, CellStyle.AlignCenter(),
                Controller.Theme.DefaultRowCellStyle, "No Columns for Table", 1);
            DataGridPainter.PaintCellParagraph(canvas, rect, DataGridTheme.Default.DefaultRowCellStyle, ph);
            return;
        }

        base.Paint(canvas, area);
    }

    #region ====IDataSourceBinder====

    void IDataSourceBinder.OnDataChanged(bool isReset)
    {
        if (!isReset)
        {
            Fetch();
        }
        else
        {
            Columns = null;
            if (Parent is IDesignElement designElement)
                designElement.Data.RemovePropertyValue(nameof(Columns));
        }
    }

    #endregion
}