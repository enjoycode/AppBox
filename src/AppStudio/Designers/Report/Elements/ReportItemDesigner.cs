using AppBox.Reporting;
using AppBox.Reporting.Drawing;
using AppBoxDesign.Diagram.PropertyEditors;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal abstract class ReportItemDesigner<T> : ReportObjectDesigner<T> where T : ReportItem
{
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

        ReportItem.PropertyChange += OnReportItemPropertyChanged;
    }

    protected override void OnRemoveFromSurface()
    {
        base.OnRemoveFromSurface();

        if (Parent is IReportItemDesigner parent && this is IReportItemDesigner child)
        {
            parent.ReportItem.Items.Remove(child.ReportItem);
        }

        ReportItem.PropertyChange -= OnReportItemPropertyChanged;
    }

    /// <summary>
    /// 目前用于布局属性发生变更时通知属性面板刷新相应的值
    /// </summary>
    private void OnReportItemPropertyChanged(object sender, PropertyChangeEventArgs e)
    {
        // refresh PropertyPanel's Layout properties
        var designService = GetRootDesigner()?.DesignService;
        if (designService == null)
            return;

        if (e.Name is "Location" or "Size")
        {
            designService.PropertyPanel.RefreshLayoutProperties();
        }
    }

    /// <summary>
    /// 获取布局属性组
    /// </summary>
    protected DiagramPropertyGroup GetLayoutPropertyGroup()
    {
        if (IsTableCell) throw new NotSupportedException();

        var ownerIsTable = false; //TODO: this is TableDesigner;
        var properties = ownerIsTable ? new IDiagramProperty[2] : new IDiagramProperty[4];
        properties[0] = new ReportDiagramProperty(this, "Left", nameof(ReportSizeEditor))
        {
            ValueGetter = () => ReportItem.Left,
            ValueSetter = v => ReportItem.Left = (ReportSize)v!
        };
        properties[1] = new ReportDiagramProperty(this, "Top", nameof(ReportSizeEditor))
        {
            ValueGetter = () => ReportItem.Top,
            ValueSetter = v => ReportItem.Top = (ReportSize)v!
        };
        if (!ownerIsTable)
        {
            properties[2] = new ReportDiagramProperty(this, "Width", nameof(ReportSizeEditor))
            {
                ValueGetter = () => ReportItem.Width,
                ValueSetter = v => ReportItem.Width = (ReportSize)v!
            };
            properties[3] = new ReportDiagramProperty(this, "Height", nameof(ReportSizeEditor))
            {
                ValueGetter = () => ReportItem.Height,
                ValueSetter = v => ReportItem.Height = (ReportSize)v!
            };
        }

        return new DiagramPropertyGroup() { GroupName = "Layout", Properties = properties };
    }

    /// <summary>
    /// 获取样式属性组
    /// </summary>
    /// <returns></returns>
    protected DiagramPropertyGroup GetStylePropertyGroup() => new()
    {
        GroupName = "Style",
        Properties =
        [
            new ReportDiagramProperty(this, "FontSize", nameof(ReportSizeEditor))
            {
                ValueGetter = () => ReportItem.Style.Font.Size,
                ValueSetter = v => ReportItem.Style.Font.Size = (ReportSize)v!
            },
            new ReportDiagramProperty(this, "Color", nameof(ColorEditor))
            {
                ValueGetter = () => ReportItem.Style.Color,
                ValueSetter = v => ReportItem.Style.Color = (Color)v!
            },
            new ReportDiagramProperty(this, "TextAlign", nameof(EnumEditor), typeof(HorizontalAlign))
            {
                ValueGetter = () => ReportItem.Style.TextAlign,
                ValueSetter = v => ReportItem.Style.TextAlign = (HorizontalAlign)v!
            },
            new ReportDiagramProperty(this, "VerticalAlign", nameof(EnumEditor), typeof(VerticalAlign))
            {
                ValueGetter = () => ReportItem.Style.VerticalAlign,
                ValueSetter = v => ReportItem.Style.VerticalAlign = (VerticalAlign)v!
            },
        ]
    };
}