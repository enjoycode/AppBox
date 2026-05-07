using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign.Dependency;

internal sealed class DependencyItem : DiagramShape
{
    public DependencyItem(DesignHub designContext, ModelNode modelNode)
    {
        _designContext = designContext;
        ModelNode = modelNode;

        var title =
            $"{modelNode.AppName}.{CodeUtil.GetPluralStringOfModelType(modelNode.Model.ModelType)}.{modelNode.Model.Name}";
        _titleParagraph = TextPainter.BuildParagraph(title, float.MaxValue, FontSize, ForeColor);

        SetBounds(0, 0, _titleParagraph.MaxIntrinsicWidth + WidthPadding, ItemHeight, BoundsSpecified.All);
    }

    internal const float ItemHeight = 30;
    private const float FontSize = 16;
    private const float WidthPadding = 16f;
    private readonly DesignHub _designContext;
    private readonly IParagraph _titleParagraph;
    public ModelNode ModelNode { get; }
    
    public Color ForeColor { get; set; } = Colors.Magenta;

    public override DesignBehavior DesignBehavior => DesignBehavior.CanMove;

    protected override bool IsContainer => false;

    public override void Paint(ICanvas canvas)
    {
        //画边框
        var paint = PixUI.Paint.Shared(ForeColor, PaintStyle.Stroke, 2f);
        var rect = Rect.FromLTWH(0, 0, Bounds.Width, Bounds.Height);
        rect.Inflate(-2f, -2f);
        canvas.DrawRRect(RRect.FromRectAndRadius(rect, 3f, 3f), paint);

        //画标题
        var x = (Bounds.Width - _titleParagraph.MaxIntrinsicWidth) / 2f;
        var y = (ItemHeight - _titleParagraph.Height) / 2f;
        canvas.DrawParagraph(_titleParagraph, x, y);
    }
}