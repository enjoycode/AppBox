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
            Panel1 = new EvaluteView(store),
            Panel2 = new OutputView(),
        };
    }

    private class EvaluteView : View
    {
        public EvaluteView(DesignStore store)
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
                    //TODO: result view
                ]
            };
        }

        private readonly DesignStore _designStore;
        private readonly State<string> _expression = "";

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
                Notification.Info($"{result.Expression}[{result.Type}] = {result.Value}"); //TODO: show in pad
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