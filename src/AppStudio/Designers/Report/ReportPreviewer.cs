using System.Collections;
using AppBox.Reporting;
using PixUI;
using Processing = AppBox.Reporting.Processing;

namespace AppBoxDesign;

internal sealed class ReportPreviewer : View
{
    public ReportPreviewer(Func<Report> reportGetter)
    {
        _reportGetter = reportGetter;

        Child = new Container
        {
            FillColor = new Color(0xFFA2A2A2),
            Padding = EdgeInsets.All(10),
            Child = _reportView,
        };
    }

    private readonly Func<Report> _reportGetter;
    private readonly ReportView _reportView = new();

    protected override void OnMounted()
    {
        base.OnMounted();
        var report = _reportGetter();
        if (report != null!)
        {
            RefreshReport(report);
        }
    }

    public void RefreshReport(Report report)
    {
        var rs = new InstanceReportSource { ReportDocument = report };
        var deviceInfo = new Hashtable()
        {
            // { "StartPage", 0 },
            // { "EndPage", 0 },
            { "OutputFormat", "pic" },
            { "ProcessItemActions", false },
            { "WriteClientAction", false }
        };
        var renderContext = new Processing.RenderingContext()
        {
            { "ReportDocumentState", null }
        };
        var processingReports = new Processing.ReportProcessor().ProcessReport(rs, deviceInfo, renderContext);
        var res = Processing.ReportProcessor.RenderReport("IMAGE", processingReports, deviceInfo, renderContext);
        _reportView.Pictures = res.OutputPictures!;
        _reportView.Repaint();
    }

    private sealed class ReportView : Widget
    {
        internal Picture[] Pictures = null!;

        public override void Paint(Canvas canvas, IDirtyArea? area = null)
        {
            //TODO:暂简单画第一页
            if (Pictures == null! || Pictures.Length == 0)
                return;

            var pic = Pictures[0];
            var width = pic.CullRect.Width;
            var height = pic.CullRect.Height;

            //draw background
            var bgPaint = PixUI.Paint.Shared(Colors.White);
            canvas.DrawRect(Rect.FromLTWH(0, 0, width, height), bgPaint);

            //draw picture
            using var image = Image.FromPicture(pic, new SizeI((int)width, (int)height));
            canvas.DrawImage(image, Rect.FromLTWH(0, 0, width, height));
        }
    }
}