using AppBox.Reporting;
using AppBox.Reporting.Drawing;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

/// <summary>
/// 表格设计器专用的选择装饰器
/// </summary>
internal sealed class TableSelectionAdorner : DesignAdorner, ISelectionAdorner
{
    private const float OFFSET = 10;
    private IElement? _hitTestElement;

    public TableSelectionAdorner(DesignAdorners owner, TableDesigner target) : base(owner, target) { }

    protected override void OnRender(Canvas canvas)
    {
        //画顶部灰条
        var topRect = Rect.FromLTWH(-OFFSET, -OFFSET, Target.Bounds.Width + OFFSET, OFFSET);
        canvas.FillRectangle(new(240, 240, 240), topRect);
        //画左侧灰条
        var leftRect = Rect.FromLTWH(-OFFSET, 0, OFFSET, Target.Bounds.Height);
        canvas.FillRectangle(new(240, 240, 240), leftRect);

        //画顶部列边框
        var tableLayout = ((TableDesigner)Target).TableLayout;
        var x = 0f;
        for (var i = 0; i < tableLayout.Columns.Count; i++)
        {
            var column = tableLayout.Columns[i];
            canvas.DrawRectangle(ReportDesignSettings.SelectionColor, 1.0f,
                Rect.FromLTWH(x, -OFFSET, column.Size.FPixels, OFFSET));
            x += column.Size.FPixels;
        }

        //画左侧行边框
        var y = 0f;
        for (var i = 0; i < tableLayout.Rows.Count; i++)
        {
            var row = tableLayout.Rows[i];
            canvas.DrawRectangle(ReportDesignSettings.SelectionColor, 1.0f,
                Rect.FromLTWH(-OFFSET, y, OFFSET, row.Size.FPixels));
            y += row.Size.FPixels;
        }

        //画左上边框
        canvas.DrawRectangle(ReportDesignSettings.SelectionColor, 1.0f,
            Rect.FromLTWH(-OFFSET, -OFFSET, OFFSET, OFFSET));

        //画选择的Cell
        foreach (var cell in tableLayout.GetSelectedCells())
        {
            var cellBounds = Rect.FromLTWH(cell.Bounds.Left.FPixels, cell.Bounds.Top.FPixels,
                cell.Bounds.Width.FPixels, cell.Bounds.Height.FPixels);
            canvas.DrawRectangle(ReportDesignSettings.SelectionColor, 2.0f, cellBounds);
        }
    }

    private List<IElement> GetElements()
    {
        //TODO:参照TableDesigner.GetGlyphs()方法重构
        var ls = new List<IElement>();
        var tableLayout = ((TableDesigner)Target).TableLayout;
        //加入列ResizeHandle
        var x = 0f;
        for (var i = 0; i < tableLayout.Columns.Count; i++)
        {
            var column = tableLayout.Columns[i];
            var resizeHandle = new ResizeHandle()
            {
                Bounds = Rect.FromLTWH(x + column.Size.FPixels - ReportDesignSettings.HandleSize / 2, -OFFSET,
                    ReportDesignSettings.HandleSize, OFFSET),
                Cursor = Cursors.ResizeLR,
                Target = column
            };
            ls.Add(resizeHandle);
            x += column.Size.FPixels;
        }

        //加入行ResizeHandle
        var y = 0f;
        for (var i = 0; i < tableLayout.Rows.Count; i++)
        {
            var row = tableLayout.Rows[i];
            var resizeHandle = new ResizeHandle()
            {
                Bounds = Rect.FromLTWH(-OFFSET, y + row.Size.FPixels - ReportDesignSettings.HandleSize / 2,
                    OFFSET, ReportDesignSettings.HandleSize),
                Cursor = Cursors.ResizeUD,
                Target = row
            };
            ls.Add(resizeHandle);
            y += row.Size.FPixels;
        }

        //加入MoveTableHandle
        var moveHandle = new MoveTableHandle()
        {
            Bounds = Rect.FromLTWH(-OFFSET, -OFFSET, OFFSET, OFFSET),
            Cursor = Cursors.Hand,
        };
        ls.Add(moveHandle);

        return ls;
    }

    protected override bool HitTest(Point pt, ref Cursor? cursor)
    {
        var ls = GetElements();
        IElement? hitElement = null;
        Cursor? hitCursor = null;
        for (var i = 0; i < ls.Count; i++)
        {
            if (ls[i].HitTest(pt, ref hitCursor))
            {
                hitElement = ls[i];
            }
        }

        if (hitElement != null)
        {
            cursor = hitCursor;
            _hitTestElement = hitElement;
            return true;
        }

        _hitTestElement = null;
        return false;
    }

    protected override void OnMouseDown(PointerEvent e)
    {
        base.OnMouseDown(e);

        if (_hitTestElement is MoveTableHandle)
        {
            //选中整个表格
            Target.Surface!.SelectionService.SelectItem(Target);
        }
    }

    protected override void OnMouseMove(PointerEvent e)
    {
        if (_hitTestElement == null)
            return;

        if (_hitTestElement is ResizeHandle resizeHandle)
        {
            if (resizeHandle.Target is TableLayout.Column column)
            {
                //resize column width
                column.Size += Scalar.Pixel(e.DeltaX);
            }
            else if (resizeHandle.Target is TableLayout.Row row)
            {
                //resize row height
                row.Size += Scalar.Pixel(e.DeltaY);
            }

            ((IReportItemDesigner)Target).Invalidate();
        }
        else if (_hitTestElement is MoveTableHandle)
        {
            var table = (TableDesigner)Target;
            table.Move((int)Math.Round(e.DeltaX), (int)Math.Round(e.DeltaY));
        }
    }

    private interface IElement
    {
        bool HitTest(Point pt, ref Cursor? cursor);
    }

    #region ====Handles====

    private abstract class HandleBase : IElement
    {
        public Rect Bounds { get; init; }
        public Cursor Cursor { get; init; } = null!;

        public bool HitTest(Point pt, ref Cursor? cursor)
        {
            if (Bounds.Contains(pt))
            {
                cursor = Cursor;
                return true;
            }

            return false;
        }
    }

    /// <summary>
    /// 用于Resize Table's Column or Row
    /// </summary>
    private sealed class ResizeHandle : HandleBase
    {
        public TableLayout.TableMember Target { get; init; } = null!;
    }

    /// <summary>
    /// 用于移动表格位置
    /// </summary>
    private sealed class MoveTableHandle : HandleBase { }

    #endregion
}