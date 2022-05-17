using PixUI;

namespace AppBoxDesign
{
    internal sealed class WidgetPreviewer : View
    {
        private Matrix4 _scale = Matrix4.CreateIdentity();

        public WidgetPreviewer()
        {
            Child = new Container()
            {
                Color = new Color(0xFFA2A2A2),
                Padding = EdgeInsets.All(10),
                Child = new Card()
                {
                    Elevation = 10,
                    Child = new Transform(_scale)
                    {
                        Child = new WebPreviewer()
                    }
                }
            };
        }
    }
}