using AppBoxClient;
using AppBoxCore;
using CodeEditor;
using PixUI;
using Log = PixUI.Log;

namespace AppBoxDesign;

internal sealed class ServiceDesigner : View, ICodeDesigner
{
    public ServiceDesigner(DesignStore designStore, ModelNode modelNode)
    {
        ModelNode = modelNode;
        _designStore = designStore;
        _textBuffer = new RoslynSourceText(modelNode);
        _codeEditorController = new CodeEditorController($"{modelNode.Label}.cs", _textBuffer,
            new RoslynSyntaxParser(_textBuffer), RoslynCompletionProvider.Default, modelNode.Id);
        _codeEditorController.ContextMenuBuilder = e => ContextMenuService.BuildContextMenu(_designStore, e);
        //订阅代码变更事件
        _codeEditorController.Document.DocumentChanged += OnDocumentChanged;
        _delayDocChangedTask = new DelayTask(300, RunDelayTask);

        Child = BuildEditor(_codeEditorController);
    }

    private readonly DesignStore _designStore;
    private readonly RoslynSourceText _textBuffer;
    public ModelNode ModelNode { get; }
    private readonly CodeEditorController _codeEditorController;
    private readonly DelayTask _delayDocChangedTask;

    private Reference? _pendingGoto;

    private Widget BuildEditor(CodeEditorController codeEditorController)
    {
        return new Column()
        {
            Children = new Widget[]
            {
                BuildActionBar(),
                new Expanded() { Child = new CodeEditorWidget(codeEditorController) },
            }
        };
    }

    private Widget BuildActionBar() => new Container()
    {
        FillColor = new Color(0xFF3C3C3C), Height = 40,
        Padding = EdgeInsets.Only(15, 8, 15, 8),
        Child = new Row(VerticalAlignment.Middle, 10)
        {
            Children =
            [
                new Button("Run") { Width = 75, OnTap = OnRunMethod },
                new Button("Debug") { Width = 75 }
            ]
        }
    };

    protected override void OnMounted()
    {
        base.OnMounted();
        OpenDocument();
    }

    private async void OpenDocument()
    {
        await _textBuffer.Open();
        _codeEditorController.Document.Open();

        if (_pendingGoto != null)
        {
            GotoDefinitionCommand.RunOnCodeEditor(_codeEditorController, _pendingGoto);
            _pendingGoto = null;
        }
    }

    private void OnDocumentChanged(DocumentEventArgs e)
    {
        //TODO: check syntax error first.
        //启动延时任务
        _delayDocChangedTask.Run();
    }

    private async void RunDelayTask()
    {
        //检查代码错误，先前端判断语法，再后端判断语义，都没有问题刷新预览
        //if (_codeEditorController.Document.HasSyntaxError) return; //TODO:获取语法错误列表

        try
        {
            var problems = await GetProblems.Execute(ModelNode);
            _designStore.UpdateProblems(ModelNode, problems!);
        }
        catch (Exception ex)
        {
            Notification.Error($"GetProblems error: {ex.Message}");
        }
    }

    public override void Dispose()
    {
        _codeEditorController.Document.DocumentChanged -= OnDocumentChanged;

        base.Dispose();
    }

    public Widget? GetOutlinePad() => null;

    public Widget? GetToolboxPad() => null;

    public void GotoDefinition(Reference reference)
    {
        if (reference.Offset < 0) return; //无需跳转

        var doc = _codeEditorController.Document;
        if (doc.TextLength == 0)
            _pendingGoto = reference;
        else
            GotoDefinitionCommand.RunOnCodeEditor(_codeEditorController, reference);
    }

    public void GotoProblem(CodeProblem problem)
    {
        _codeEditorController.SetCaret(problem.StartLine, problem.StartColumn);
        if (problem.StartLine == problem.EndLine && problem.StartColumn == problem.EndColumn)
            _codeEditorController.ClearSelection();
        else
            _codeEditorController.SetSelection(
                new TextLocation(problem.StartColumn, problem.StartLine),
                new TextLocation(problem.EndColumn, problem.EndLine));
    }

    public Task SaveAsync()
    {
        return Channel.Invoke("sys.DesignService.SaveModel", new object?[] { ModelNode.Id, null });
    }

    public async Task RefreshAsync()
    {
        throw new NotImplementedException();
        // var srcCode = await Channel.Invoke<string>("sys.DesignService.OpenCodeModel",
        //     new object[] { ModelNode.Id });
        // _codeEditorController.Document.TextContent = srcCode!;
    }

    /// <summary>
    /// 获取光标位置的服务方法
    /// </summary>
    private async Task<JsonResult?> GetMethodInfo()
    {
        try
        {
            var jsonResult = (await Channel.Invoke<JsonResult>("sys.DesignService.GetServiceMethod",
                new object?[] { true, ModelNode.Id, _codeEditorController.GetCaretOffset() }))!;
            return jsonResult;
        }
        catch (Exception ex)
        {
            Notification.Error($"无法获取服务方法: {ex.Message}");
            return null;
        }
    }

    private async void OnRunMethod(PointerEvent e)
    {
        var json = await GetMethodInfo();
        if (json == null) return;

        try
        {
            var methodInfo = json.ParseTo<ServiceMethodInfo>();
            if (methodInfo == null) return;

            //TODO:暂简单实现且不支持带参数的调用(显示对话框设置参数并显示调用结果)
            if (methodInfo.Args.Length > 0)
                throw new Exception("暂未实现带参数的服务方法调用");

            var serviceMethod = $"{ModelNode.AppNode.Model.Name}.{ModelNode.Label}.{methodInfo.Name}";
            var res = await Channel.Invoke<object?>(serviceMethod);
            if (res != null)
            {
                Log.Info($"调用服务方法结果: {System.Text.Json.JsonSerializer.Serialize(res)}");
            }
        }
        catch (Exception ex)
        {
            Notification.Error($"调用服务方法错误: {ex.Message}");
        }
    }
}