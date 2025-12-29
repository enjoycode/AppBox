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
        Child = new Splitter()
        {
            Panel1 = new EvaluateView(store),
            Panel2 = new OutputView(),
        };
    }

    private class EvaluateView : View
    {
        public EvaluateView(DesignStore store)
        {
            _designStore = store;

            Padding = EdgeInsets.All(5);
            Child = new Column()
            {
                Spacing = 5,
                Children =
                [
                    new Row()
                    {
                        Spacing = 5,
                        Children =
                        [
                            new Text("Expression:"),
                            new Expanded(new TextInput(_expression)),
                            new Button("Evaluate") { OnTap = _ => OnEvaluate() }
                        ]
                    },
                    new TreeView<EvaluateResult>(_treeController, BuildTreeNode, n => [] /*TODO:*/)
                ]
            };
        }

        private readonly DesignStore _designStore;
        private readonly State<string> _expression = "";
        private readonly TreeController<EvaluateResult> _treeController = new();

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
                    new Text($"[{node.Data.Type}]") { TextColor = Colors.Gray },
                    new Text(node.Data.Value)
                ]
            };
        }

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