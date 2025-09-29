using AppBox.Reporting;
using AppBox.Reporting.Drawing;
using PixUI;
using PixUI.Diagram;
using TextBox = AppBox.Reporting.TextBox;

namespace AppBoxDesign;

internal sealed class TableDesigner : ReportItemDesigner<Table>
{
    public TableDesigner() : this(new Table()) { }

    public TableDesigner(Table table)
    {
        ReportItem = table;
        TableLayout = new DesignerTableLayout(this);
        TableLayout.Refresh();
    }

    internal TableLayout TableLayout { get; }

    protected override bool IsContainer => true;

    protected override void OnCreated()
    {
        //TODO: 测试代码加入样式
        var sTableNormal = new StyleRule();
        sTableNormal.Style.Color = PixUI.Colors.Black;
        sTableNormal.Style.BorderStyle.Default = BorderType.Solid;
        sTableNormal.Style.BorderColor.Default = PixUI.Colors.Black;
        sTableNormal.Style.BorderWidth.Default = Scalar.Pixel(1);
        sTableNormal.AddSelector(new StyleSelector(typeof(Table), "Normal.TableNormal"));
        ReportItem.Report!.StyleSheet.Add(sTableNormal);

        var sTableBody = new StyleRule();
        sTableBody.Style.Color = PixUI.Colors.Black;
        sTableBody.Style.BorderStyle.Default = BorderType.Solid;
        sTableBody.Style.BorderColor.Default = PixUI.Colors.Black;
        sTableBody.Style.BorderWidth.Default = Scalar.Pixel(1);
        ISelector[] selectors =
            [new TypeSelector(typeof(Table)), new StyleSelector(typeof(ReportItem), "Normal.TableBody")];
        sTableBody.AddSelector(new DescendantSelector(selectors));
        ReportItem.Report.StyleSheet.Add(sTableBody);

        var sTableHeader = new StyleRule();
        sTableHeader.Style.VerticalAlign = VerticalAlign.Middle;
        sTableHeader.Style.TextAlign = HorizontalAlign.Center;
        sTableHeader.Style.Color = PixUI.Colors.Black;
        sTableHeader.Style.BorderStyle.Default = BorderType.Solid;
        sTableHeader.Style.BorderColor.Default = PixUI.Colors.Black;
        sTableHeader.Style.BorderWidth.Default = Scalar.Pixel(1);
        selectors = [new TypeSelector(typeof(Table)), new StyleSelector(typeof(ReportItem), "Normal.TableHeader")];
        sTableHeader.AddSelector(new DescendantSelector(selectors));
        ReportItem.Report.StyleSheet.Add(sTableHeader);

        //初始化Table
        InitNewTable(Bounds.Size);
    }

    private void InitNewTable(Size size)
    {
        var colWidth = Scalar.Pixel(Math.Round(size.Width / 3));
        var rowHeight = Scalar.Pixel(Math.Round(size.Height / 2));

        // 1. add cells
        ReportItem.StyleName = "Normal.TableNormal";

        for (var i = 0; i < 3; i++)
        {
            ReportItem.Body.Cells.Add(new TableCell()
            {
                RowIndex = 0, ColumnIndex = i, ReportItem = new TextBox() { StyleName = "Normal.TableBody" }
            });
        }

        for (var i = 0; i < 3; i++)
        {
            ReportItem.Body.Columns.Add(new TableBodyColumn(colWidth));
        }

        ReportItem.Body.Rows.Add(new TableBodyRow(rowHeight));

        ReportItem.RowGroups.Add(new TableGroup() { Name = "detailTableGroup" });
        ReportItem.RowGroups[0].Groupings.Add(new Grouping());

        for (var i = 0; i < 3; i++)
        {
            ReportItem.ColumnGroups.Add(new TableGroup()
                {
                    ReportItem = new TextBox()
                    {
                        Height = rowHeight, Value = $"Head{i + 1}", StyleName = "Normal.TableHeader"
                    }
                }
            );
        }

        // 2. layout
        TableLayout.Refresh();

        // 3. add design time items
        for (var i = 0; i < TableLayout.Rows.Count; i++)
        {
            foreach (var cell in TableLayout.Rows[i].Cells)
            {
                if (cell.ReportItem != null!)
                {
                    var designer = DesignerFactory.CreateDesigner(cell.ReportItem);
                    AddItem(designer);
                }
            }
        }
    }

