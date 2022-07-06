namespace PixUI.Test.Mac
{
    public sealed class DemoListView : View
    {
        private readonly State<string> _scrollTo = "0";

        public DemoListView()
        {
            var listViewController = new ListViewController<Widget>();

            Child = new Column()
            {
                Children = new Widget[]
                {
                    new Row(VerticalAlignment.Middle, 20)
                    {
                        Children = new Widget[]
                        {
                            new Input(_scrollTo) { Width = 100 },
                            new Button("ScrollTo")
                            {
                                OnTap = e => listViewController.ScrollTo(
                                    int.Parse(_scrollTo.Value))
                            }
                        }
                    },
                    new Expanded()
                        { Child = ListView<Widget>.From(BuildList(), listViewController) }
                }
            };
        }

        private static Widget[] BuildList()
        {
            var list = new Widget[10];
            for (var i = 0; i < list.Length; i++)
            {
                list[i] = new Card()
                {
                    Child = new Container()
                    {
                        BgColor = Colors.Random(), Height = 200,
                        Child = new Center()
                        {
                            DebugLabel = i.ToString(),
                            Child = new Text(i.ToString())
                        }
                    }
                };
            }

            return list;
        }
    }
}