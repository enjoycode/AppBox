namespace PixUI
{
    public static class PaintUtils
    {
        private static Paint? _shared; //Do not create instance, web has not init CanvasKit

        public static Paint Shared(in Color? color = null, PaintStyle style = PaintStyle.Fill,
            float strokeWidth = 1)
        {
            _shared ??= new Paint();
            _shared.Style = style;
            _shared.Color = color ?? Colors.Black;
            _shared.StrokeWidth = strokeWidth;
            _shared.StrokeCap = StrokeCap.Butt;
            _shared.StrokeJoin = StrokeJoin.Miter;
            _shared.MaskFilter = null;
#if !__WEB__ //TODO: fix web
            _shared.BlendMode = BlendMode.SrcOver;
#endif
            _shared.AntiAlias = false;
            //TODO: set other properties to default value
            return _shared;
        }
    }
}