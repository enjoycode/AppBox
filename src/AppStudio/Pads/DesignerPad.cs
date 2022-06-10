using AppBoxCore;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class DesignerPad : View
    {
        public DesignerPad()
        {
            DesignStore.TreeController.SelectionChanged += OnTreeSelectionChanged;

            Child = new Column()
            {
                DebugLabel = "DesignerPad",
                Children = new Widget[]
                {
                    new TabBar<DesignNode>(DesignStore.DesignerController, BuildTab, true)
                        { Height = 40, Color = new Color(0xFFF3F3F3) },
                    new Expanded()
                    {
                        Child = new TabBody<DesignNode>(DesignStore.DesignerController, BuildBody),
                    }
                }
            };
        }

        private static void BuildTab(DesignNode node, Tab tab)
        {
            var textColor = RxComputed<Color>.Make(tab.IsSelected,
                selected => selected ? Theme.FocusedColor : Colors.Black
            );
            var bgColor = RxComputed<Color>.Make(tab.IsSelected,
                selected => selected ? Colors.White : new Color(0xFFF3F3F3)
            );

            tab.Child = new Container()
            {
                Color = bgColor, Width = 100,
                Padding = EdgeInsets.Only(10, 8, 0, 0),
                Child = new Text(node.Label) { Color = textColor }
            };
        }

        private static Widget BuildBody(DesignNode node)
        {
            if (node.Type == DesignNodeType.ModelNode)
            {
                var modelNode = (ModelNode)node;
                if (modelNode.ModelType == ModelType.View)
                {
                    var viewDesigner = new ViewDesigner(modelNode);
                    node.Designer = viewDesigner;
                    return viewDesigner;
                }
            }

            return new Container()
            {
                Padding = EdgeInsets.All(10),
                Color = Colors.White,
                Child = new Text(node.Label),
            };
        }

        private void OnTreeSelectionChanged()
        {
            var currentNode = DesignStore.TreeController.FirstSelectedNode;
            if (currentNode != null && currentNode.Data is ModelNode)
            {
                //先检查是否已经打开
                var existsIndex = DesignStore.DesignerController.IndexOf(currentNode.Data);
                if (existsIndex < 0)
                    DesignStore.DesignerController.Add(currentNode.Data);
                else
                    DesignStore.DesignerController.SelectAt(existsIndex);
            }
        }
    }
}