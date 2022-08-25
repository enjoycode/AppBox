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

            Child = new TabView<DesignNodeVO>(DesignStore.DesignerController, BuildTab, BuildBody,
                    true, 40)
                { SelectedTabColor = Colors.White, TabBarBgColor = new Color(0xFFF3F3F3) };
        }

        private static Widget BuildTab(DesignNodeVO node, State<bool> isSelected)
        {
            var textColor = RxComputed<Color>.Make(isSelected,
                selected => selected ? Theme.FocusedColor : Colors.Black
            );

            return new Text(node.Label) { TextColor = textColor };
        }

        private static Widget BuildBody(DesignNodeVO node)
        {
            if (node.Type == DesignNodeType.ModelNode)
            {
                var modelNode = (ModelNodeVO)node;
                switch (modelNode.ModelType)
                {
                    case ModelType.Entity:
                    {
                        var entityDesigner = new EntityDesigner(modelNode);
                        node.Designer = entityDesigner;
                        return entityDesigner;
                    }
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

        private async void OnDesignerClosed(DesignNodeVO node)
        {
            // if (DesignStore.DesignerController.Count == 0)
            //     BgColor!.Value = Colors.White;
            
            node.Designer = null;
            if (node.Type == DesignNodeType.ModelNode)
            {
                var modelNode = (ModelNodeVO)node;
                if (modelNode.ModelType == ModelType.Service ||
                    modelNode.ModelType == ModelType.View)
                    await Channel.Invoke("sys.DesignService.CloseDesigner", new object?[]
                        { (int)node.Type, node.Id });
            }
        }

        private void OnTreeSelectionChanged()
        {
            var currentNode = DesignStore.TreeController.FirstSelectedNode;
            if (currentNode != null && currentNode.Data is ModelNodeVO)
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