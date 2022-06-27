using System.Threading.Tasks;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class EntityDesigner : View, IDesigner
    {
        public EntityDesigner(ModelNode modelNode)
        {
            _modelNode = modelNode;

            Child = new Column()
            {
                Children = new Widget[]
                {
                    BuildActionBar(),
                    new Expanded()
                    {
                        Child = new Conditional<int>(_activePad, new[]
                        {
                            new WhenBuilder<int>(t => t == 0, () => new MembersDesigner()),
                        })
                    },
                }
            };
        }

        private readonly ModelNode _modelNode;
        private readonly State<int> _activePad = 0;

        private static Widget BuildActionBar()
        {
            return new Container()
            {
                BgColor = Colors.White, Height = 40,
                Padding = EdgeInsets.Only(15, 8, 15, 8),
                Child = new Row(VerticalAlignment.Middle, 10)
                {
                    Children = new Widget[]
                    {
                        new Text("") { Width = 120 },
                        new Button("Members") { Width = 75 },
                        new Button("Options") { Width = 75 },
                        new Button("Data") { Width = 75 },
                    }
                }
            };
        }

        public Task SaveAsync()
        {
            throw new System.NotImplementedException();
        }
    }
}