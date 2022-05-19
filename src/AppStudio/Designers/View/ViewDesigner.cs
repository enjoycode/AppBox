using System.Threading.Tasks;
using AppBoxClient;
using CodeEditor;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class ViewDesigner : View
    {
        private readonly ModelNode _modelNode;
        private readonly CodeEditorController _codeEditorController;
        private readonly ModelCodeSyncService _codeSyncService;
        private readonly PreviewController _previewController;
        private readonly DelayTask _delayDocChangedTask;
        private bool _hasLoadSourceCode = false;

        public ViewDesigner(ModelNode modelNode)
        {
            _modelNode = modelNode;
            _previewController = new PreviewController(modelNode);
            _codeEditorController = new CodeEditorController("fileName.cs", "");
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
                Color = new Color(0xFF3C3C3C), Height = 40,
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

        private async ValueTask TryLoadSourceCode()
        {
            if (!_hasLoadSourceCode)
            {
                _hasLoadSourceCode = true;
                var srcCode = (string)await Channel.Invoke("sys.DesignService.OpenViewModel",
                    new object[] { _modelNode.Id });
                _codeEditorController.Document.TextContent = srcCode;
                //订阅代码变更事件
                _codeEditorController.Document.DocumentChanged += OnDocumentChanged;
            }
        }

        private void OnDocumentChanged(DocumentEventArgs e)
        {
            //同步变更至服务端
            _codeSyncService.OnDocumentChanged(e);
            //启动延时任务
            _delayDocChangedTask.Run();
        }

        private void RunDelayTask()
        {
            //TODO:获取错误列表，如果没有错误刷新预览
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
    }
}