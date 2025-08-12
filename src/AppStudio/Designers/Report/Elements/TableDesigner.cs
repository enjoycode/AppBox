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

    internal TableLayout TableLayout { get; private set; }

    protected override bool IsContainer => true;

    protected override void OnAddToSurface()
    {
        base.OnAddToSurface();

        //TODO:暂在这里绑定选择改变事件
        Surface!.SelectionService.SelectionChanged += OnSelectionChanged;

        //TODO: 测试代码加入样式
        var sTableNormal = new StyleRule();
        sTableNormal.Style.Color = PixUI.Colors.Black;
        sTableNormal.Style.BorderStyle.Default = BorderType.Solid;
        sTableNormal.Style.BorderColor.Default = PixUI.Colors.Black;
        sTableNormal.Style.BorderWidth.Default = ReportSize.Pixel(1);
        sTableNormal.AddSelector(new StyleSelector(typeof(Table), "Normal.TableNormal"));
        ReportItem.Report.StyleSheet.Add(sTableNormal);

        var sTableBody = new StyleRule();
        sTableBody.Style.Color = PixUI.Colors.Black;
        sTableBody.Style.BorderStyle.Default = BorderType.Solid;
        sTableBody.Style.BorderColor.Default = PixUI.Colors.Black;
        sTableBody.Style.BorderWidth.Default = ReportSize.Pixel(1);
        ISelector[] selectors =
            [new TypeSelector(typeof(Table)), new StyleSelector(typeof(ReportItem), "Normal.TableBody")];
        sTableBody.AddSelector(new DescendantSelector(selectors));
        ReportItem.Report.StyleSheet.Add(sTableBody);

        var sTableHeader = new StyleRule();
        sTableHeader.Style.VerticalAlign = VerticalAlign.Middle;
        sTableHeader.Style.Color = PixUI.Colors.Black;
        sTableHeader.Style.BorderStyle.Default = BorderType.Solid;
        sTableHeader.Style.BorderColor.Default = PixUI.Colors.Black;
        sTableHeader.Style.BorderWidth.Default = ReportSize.Pixel(1);
        selectors = [new TypeSelector(typeof(Table)), new StyleSelector(typeof(ReportItem), "Normal.TableHeader")];
        sTableHeader.AddSelector(new DescendantSelector(selectors));
        ReportItem.Report.StyleSheet.Add(sTableHeader);

        //初始化Table
        InitNewTable(Bounds.Size);
    }

    protected override void OnRemoveFromSurface()
    {
        //TODO:暂在这里移除选择改变事件
        Surface!.SelectionService.SelectionChanged -= OnSelectionChanged;

        base.OnRemoveFromSurface();
    }

    private void InitNewTable(Size size)
    {
        var colWidth = ReportSize.Pixel(Math.Round(size.Width / 3));
        var rowHeight = ReportSize.Pixel(Math.Round(size.Height / 2));

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

    private void OnSelectionChanged(object? sender, EventArgs args)
    {
        //TODO:
        // var selectionService = (SelectionService)sender;
        //
        // var list = new List<TableLayout.Cell>();
        // foreach (var component in selectionService.SelectedItems)
        // {
        //     var item = component as ReportItemDesigner;
        //     if (null != item && item.ReportItem.Parent == this.Table)
        //     {
        //         var cell = this.TableLayout.GetCell(item.ReportItem);
        //         if (null != cell)
        //         {
        //             list.Add(cell);
        //         }
        //     }
        //
        //     //if (component is TableLayout.TableMember)
        //     //{
        //     //    Debug.Assert(false,
        //     //                 "Since we select Member's cells, instead of the Member itself, we should never have Table.Row/Column selected");
        //     //    foreach (var cell in (IEnumerable<TableLayout.Cell>)component)
        //     //    {
        //     //        if (null == cell.MergeTarget)
        //     //        {
        //     //            list.Add(cell);
        //     //        }
        //     //    }
        //     //}
        // }
        //
        // TableLayout.SetSelectedCells(list);
    }

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
        public TableDesigner Designer { get; private set; }

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
                _tableLayout = tableLayout;
            }

            private readonly DesignerTableLayout _tableLayout;
        }
    }

    #endregion
}