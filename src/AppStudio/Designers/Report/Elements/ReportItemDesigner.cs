using AppBox.Reporting;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal abstract class ReportItemDesigner : DiagramItem
{
    internal abstract ReportItem ReportItem { get; }

    internal bool IsTableCell => ReportItem.Parent is Table;

    public override DesignBehavior DesignBehavior => IsTableCell ? DesignBehavior.None : base.DesignBehavior;

    public override Rect Bounds
    {
        get
        {
            if (IsTableCell)
            {
                throw new NotImplementedException();
                // TableDesignerBase tableDesigner = this.Parent as TableDesignerBase;
                // if (null != tableDesigner)
                // {
                //     TableLayout.Cell tableCell = tableDesigner.TableLayout.GetCell(this.ReportItem);
                //     if (null != tableCell)
                //     {
                //         return Rect.FromLTWH(tableCell.Bounds.Left.FPixels, tableCell.Bounds.Top.FPixels,
                //             tableCell.Bounds.Width.FPixels, tableCell.Bounds.Height.FPixels);
                //     }
                // }
            }

            return Rect.FromLTWH(ReportItem.Left.Pixels, ReportItem.Top.Pixels,
                ReportItem.Width.Pixels, ReportItem.Height.Pixels);
        }
        set
        {
            if (IsTableCell)
                return;

            SetBounds(value.X, value.Y, value.Width, value.Height, BoundsSpecified.All);
        }
    }

    public override void Paint(Canvas canvas)
    {
        canvas.FillRectangle(ReportItem.Style.BackgroundColor, Bounds);
        canvas.DrawRectangle(new(173, 219, 241), 1.0f, Bounds);
    }

    protected override void OnAddToSurface()
    {
        base.OnAddToSurface();

        if (Parent is IReportItemDesigner parent && this is IReportItemDesigner child)
        {
            if (child.ReportItem.Parent == null)
                parent.ReportItem.Items.Add(child.ReportItem);
        }
    }

    protected override void OnRemoveFromSurface()
    {
        base.OnRemoveFromSurface();

        if (Parent is IReportItemDesigner parent && this is IReportItemDesigner child)
        {
            parent.ReportItem.Items.Remove(child.ReportItem);
        }
    }
}