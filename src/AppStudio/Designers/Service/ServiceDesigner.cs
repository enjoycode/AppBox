using AppBoxClient;
using AppBoxCore;
using AppBoxDesign.Debugging;
using CodeEditor;
using PixUI;
using Log = PixUI.Log;

namespace AppBoxDesign;

internal sealed class ServiceDesigner : View, IDebuggableCodeDesigner
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
    internal ServiceModel ServiceModel => (ServiceModel)ModelNode.Model;
    private readonly CodeEditorController _codeEditorController;
    private readonly DelayTask _delayDocChangedTask;
    private ILocation? _pendingGoto;
    private readonly State<int> _debuggingState = DebuggingStateNone;
    private const int DebuggingStateNone = 0;
    private const int DebuggingStateRunning = 1;
    private const int DebuggingStateStopped = 2;
    private Bookmark? _stoppedBookmark;

    private Widget BuildEditor(CodeEditorController codeEditorController)
    {
        return new Column()
        {
            Children =
            [
                BuildActionBar(),
                new Expanded() { Child = new CodeEditorWidget(codeEditorController) }
            ]
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
                new Button("Dependencies") { Width = 118, OnTap = OnShowDependencies },
                new Button("Run") { Width = 75, OnTap = OnRunMethod },
                new Button("Debug")
                {
                    Width = 75, OnTap = OnDebugMethod,
                    Enabled = _debuggingState.ToComputed(s => s == DebuggingStateNone)
                },
                new ButtonGroup()
                {
                    Children =
                    [
                        new Button("Resume", MaterialIcons.SkipNext)
                        {
                            Enabled = _debuggingState.ToComputed(s => s == DebuggingStateStopped),
                            OnTap = _ => OnResumeDebugging()
                        },
                        new Button("StepOver", MaterialIcons.NavigateNext)
                        {
                            Enabled = _debuggingState.ToComputed(s => s == DebuggingStateStopped)
                        },
                    ]
                }
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
        if (!_textBuffer.HasOpen)
        {
            await _textBuffer.Open();
            _codeEditorController.Document.Open();
        }

        if (_pendingGoto != null)
        {
            GotoDefinitionCommand.RunOnCodeEditor(_codeEditorController, _pendingGoto);
            _pendingGoto = null;
        }
    }

    private void OnDocumentChanged(DocumentEventArgs e)
    {
        //启动延时任务
        _delayDocChangedTask.Run();
    }

    private async void RunDelayTask()
    {
        //检查代码错误，先前端判断语法，再后端判断语义，都没有问题刷新预览
        //if (_codeEditorController.Document.HasSyntaxError) return;

        //更新Foldings
        try
        {
            var foldings = await FoldingService.GetFoldings(_textBuffer.GetRoslynDocument());
            _codeEditorController.Document.FoldingManager.UpdateFoldings(foldings
                .Select(s => new NewFolding(s.TextSpan.Start, s.TextSpan.Length, "{...}" /*TODO:根据类型*/))
                .OrderBy(s => s.Offset), 0);
        }
        catch (Exception e)
        {
            Notification.Error($"UpdateFoldings error: {e.Message}");
        }

        //检查语法语义错误
        try
        {
            var problems = await GetProblems.Execute(ModelNode);
            _designStore.UpdateProblems(ModelNode, problems);
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

    public void GotoLocation(ILocation location)
    {
        if (location.Offset < 0) return; //无需跳转

        var doc = _codeEditorController.Document;
        if (doc.TextLength == 0)
            _pendingGoto = location;
        else
            GotoDefinitionCommand.RunOnCodeEditor(_codeEditorController, location);
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
        return ModelNode.SaveAsync(null);
    }

    public async Task RefreshAsync()
    {
        throw new NotImplementedException();
        // var srcCode = await Channel.Invoke<string>("sys.DesignService.OpenCodeModel",
        //     new object[] { ModelNode.Id });
        // _codeEditorController.Document.TextContent = srcCode!;
    }

    private async void OnShowDependencies(PointerEvent e)
    {
        var dlg = new DependencyDialog(ModelNode);
        var res = await dlg.ShowAsync();
        if (res != DialogResult.OK)
            return;

        var newList = dlg.Result;
        List<string> added = newList;
        List<string> removed = [];
        //更新的应该由上传新的版本后处理
        if (ServiceModel.Dependencies != null)
        {
            added = newList.Except(ServiceModel.Dependencies).ToList();
            removed = ServiceModel.Dependencies.Except(newList).ToList();
        }

        ServiceModel.Dependencies = newList;
    }

    private async void OnRunMethod(PointerEvent e)
    {
        try
        {
            // 获取光标位置的服务方法
            var methodInfo = await GetServiceMethod.GetByPosition(ModelNode, _codeEditorController.GetCaretOffset());
            // if (methodInfo == null) return;

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

    private async void OnDebugMethod(PointerEvent e)
    {
        try
        {
            // 获取光标位置的服务方法
            var methodInfo = await GetServiceMethod.GetByPosition(ModelNode, _codeEditorController.GetCaretOffset());
            // if (methodInfo == null) return;

            //TODO:暂简单实现且不支持带参数的调用(显示对话框设置参数并显示调用结果)
            if (methodInfo.Args.Length > 0)
                throw new Exception("暂未实现带参数的服务方法调试");

            // collect breakpoints (TODO: 暂不考虑断点表达式)
            var breakpoints = _codeEditorController.Document.BookmarkManager.Marks
                .Select(m => m.LineNumber)
                .ToArray();

            await ClientDebugManager.StartDebugService(ModelNode, methodInfo, breakpoints);
            _debuggingState.Value = DebuggingStateRunning;
        }
        catch (Exception ex)
        {
            Notification.Error($"调试服务方法错误: {ex.Message}");
        }
    }

    void IDebuggableCodeDesigner.OnDebugEvent(IDebugEventArgs eventArgs)
    {
        //Notification.Error($"收到调试事件: {eventArgs.GetType().Name}");

        if (eventArgs is HitBreakpoint hitBreakpoint)
        {
            _debuggingState.Value = DebuggingStateStopped;
            var breakpoint = FindBreakpoint(hitBreakpoint.LineNumber - 1 /*TODO:确认-1*/);
            if (breakpoint != null)
            {
                _stoppedBookmark = breakpoint;
                breakpoint.IsHighlighted = true;
            }
        }
        else if (eventArgs is DebuggerExited debuggerExited)
        {
            _debuggingState.Value = DebuggingStateNone;
        }
    }

    Task<EvaluateResult> IDebuggableCodeDesigner.EvaluateExpression(string expression)
    {
        if (_debuggingState.Value != DebuggingStateStopped)
            throw new Exception("Debugging state is not stopped");

        return ClientDebugManager.EvaluateExpression(expression);
    }

    Task<List<EvaluateResult>> IDebuggableCodeDesigner.ListChildren(string variableName)
    {
        if (_debuggingState.Value != DebuggingStateStopped)
            throw new Exception("Debugging state is not stopped");

        return ClientDebugManager.ListChildren(variableName);
    }

    private Bookmark? FindBreakpoint(int line)
    {
        var bookmarkManager = _codeEditorController.Document.BookmarkManager;
        var found = bookmarkManager.GetFirstMark(b => b.LineNumber == line);
        return found;
    }

    private async void OnResumeDebugging()
    {
        if (_stoppedBookmark != null)
            _stoppedBookmark.IsHighlighted = false;

        try
        {
            await ClientDebugManager.ResumeDebugService();
        }
        catch (Exception e)
        {
            Notification.Error("Resume debugging error: " + e.Message);
        }
    }

    void IDesigner.OnClose()
    {
        if (_debuggingState.Value != DebuggingStateNone)
            ClientDebugManager.ExitDebugService();
    }
}