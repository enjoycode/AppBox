namespace PixUI
{
    /// <summary>
    /// A ShapeBorder that draws an outline with the width and color specified by [side].
    /// </summary>
    public abstract class OutlinedBorder : ShapeBorder
    {
        public readonly BorderSide Side;

        public override EdgeInsets Dimensions => EdgeInsets.All(Side.Width);

        public OutlinedBorder(BorderSide? side)
        {
            Side = side ?? BorderSide.Empty;
        }
    }
}