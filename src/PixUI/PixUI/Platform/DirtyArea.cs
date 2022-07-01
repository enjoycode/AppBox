namespace PixUI
{
    public interface IDirtyArea
    {
        /// <summary>
        /// 已存在的无效区域合并新的无效区域
        /// </summary>
        void Merge(IDirtyArea? newArea);

        /// <summary>
        /// 获取脏区域的外围
        /// </summary>
        Rect GetRect();

        /// <summary>
        /// 转换为子级对应的脏区域
        /// </summary>
        IDirtyArea ToChild(float childX, float childY);
    }

    /// <summary>
    /// 重绘指定Rect的区域
    /// </summary>
    [TSNoInitializer]
    public sealed class RepaintArea : IDirtyArea
    {
        public readonly Rect Rect;

        public RepaintArea(Rect rect)
        {
            Rect = rect;
        }

        public Rect GetRect() => Rect;

        public void Merge(IDirtyArea? newArea)
        {
            //TODO:
        }

        public IDirtyArea ToChild(float childX, float childY)
        {
            if (childX == 0 && childY == 0) return this;

            var childRect = Rect;
            childRect.Offset(-childX, -childY);
            return new RepaintArea(childRect);
        }
    }
}