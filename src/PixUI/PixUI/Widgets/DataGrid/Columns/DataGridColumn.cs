using System;

namespace PixUI
{
    public abstract class DataGridColumn<T>
    {
        protected DataGridColumn(string label, ColumnWidth? width = null,
            CellStyle? headerCellStyle = null, CellStyle? cellStyle = null,
            Func<T, int, CellStyle>? cellStyleGetter = null,
            bool frozen = false)
        {
            Label = label;
            Width = width ?? ColumnWidth.Auto();
            HeaderCellStyle = headerCellStyle;
            CellStyle = cellStyle;
            CellStyleGetter = cellStyleGetter;
            Frozen = frozen;
        }

        /// <summary>
        /// 列标题
        /// </summary>
        public readonly string Label;

        public readonly ColumnWidth Width;
        public readonly CellStyle? HeaderCellStyle;
        public readonly CellStyle? CellStyle;
        public readonly Func<T, int, CellStyle>? CellStyleGetter;

        /// <summary>
        /// 是否冻结列
        /// </summary>
        public bool Frozen { get; set; }

        internal DataGridGroupColumn<T>? Parent;
        internal int HeaderRowIndex => Parent == null ? 0 : Parent.HeaderRowIndex + 1;

        #region ----Cached Properties----

        //缓存的计算后的列宽度(像素)
        private float _cachedWidth = 0f;

        //缓存布局后的位置信息
        internal float CachedLeft = 0f;
        internal float CachedVisibleLeft = 0f;
        internal float CachedVisibleRight = 0f;

        #endregion

        /// <summary>
        /// 经过布局计算后的实际像素宽度
        /// </summary>
        internal virtual float LayoutWidth
            => Width.Type == ColumnWidthType.Fixed ? Width.Value : _cachedWidth;

        /// <summary>
        /// 非分组列计算实际像素宽度
        /// </summary>
        internal void CalcWidth(float leftWidth, int leftColumns)
        {
            var widthChanged = false;
            if (Width.Type == ColumnWidthType.Percent)
            {
                var newWidth = Math.Max(leftWidth / Width.Value, Width.MinValue);
                widthChanged = newWidth != _cachedWidth;
                _cachedWidth = newWidth;
            }
            else if (Width.Type == ColumnWidthType.Auto)
            {
                var newWidth = Math.Max(leftWidth / leftColumns, Width.MinValue);
                widthChanged = newWidth != _cachedWidth;
                _cachedWidth = newWidth;
            }

            if (widthChanged) OnResized();
        }

        /// <summary>
        /// 改变列宽后由子类清除相关缓存
        /// </summary>
        internal virtual void OnResized() { }

        /// <summary>
        ///  画标题，允许子类特殊绘制(如CheckBoxColumn)
        /// </summary>
        internal virtual void PaintHeader(Canvas canvas, Rect cellRect, DataGridTheme theme)
        {
            var cellStyle = HeaderCellStyle ?? theme.DefaultHeaderCellStyle;

            //画背景色
            if (cellStyle.BackgroundColor != null)
            {
                var paint = PaintUtils.Shared(cellStyle.BackgroundColor.Value);
                canvas.DrawRect(cellRect, paint);
            }

            //画文本
            using var ph = BuildCellParagraph(cellRect, cellStyle, Label, 2);
            PaintCellParagraph(canvas, cellRect, cellStyle, ph);
        }

        internal virtual void PaintCell(Canvas canvas, DataGridController<T> controller,
            int rowIndex, Rect cellRect) { }

        internal static Paragraph BuildCellParagraph(Rect rect, CellStyle style,
            string text, int maxLines)
        {
            return TextPainter.BuildParagraph(text,
                rect.Width - CellStyle.CellPadding * 2,
                style.FontSize,
                style.Color ?? Colors.Black,
                new FontStyle(style.FontWeight, FontSlant.Upright),
                maxLines, true);
        }

        /// <summary>
        /// 根据上下对齐方式画文本
        /// </summary>
        internal static void PaintCellParagraph(Canvas canvas, Rect rect, CellStyle style,
            Paragraph paragraph)
        {
            if (style.VerticalAlignment == VerticalAlignment.Middle)
            {
                var x = rect.Left;
                var y = rect.Top + (rect.Height - paragraph.Height) / 2;
                canvas.DrawParagraph(paragraph, x + CellStyle.CellPadding, y);
            }
            else if (style.VerticalAlignment == VerticalAlignment.Bottom)
            {
                var x = rect.Left;
                var y = rect.Bottom;
                canvas.DrawParagraph(paragraph, x + CellStyle.CellPadding,
                    y - CellStyle.CellPadding - paragraph.Height);
            }
            else
            {
                canvas.DrawParagraph(paragraph, rect.Left + CellStyle.CellPadding,
                    rect.Top + CellStyle.CellPadding);
            }
        }
    }
}