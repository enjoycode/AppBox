using AppBoxClient;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class DesignerPad : View
    {
        public DesignerPad()
        {
            DesignStore.TreeController.SelectionChanged += OnTreeSelectionChanged;
            // DesignStore.DesignerController.TabAdded += OnDesignerOpened;
            DesignStore.DesignerController.TabClosed += OnDesignerClosed;

            BgColor = Colors.White;

            Child = new TabView<DesignNode>(DesignStore.DesignerController, BuildTab, BuildBody,
                true, 40) { SelectedTabColor = Colors.White };
        }

        private static Widget BuildTab(DesignNode node, State<bool> isSelected)
        {
            var textColor = RxComputed<Color>.Make(isSelected,
                selected => selected ? Theme.FocusedColor : Colors.Black
            );

            return new Text(node.Label) { TextColor = textColor };
        }

        private static Widget BuildBody(DesignNode node)
        {
            if (node.Type == DesignNodeType.ModelNode)
            {
                var modelNode = (ModelNode)node;
                switch (modelNode.ModelType)
                {
                    case ModelType.View:
                    {
                        var viewDesigner = new ViewDesigner(modelNode);
                        node.Designer = viewDesigner;
                        return viewDesigner;
                    }
                    case ModelType.Service:
                    {
                        var designer = new ServiceDesigner(modelNode);
                        node.Designer = designer;
                        return designer;
                    }
                }
            }

            return new Container()
            {
                Padding = EdgeInsets.All(10),
                BgColor = Colors.White,
                Child = new Text(node.Label),
            };
        }

        // private void OnDesignerOpened(DesignNode node)
        // {
        //     if (DesignStore.DesignerController.Count == 1)
        //         BgColor!.Value = new Color(0xFFF3F3F3);
        // }

        private async void OnDesignerClosed(DesignNode node)
        {
            // if (DesignStore.DesignerController.Count == 0)
            //     BgColor!.Value = Colors.White;

            if (node.Type == DesignNodeType.ModelNode)
            {
                var modelNode = (ModelNode)node;
                if (modelNode.ModelType == ModelType.Service ||
                    modelNode.ModelType == ModelType.View)
                    await Channel.Invoke("sys.DesignService.CloseDesigner", new object?[]
                        { (int)node.Type, node.Id });
            }
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