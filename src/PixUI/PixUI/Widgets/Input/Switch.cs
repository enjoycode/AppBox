using System;

namespace PixUI
{
    public sealed class Switch : Widget
    {
        public Switch(State<bool> value)
        {
            _value = Bind(value, BindingOptions.AffectsVisual);
        }

        private readonly State<bool> _value;


        #region ====Widget Overrides====

        private const float _kTrackWidth = 51.0f;
        private const float _kTrackHeight = 31.0f;
        private const float _kTrackRadius = _kTrackHeight / 2.0f;
        private const float _kTrackInnerStart = _kTrackHeight / 2.0f;
        private const float _kTrackInnerEnd = _kTrackWidth - _kTrackInnerStart;
        // private const float _kTrackInnerLength = _kTrackInnerEnd - _kTrackInnerStart;
        private const float _kSwitchWidth = 59.0f;
        private const float _kSwitchHeight = 39.0f;

        private const float _kThumbExtension = 7f;
        private const float _kThumbRadius = 14f;
        private static readonly Color _kThumbBorderColor = new Color(0x0A000000);

        public override void Layout(float availableWidth, float availableHeight)
        {
            var width = CacheAndCheckAssignWidth(availableWidth);
            var height = CacheAndCheckAssignHeight(availableHeight);

            SetSize(Math.Min(width, _kSwitchWidth), Math.Min(height, _kSwitchHeight));
        }

        public override void Paint(Canvas canvas, IDirtyArea? area = null)
        {
            var currentValue = 1f;
            var currentReactionValue = 0f;
            var visualPosition = currentValue;

            var activeColor = Theme.AccentColor;
            var trackColor = new Color(0x52000000); // Black with 32% opacity
            var paint = PaintUtils.Shared(Color.Lerp(trackColor, activeColor, currentValue));
            paint.AntiAlias = true;

            // track
            var trackRect = Rect.FromLTWH(
                (W - _kTrackWidth) / 2f, (H - _kSwitchHeight) / 2f, _kTrackWidth, _kTrackHeight
            );
            var trackRRect = RRect.FromRectAndRadius(trackRect, _kTrackRadius, _kTrackRadius);
            canvas.DrawRRect(trackRRect, paint);

            // thumb
            var currentThumbExtension = _kThumbExtension * currentReactionValue;
            var thumbLeft = FloatUtils.Lerp(
                trackRect.Left + _kTrackInnerStart - _kThumbRadius,
                trackRect.Left + _kTrackInnerEnd - _kThumbRadius - currentThumbExtension,
                visualPosition
            );
            var thumbRight = FloatUtils.Lerp(
                trackRect.Left + _kTrackInnerStart + _kThumbRadius + currentThumbExtension,
                trackRect.Left + _kTrackInnerEnd + _kThumbRadius,
                visualPosition
            );
            var thumbCenterY = (H - _kThumbExtension) / 2.0f;
            var thumbBounds = new Rect(thumbLeft, thumbCenterY - _kThumbRadius, thumbRight,
                thumbCenterY + _kThumbRadius);

            var clipPath = new Path();
            clipPath.AddRRect(trackRRect);
            canvas.Save();
            canvas.ClipPath(clipPath, ClipOp.Intersect, true);
            
            PaintThumb(canvas, thumbBounds);
            
            canvas.Restore();
        }

        private void PaintThumb(Canvas canvas, Rect rect)
        {
            // CupertinoThumbPainter
            var shortestSide = Math.Min(rect.Width, rect.Height);
            var rrect = RRect.FromRectAndRadius(rect, shortestSide / 2f, shortestSide / 2f);

            var paint = PaintUtils.Shared(Color.Empty);
            paint.AntiAlias = true;

            // shadow
            rrect.Shift(0, 3);
            var shadowColor = new Color(0x26000000);
            var blurRadius = 8.0f;
            paint.Color = shadowColor;
            paint.MaskFilter = MaskFilter.CreateBlur(BlurStyle.Normal,
                MaskFilter.ConvertRadiusToSigma(blurRadius));
            canvas.DrawRRect(rrect, paint);

            shadowColor = new Color(0x0F000000);
            blurRadius = 1f;
            paint.Color = shadowColor;
            paint.MaskFilter = MaskFilter.CreateBlur(BlurStyle.Normal,
                MaskFilter.ConvertRadiusToSigma(blurRadius));
            canvas.DrawRRect(rrect, paint);
            rrect.Shift(0, -3);

            // border and fill
            rrect.Inflate(0.5f, 0.5f);
            paint.Color = _kThumbBorderColor;
            canvas.DrawRRect(rrect, paint);
            rrect.Deflate(0.5f, 0.5f);

            paint.Color = Colors.White;
            canvas.DrawRRect(rrect, paint);
        }

        #endregion
    }
}