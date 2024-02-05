using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppBoxClient;
using CodeEditor;
using PixUI;

namespace AppBoxDesign;

internal sealed class ViewCodeDesigner : View, ICodeDesigner
{
    public ViewCodeDesigner(DesignStore designStore, ModelNodeVO modelNode)
    {
        _designStore = designStore;
        ModelNode = modelNode;
        _previewController = new PreviewController(modelNode);
        _codeEditorController = new CodeEditorController($"{modelNode.Label}.cs", "",
            RoslynCompletionProvider.Default, modelNode.Id);
        _codeEditorController.ContextMenuBuilder = e => ContextMenuService.BuildContextMenu(_designStore, e);
        _codeSyncService = new ModelCodeSyncService(0, modelNode.Id);
        _delayDocChangedTask = new DelayTask(300, RunDelayTask);

        Child = new Splitter
        {
            Fixed = Splitter.FixedPanel.Panel2,
            Distance = 380,
            Panel2Collapsed = _hidePreviewer,
            Panel1 = BuildEditor(_codeEditorController),
            Panel2 = new WidgetPreviewer(_previewController),
        };
    }

    public ModelNodeVO ModelNode { get; }
    private readonly DesignStore _designStore;
    private readonly CodeEditorController _codeEditorController;
    private readonly ModelCodeSyncService _codeSyncService;
    private readonly PreviewController _previewController;
    private readonly DelayTask _delayDocChangedTask;
    private bool _hasLoadSourceCode;
    private readonly State<bool> _hidePreviewer = true;

    private ReferenceVO? _pendingGoto;

    private Widget BuildEditor(CodeEditorController codeEditorController) => new Column
    {
        Children =
        {
            BuildActionBar(),
            new Expanded() { Child = new CodeEditorWidget(codeEditorController) },
        }
    };

    private Widget BuildActionBar() => new Container
    {
        FillColor = new Color(0xFF3C3C3C), Height = 40,
        Padding = EdgeInsets.Only(15, 8, 15, 8),
        Child = new Row(VerticalAlignment.Middle, 10)
        {
            Children = new Widget[]
            {
                new Button("Preview") { Width = 75, OnTap = SwitchPreviewer },
                new Button("Debug") { Width = 75 }
            }
        }
    };

    private void SwitchPreviewer(PointerEvent e)
    {
        _hidePreviewer.Value = !_hidePreviewer.Value;
        if (!_hidePreviewer.Value)
            _previewController.Invalidate();
    }

    protected override void OnMounted()
    {
        base.OnMounted();
        TryLoadSourceCode();
    }

    private async void TryLoadSourceCode()
    {
        if (_hasLoadSourceCode) return;
        _hasLoadSourceCode = true;

        var srcCode = await Channel.Invoke<string>("sys.DesignService.OpenCodeModel",
            new object[] { ModelNode.Id });
        _codeEditorController.Document.TextContent = srcCode!;
        //订阅代码变更事件
        _codeEditorController.Document.DocumentChanged += OnDocumentChanged;

        if (_pendingGoto != null)
        {
            GotoDefinitionCommand.RunOnCodeEditor(_codeEditorController, _pendingGoto);
            _pendingGoto = null;
        }
    }

    private void OnDocumentChanged(DocumentEventArgs e)
    {
        //同步变更至服务端
        _codeSyncService.OnDocumentChanged(e);
        //启动延时任务
        _delayDocChangedTask.Run();
    }

    private async void RunDelayTask()
    {
        //检查代码错误，先前端判断语法，再后端判断语义，都没有问题刷新预览
        //if (_codeEditorController.Document.HasSyntaxError) return; //TODO:获取语法错误列表

        var problems = await Channel.Invoke<IList<CodeProblem>>("sys.DesignService.GetProblems",
            new object?[] { false, ModelNode.Id });
        _designStore.UpdateProblems(ModelNode, problems!);

        if (!problems!.Any(p => p.IsError) && !_hidePreviewer.Value)
            _previewController.Invalidate();
    }

    public override void Dispose()
    {
        base.Dispose();
        if (_hasLoadSourceCode)
        {
            _codeEditorController.Document.DocumentChanged -= OnDocumentChanged;
        }
    }

    public Widget GetOutlinePad() => new ViewOutlinePad(_previewController);

    public Widget? GetToolboxPad() => null;

    public void GotoDefinition(ReferenceVO reference)
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
        var srcCode = await Channel.Invoke<string>("sys.DesignService.OpenCodeModel",
            new object[] { ModelNode.Id });
        _codeEditorController.Document.DocumentChanged -= OnDocumentChanged;
        _codeEditorController.Document.TextContent = srcCode!;
        _codeEditorController.Document.DocumentChanged += OnDocumentChanged;
    }
}