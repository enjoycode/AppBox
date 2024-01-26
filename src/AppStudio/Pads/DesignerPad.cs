using System;
using AppBoxClient;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class DesignerPad : View
{
    public DesignerPad(DesignStore designStore)
    {
        _designStore = designStore;
        _designStore.TreeController.SelectionChanged += OnTreeSelectionChanged;
        _designStore.DesignerController.TabAdded += OnDesignerOpened;
        _designStore.DesignerController.TabClosed += OnDesignerClosed;

        FillColor = Colors.White;

        Child = new IfConditional(_isOpenedAnyDesigner,
            () => new TabView<DesignNodeVO>(_designStore.DesignerController, BuildTab, BuildBody, true, 40)
            {
                SelectedTabColor = Colors.White,
                TabBarBgColor = new Color(0xFFF3F3F3)
            },
            () => new Center { Child = new Text("Welcome to AppBox!") });
    }

    private readonly DesignStore _designStore;
    private readonly State<bool> _isOpenedAnyDesigner = false;

    private static Widget BuildTab(DesignNodeVO node, State<bool> isSelected)
    {
        var textColor = RxComputed<Color>.Make(isSelected,
            selected => selected ? Theme.FocusedColor : Colors.Black
        );

        return new Text(node.Label) { TextColor = textColor };
    }

    private Widget BuildBody(DesignNodeVO node)
    {
        if (node.Type == DesignNodeType.ModelNode)
        {
            var modelNode = (ModelNodeVO)node;
            switch (modelNode.ModelType)
            {
                case ModelType.Entity:
                    var entityDesigner = new EntityDesigner(_designStore, modelNode);
                    node.Designer = entityDesigner;
                    return entityDesigner;
                case ModelType.View:
                    if (modelNode.Tag == 0)
                    {
                        var viewDesigner = new ViewCodeDesigner(_designStore, modelNode);
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
                    var designer = new ServiceDesigner(_designStore, modelNode);
                    node.Designer = designer;
                    return designer;
            }
        }

        return new Container()
        {
            Padding = EdgeInsets.All(10),
            FillColor = Colors.White,
            Child = new Text(node.Label),
        };
    }

    private void OnDesignerOpened(DesignNodeVO node)
    {
        _isOpenedAnyDesigner.Value = _designStore.DesignerController.Count > 0;
    }

    private async void OnDesignerClosed(DesignNodeVO node)
    {
        _isOpenedAnyDesigner.Value = _designStore.DesignerController.Count > 0;

        node.Designer = null;
        if (node.Type == DesignNodeType.ModelNode)
        {
            var modelNode = (ModelNodeVO)node;
            if (modelNode.ModelType == ModelType.Service || modelNode.ModelType == ModelType.View)
                await Channel.Invoke("sys.DesignService.CloseDesigner",
                    new object?[] { (int)node.Type, node.Id });
        }
    }

    private void OnTreeSelectionChanged()
    {
        var currentNode = _designStore.TreeController.FirstSelectedNode;
        if (currentNode is { Data: ModelNodeVO })
        {
            _designStore.OpenOrActiveDesigner(currentNode.Data, null);
        }
    }
}