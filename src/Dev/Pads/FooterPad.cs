using PixUI;

namespace AppBoxDev
{
    internal sealed class FooterPad : View
    {
        public FooterPad()
        {
            Child = new Container
            {
                Height = 25,
                Color = new Color(0xFFCC653A),
                Child = new Center
                {
                    Child = new Text("enjoycode@icloud.com") { Color = Colors.White }
                }
            };
        }
    }
}