    protected override void OnAddToSurface()
    {
        base.OnAddToSurface();

        //绑定选择改变事件
        Surface!.SelectionService.SelectionChanged += OnSelectionChanged;
    }

    protected override void OnRemoveFromSurface()
    {
        //移除选择改变事件
        Surface!.SelectionService.SelectionChanged -= OnSelectionChanged;

        base.OnRemoveFromSurface();
    }

    private void OnSelectionChanged(object? sender, EventArgs args)
    {
        var selectionService = (SelectionService)sender!;

        var list = new List<TableLayout.Cell>();
        foreach (var component in selectionService.SelectedItems)
        {
            if (component is IReportItemDesigner item && item.ReportItem.Parent == ReportItem)
            {
                var cell = TableLayout.GetCell((ReportItem)item.ReportItem);
                if (null != cell)
                    list.Add(cell);
            }

            //if (component is TableLayout.TableMember)
            //{
            //    Debug.Assert(false,
            //                 "Since we select Member's cells, instead of the Member itself, we should never have Table.Row/Column selected");
            //    foreach (var cell in (IEnumerable<TableLayout.Cell>)component)
            //    {
            //        if (null == cell.MergeTarget)
            //        {
            //            list.Add(cell);
            //        }
            //    }
            //}
        }

        TableLayout.SetSelectedCells(list);
    }

    protected override ISelectionAdorner GetSelectionAdorner(DesignAdorners adorners)
    {
        return SelectionAdorner ??= new TableSelectionAdorner(adorners, this);
    }

    #region ====Cell Selection====

    private Point _startPos = Point.Empty;
    private Point _endPos = Point.Empty;

    /// <summary>
    /// Begins the cell selection.
    /// </summary>
    /// <param name="x">Surface坐标系.</param>
    /// <param name="y">Surface坐标系.</param>
    internal void BeginCellSelection(float x, float y)
    {
        _startPos = _endPos = PointToClient(new Point(x, y));
    }

    /// <summary>
    /// 用于Mouse拖动时选择单元格
    /// </summary>
    internal void MoveCellSelection(float deltaX, float deltaY)
    {
        _endPos.X += deltaX;
        _endPos.Y += deltaY;

        var dragRect = Rect.FromLTWH(Math.Min(_startPos.X, _endPos.X)
            , Math.Min(_startPos.Y, _endPos.Y)
            , Math.Abs(_endPos.X - _startPos.X)
            , Math.Abs(_endPos.Y - _startPos.Y));

        var cells = GetCellsInBounds(dragRect);
        Surface!.SelectionService.SelectItems(cells);
    }

    private DiagramItem[] GetCellsInBounds(Rect dragRect)
    {
        return Items.Where(item => dragRect.IntersectsWith(item.Bounds)).ToArray();
    }

    #endregion

    public override void Paint(Canvas canvas)
    {
        canvas.Translate(Bounds.X, Bounds.Y);

#if DEBUG
        // //测试画各个Cell
        // foreach (var cell in TableLayout.Cells)
        // {
        //     var x = cell.Bounds.Left.Pixels;
        //     var y = cell.Bounds.Top.Pixels;
        //     var width = cell.Bounds.Width.Pixels;
        //     var height = cell.Bounds.Height.Pixels;
        //     canvas.DrawRectangle(PixUI.Colors.Black, 0.5f, Rect.FromLTWH(x, y, width, height));
        // }
#endif

        foreach (var item in Items)
        {
            item.Paint(canvas);
        }

        canvas.Translate(-Bounds.X, -Bounds.Y);
    }

    #region ====DesignerTableLayout & DesignCell class====

    private sealed class DesignerTableLayout : TableLayout
    {
        public TableDesigner Designer { get; }

        public DesignerTableLayout(TableDesigner designer) : base(designer.ReportItem)
        {
            Designer = designer;
        }

        protected override Cell CreateCell(int rowIndex, int colIndex) => new DesignCell(this, rowIndex, colIndex);

        private sealed class DesignCell : Cell
        {
            public DesignCell(DesignerTableLayout tableLayout, int rowIndex, int colIndex)
                : base(tableLayout, rowIndex, colIndex)
            {
                // _tableLayout = tableLayout;
            }

            // private readonly DesignerTableLayout _tableLayout;
        }
    }

    #endregion
}