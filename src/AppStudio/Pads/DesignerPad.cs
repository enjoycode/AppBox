using System;
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
            DesignStore.DesignerController.TabAdded += OnDesignerOpened;
            DesignStore.DesignerController.TabClosed += OnDesignerClosed;

            BgColor = Colors.White;

            Child = new IfConditional(_isOpenedAnyDesigner,
                () => new TabView<DesignNodeVO>(DesignStore.DesignerController, BuildTab, BuildBody, true, 40)
                {
                    SelectedTabColor = Colors.White,
                    TabBarBgColor = new Color(0xFFF3F3F3)
                },
                () => new Center { Child = new Text("Welcome to AppBox!") });
        }

        private readonly State<bool> _isOpenedAnyDesigner = false;

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
                        var entityDesigner = new EntityDesigner(modelNode);
                        node.Designer = entityDesigner;
                        return entityDesigner;
                    case ModelType.View:
                        if (modelNode.Tag == 0)
                        {
                            var viewDesigner = new ViewCodeDesigner(modelNode);
                            node.Designer = viewDesigner;
                            return viewDesigner;
                        }
                        else if (modelNode.Tag == 1)
                        {
                            var viewDesigner = new ViewDynamicDesigner(modelNode);
                            node.Designer = viewDesigner;
                            return viewDesigner;
                        }
                        else
                            throw new Exception();
                    case ModelType.Service:
                        var designer = new ServiceDesigner(modelNode);
                        node.Designer = designer;
                        return designer;
                }
            }

            return new Container()
            {
                Padding = EdgeInsets.All(10),
                BgColor = Colors.White,
                Child = new Text(node.Label),
            };
        }

        private void OnDesignerOpened(DesignNodeVO node)
        {
            _isOpenedAnyDesigner.Value = DesignStore.DesignerController.Count > 0;
        }

        private async void OnDesignerClosed(DesignNodeVO node)
        {
            _isOpenedAnyDesigner.Value = DesignStore.DesignerController.Count > 0;

            node.Designer = null;
            if (node.Type == DesignNodeType.ModelNode)
            {
                var modelNode = (ModelNodeVO)node;
                if (modelNode.ModelType == ModelType.Service || modelNode.ModelType == ModelType.View)
                    await Channel.Invoke("sys.DesignService.CloseDesigner",
                        new object?[] { (int)node.Type, node.Id });
            }
        }

        private static void OnTreeSelectionChanged()
        {
            var currentNode = DesignStore.TreeController.FirstSelectedNode;
            if (currentNode != null && currentNode.Data is ModelNodeVO)
            {
                DesignStore.OpenOrActiveDesigner(currentNode.Data, null);
            }
        }
    }
}