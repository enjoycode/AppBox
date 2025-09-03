using AppBox.Reporting;
using PixUI.Diagram;

namespace AppBoxDesign;

internal static class DesignerFactory
{
    private static readonly Dictionary<Type, Func<ReportItemBase, DiagramItem>> DesignerTypes = new()
    {
        { typeof(ReportHeader), t => new ReportSectionDesigner((ReportSectionBase)t) },
        { typeof(PageHeader), t => new ReportSectionDesigner((ReportSectionBase)t) },
        { typeof(Details), t => new ReportSectionDesigner((ReportSectionBase)t) },
        { typeof(PageFooter), t => new ReportSectionDesigner((ReportSectionBase)t) },
        { typeof(ReportFooter), t => new ReportSectionDesigner((ReportSectionBase)t) },
        { typeof(TextBox), t => new TextBoxDesigner((TextBox)t) },
        { typeof(Barcode), t => new BarcodeDesigner((Barcode)t) },
        { typeof(Table), t => new TableDesigner((Table)t) },
    };

    public static DiagramItem CreateDesigner(ReportItemBase item)
    {
        if (DesignerTypes.TryGetValue(item.GetType(), out var creator))
            return creator(item);

        throw new Exception($"Can't find designer for {item.GetType().Name}");
    }
}