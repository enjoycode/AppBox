using System.Collections.Generic;
using System.Threading.Tasks;
using AppBoxClient;
using CodeEditor;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class ServiceDesigner : View, IDesigner
    {
        public ServiceDesigner(ModelNode modelNode)
        {
            _modelNode = modelNode;
            _codeEditorController = new CodeEditorController($"{modelNode.Label}.cs", "",
                RoslynCompletionProvider.Default, modelNode.Id);
            _codeSyncService = new ModelCodeSyncService(0, modelNode.Id);
            _delayDocChangedTask = new DelayTask(300, RunDelayTask);

            Child = BuildEditor(_codeEditorController);
        }

        private readonly ModelNode _modelNode;
        private readonly CodeEditorController _codeEditorController;
        private readonly ModelCodeSyncService _codeSyncService;
        private readonly DelayTask _delayDocChangedTask;
        private bool _hasLoadSourceCode = false;

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
                        new Button("Run") { Width = 75 },
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

            var srcCode = await Channel.Invoke<string>("sys.DesignService.OpenServiceModel",
                new object[] { _modelNode.Id });
            _codeEditorController.Document.TextContent = srcCode;
            //订阅代码变更事件
            _codeEditorController.Document.DocumentChanged += OnDocumentChanged;
        }

        private void OnDocumentChanged(DocumentEventArgs e)
        {
            //同步变更至服务端
            _codeSyncService.OnDocumentChanged(e);
            //TODO: check syntax error first.
            //启动延时任务
            _delayDocChangedTask.Run();
        }

        private async void RunDelayTask()
        {
            //检查代码错误，先前端判断语法，再后端判断语义，都没有问题刷新预览
            //if (_codeEditorController.Document.HasSyntaxError) return; //TODO:获取语法错误列表

            var problems = await Channel.Invoke<IList<CodeProblem>>("sys.DesignService.GetProblems",
                new object?[] { false, _modelNode.Id });
            DesignStore.UpdateProblems(_modelNode, problems);
        }

        public override void Dispose()
        {
            base.Dispose();
            if (_hasLoadSourceCode)
            {
                _codeEditorController.Document.DocumentChanged -= OnDocumentChanged;
            }
        }

        public Task SaveAsync()
        {
            return Channel.Invoke("sys.DesignService.SaveModel", new object?[] { _modelNode.Id });
        }
    }
}