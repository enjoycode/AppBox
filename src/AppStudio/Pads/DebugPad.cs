using AppBoxDesign.Debugging;
using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 调试面板，用于计算表达式及显示输出信息
/// </summary>
internal sealed class DebugPad : View
{
    public DebugPad(DesignStore store)
    {
        _designStore = store;
        // FillColor = new Color(0xFF3C3C3C);
        Child = new Column()
        {
            Children =
            [
                BuildActionBar(),

                new Conditional<int>(_activePad)
                    .When(t => t == 0, () => new EvaluateView(store, _treeController))
                    .When(t => t == 1, () => new OutputView())
            ],
        };
    }

    private readonly DesignStore _designStore;
    private readonly State<int> _activePad = 0; //当前的设计面板
    private readonly State<string> _expression = ""; //需要计算值的表达式
    private readonly TreeController<EvaluateResult> _treeController = new(); //计算结果树

    private Widget BuildActionBar() => new Container()
    {
        /*FillColor = new Color(0xFF3C3C3C),*/ Height = 40,
        Padding = EdgeInsets.Only(15, 5, 15, 5),
        Child = new Row(VerticalAlignment.Middle, 10)
        {
            Children =
            [
                new ButtonGroup()
                {
                    Children =
                    [
                        new Button("Variables") { OnTap = _ => _activePad.Value = 0 },
                        new Button("Output") { OnTap = _ => _activePad.Value = 1 },
                    ]
                },
                new IfConditional(_activePad.ToComputed(p => p == 0),
                    () => new Row()
                    {
                        Spacing = 5,
                        Children =
                        [
                            new Text("Expression:"),
                            new Expanded(new TextInput(_expression)),
                            new Button("Evaluate") { OnTap = _ => OnEvaluate() }
                        ]
                    }
                ),
            ]
        }
    };

    private async void OnEvaluate()
    {
        if (string.IsNullOrEmpty(_expression.Value))
        {
            Notification.Error("Expression is empty");
            return;
        }

        if (_designStore.ActiveDesigner == null ||
            _designStore.ActiveDesigner is not IDebuggableCodeDesigner debuggable)
        {
            Notification.Error("The debuggable code editor is missing");
            return;
        }

        try
        {
            var result = await debuggable.EvaluateExpression(_expression.Value);
            //Notification.Info($"{result.Expression}[{result.Type}] = {result.Value}");
            _treeController.DataSource = new List<EvaluateResult>() { result };
        }
        catch (Exception e)
        {
            Notification.Error(e.Message);
        }
    }

    private class EvaluateView : View
    {
        public EvaluateView(DesignStore store, TreeController<EvaluateResult> treeController)
        {
            _designStore = store;

            Padding = EdgeInsets.All(5);
            Child = new TreeView<EvaluateResult>(treeController, BuildTreeNode, n => n.Children ?? [])
            {
                LazyLoader = LazyLoadChildren
            };
        }

        private readonly DesignStore _designStore;

        private static void BuildTreeNode(TreeNode<EvaluateResult> node)
        {
            node.IsLeaf = node.Data.ChildCount == 0;
            node.Label = new Row()
            {
                Spacing = 3,
                Children =
                [
                    new Text(node.Data.Expression) { TextColor = Colors.Magenta },
                    new Text("="),
                    new Text($"{{{node.Data.Type}}}") { TextColor = Colors.Gray },
                    new Text(node.Data.Value),
                ]
            };
        }

        private async Task LazyLoadChildren(TreeNode<EvaluateResult> node)
        {
            if (_designStore.ActiveDesigner == null ||
                _designStore.ActiveDesigner is not IDebuggableCodeDesigner debuggable)
            {
                Notification.Error("The debuggable code editor is missing");
                return;
            }

            var children = await debuggable.ListChildren(node.Data.Name);
            node.Data.Children = children;
        }
    }

    private class OutputView : View
    {
        public OutputView()
        {
            Child = new Center()
            {
                Child = new Text("Output")
            };
        }
    }
}