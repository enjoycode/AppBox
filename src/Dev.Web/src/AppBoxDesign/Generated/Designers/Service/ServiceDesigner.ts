import * as System from '@/System'
import * as AppBoxClient from '@/AppBoxClient'
import * as CodeEditor from '@/CodeEditor'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class ServiceDesigner extends PixUI.View implements AppBoxDesign.IDesigner {
    public constructor(modelNode: AppBoxDesign.ModelNode) {
        super();
        this._modelNode = modelNode;
        this._codeEditorController = new CodeEditor.CodeEditorController(`${modelNode.Label}.cs`, "", AppBoxDesign.RoslynCompletionProvider.Default, modelNode.Id);
        this._codeSyncService = new AppBoxDesign.ModelCodeSyncService(0, modelNode.Id);
        this._delayDocChangedTask = new PixUI.DelayTask(300, this.RunDelayTask.bind(this));

        this.Child = ServiceDesigner.BuildEditor(this._codeEditorController);
    }

    private readonly _modelNode: AppBoxDesign.ModelNode;
    private readonly _codeEditorController: CodeEditor.CodeEditorController;
    private readonly _codeSyncService: AppBoxDesign.ModelCodeSyncService;
    private readonly _delayDocChangedTask: PixUI.DelayTask;
    private _hasLoadSourceCode: boolean = false;

    private static BuildEditor(codeEditorController: CodeEditor.CodeEditorController): PixUI.Widget {
        return new PixUI.Column().Init(
            {
                Children: [ServiceDesigner.BuildActionBar(), new PixUI.Expanded().Init({Child: new CodeEditor.CodeEditorWidget(codeEditorController)})]
            });
    }

    private static BuildActionBar(): PixUI.Widget {
        return new PixUI.Container().Init(
            {
                BgColor: PixUI.State.op_Implicit_From(new PixUI.Color(0xFF3C3C3C)),
                Height: PixUI.State.op_Implicit_From(40),
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.Only(15, 8, 15, 8)),
                Child: new PixUI.Row(PixUI.VerticalAlignment.Middle, 10).Init(
                    {
                        Children: [new PixUI.Button(PixUI.State.op_Implicit_From("Run")).Init({Width: PixUI.State.op_Implicit_From(75)}), new PixUI.Button(PixUI.State.op_Implicit_From("Debug")).Init({Width: PixUI.State.op_Implicit_From(75)})
                        ]
                    })
            });
    }

    protected OnMounted() {
        super.OnMounted();
        this.TryLoadSourceCode();
    }

    private async TryLoadSourceCode() {
        if (this._hasLoadSourceCode) return;
        this._hasLoadSourceCode = true;

        let srcCode = await AppBoxClient.Channel.Invoke<string>("sys.DesignService.OpenServiceModel", [this._modelNode.Id]);
        this._codeEditorController.Document.TextContent = srcCode;
        //订阅代码变更事件
        this._codeEditorController.Document.DocumentChanged.Add(this.OnDocumentChanged, this);
    }

    private OnDocumentChanged(e: CodeEditor.DocumentEventArgs) {
        //同步变更至服务端
        this._codeSyncService.OnDocumentChanged(e);
        //TODO: check syntax error first.
        //启动延时任务
        this._delayDocChangedTask.Run();
    }

    private async RunDelayTask() {
        //检查代码错误，先前端判断语法，再后端判断语义，都没有问题刷新预览
        //if (_codeEditorController.Document.HasSyntaxError) return; //TODO:获取语法错误列表

        let problems = await AppBoxClient.Channel.Invoke<System.IList<AppBoxDesign.CodeProblem>>("sys.DesignService.GetProblems", [false, this._modelNode.Id]);
        AppBoxDesign.DesignStore.UpdateProblems(this._modelNode, problems);
    }

    public Dispose() {
        super.Dispose();
        if (this._hasLoadSourceCode) {
            this._codeEditorController.Document.DocumentChanged.Remove(this.OnDocumentChanged, this);
        }
    }

    public SaveAsync(): Promise<void> {
        return AppBoxClient.Channel.Invoke("sys.DesignService.SaveModel", [this._modelNode.Id]);
    }

    public Init(props: Partial<ServiceDesigner>): ServiceDesigner {
        Object.assign(this, props);
        return this;
    }
}
