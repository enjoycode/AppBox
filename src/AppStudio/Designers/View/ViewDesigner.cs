using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppBoxClient;
using CodeEditor;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class ViewDesigner : View, IModelDesigner
    {
        public ViewDesigner(ModelNodeVO modelNode)
        {
            ModelNode = modelNode;
            _previewController = new PreviewController(modelNode);
            _codeEditorController = new CodeEditorController($"{modelNode.Label}.cs", "",
                RoslynCompletionProvider.Default, modelNode.Id);
            _codeEditorController.ContextMenuBuilder = ContextMenuService.BuildContextMenu;
            _codeSyncService = new ModelCodeSyncService(0, modelNode.Id);
            _delayDocChangedTask = new DelayTask(300, RunDelayTask);

            Child = new Row()
            {
                Children = new Widget[]
                {
                    new Expanded(BuildEditor(_codeEditorController), 2),
                    new Expanded(new WidgetPreviewer(_previewController), 1),
                }
            };
        }

        public ModelNodeVO ModelNode { get; }
        private readonly CodeEditorController _codeEditorController;
        private readonly ModelCodeSyncService _codeSyncService;
        private readonly PreviewController _previewController;
        private readonly DelayTask _delayDocChangedTask;
        private bool _hasLoadSourceCode = false;
        
        private ReferenceVO? _pendingGoto;

        private static Widget BuildEditor(CodeEditorController codeEditorController)
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

        private static Widget BuildActionBar()
        {
            return new Container()
            {
                BgColor = new Color(0xFF3C3C3C), Height = 40,
                Padding = EdgeInsets.Only(15, 8, 15, 8),
                Child = new Row(VerticalAlignment.Middle, 10)
                {
                    Children = new Widget[]
                    {
                        new Button("Preview") { Width = 75 },
                        new Button("Debug") { Width = 75 }
                    }
                }
            };
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
            DesignStore.UpdateProblems(ModelNode, problems!);

            if (!problems!.Any(p => p.IsError))
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

        public Widget? GetOutlinePad() => new ViewOutlinePad(_previewController);

        public void GotoDefinition(ReferenceVO reference)
        {
            if (reference.Offset < 0) return; //无需跳转

            var doc = _codeEditorController.Document;
            if (doc.TextLength == 0)
                _pendingGoto = reference;
            else
                GotoDefinitionCommand.RunOnCodeEditor(_codeEditorController, reference);
        }

        public Task SaveAsync()
        {
            return Channel.Invoke("sys.DesignService.SaveModel", new object?[] { ModelNode.Id });
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
}