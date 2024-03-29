import * as System from '@/System'
import * as AppBoxClient from '@/AppBoxClient'
import * as CodeEditor from '@/CodeEditor'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class ViewDesigner extends PixUI.View implements AppBoxDesign.IModelDesigner {
    private static readonly $meta_AppBoxDesign_IModelDesigner = true;

    public constructor(modelNode: AppBoxDesign.ModelNodeVO) {
        super();
        this.ModelNode = modelNode;
        this._previewController = new AppBoxDesign.PreviewController(modelNode);
        this._codeEditorController = new CodeEditor.CodeEditorController(`${modelNode.Label}.cs`, "",
            AppBoxDesign.RoslynCompletionProvider.Default, modelNode.Id);
        this._codeEditorController.ContextMenuBuilder = AppBoxDesign.ContextMenuService.BuildContextMenu;
        this._codeSyncService = new AppBoxDesign.ModelCodeSyncService(0, modelNode.Id);
        this._delayDocChangedTask = new PixUI.DelayTask(300, this.RunDelayTask.bind(this));

        this.Child = new PixUI.Row().Init(
            {
                Children:
                    [
                        new PixUI.Expanded(ViewDesigner.BuildEditor(this._codeEditorController), 2),
                        new PixUI.Expanded(new AppBoxDesign.WidgetPreviewer(this._previewController), 1),
                    ]
            });
    }

    #ModelNode: AppBoxDesign.ModelNodeVO;
    public get ModelNode() {
        return this.#ModelNode;
    }

    private set ModelNode(value) {
        this.#ModelNode = value;
    }

    private readonly _codeEditorController: CodeEditor.CodeEditorController;
    private readonly _codeSyncService: AppBoxDesign.ModelCodeSyncService;
    private readonly _previewController: AppBoxDesign.PreviewController;
    private readonly _delayDocChangedTask: PixUI.DelayTask;
    private _hasLoadSourceCode: boolean = false;

    private _pendingGoto: Nullable<AppBoxDesign.ReferenceVO>;

    private static BuildEditor(codeEditorController: CodeEditor.CodeEditorController): PixUI.Widget {
        return new PixUI.Column().Init(
            {
                Children:
                    [
                        ViewDesigner.BuildActionBar(),
                        new PixUI.Expanded().Init({Child: new CodeEditor.CodeEditorWidget(codeEditorController)}),
                    ]
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
                        Children:
                            [
                                new PixUI.Button(PixUI.State.op_Implicit_From("Preview")).Init({Width: PixUI.State.op_Implicit_From(75)}),
                                new PixUI.Button(PixUI.State.op_Implicit_From("Debug")).Init({Width: PixUI.State.op_Implicit_From(75)})
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

        let srcCode = await AppBoxClient.Channel.Invoke<string>("sys.DesignService.OpenCodeModel",
            [this.ModelNode.Id]);
        this._codeEditorController.Document.TextContent = srcCode!;
        //订阅代码变更事件
        this._codeEditorController.Document.DocumentChanged.Add(this.OnDocumentChanged, this);

        if (this._pendingGoto != null) {
            AppBoxDesign.GotoDefinitionCommand.RunOnCodeEditor(this._codeEditorController, this._pendingGoto);
            this._pendingGoto = null;
        }
    }

    private OnDocumentChanged(e: CodeEditor.DocumentEventArgs) {
        //同步变更至服务端
        this._codeSyncService.OnDocumentChanged(e);
        //启动延时任务
        this._delayDocChangedTask.Run();
    }

    private async RunDelayTask() {
        //检查代码错误，先前端判断语法，再后端判断语义，都没有问题刷新预览
        //if (_codeEditorController.Document.HasSyntaxError) return; //TODO:获取语法错误列表

        let problems = await AppBoxClient.Channel.Invoke<System.IList<AppBoxDesign.CodeProblem>>("sys.DesignService.GetProblems",
            [false, this.ModelNode.Id]);
        AppBoxDesign.DesignStore.UpdateProblems(this.ModelNode, problems!);

        if (!problems!.Any(p => p.IsError))
            this._previewController.Invalidate();
    }

    public Dispose() {
        super.Dispose();
        if (this._hasLoadSourceCode) {
            this._codeEditorController.Document.DocumentChanged.Remove(this.OnDocumentChanged, this);
        }
    }

    public GetOutlinePad(): Nullable<PixUI.Widget> {
        return new AppBoxDesign.ViewOutlinePad(this._previewController);
    }

    public GotoDefinition(reference: AppBoxDesign.ReferenceVO) {
        if (reference.Offset < 0) return; //无需跳转

        let doc = this._codeEditorController.Document;
        if (doc.TextLength == 0)
            this._pendingGoto = reference;
        else
            AppBoxDesign.GotoDefinitionCommand.RunOnCodeEditor(this._codeEditorController, reference);
    }

    public SaveAsync(): Promise<void> {
        return AppBoxClient.Channel.Invoke("sys.DesignService.SaveModel", [this.ModelNode.Id]);
    }

    public async RefreshAsync(): Promise<void> {
        let srcCode = await AppBoxClient.Channel.Invoke<string>("sys.DesignService.OpenCodeModel",
            [this.ModelNode.Id]);
        this._codeEditorController.Document.DocumentChanged.Remove(this.OnDocumentChanged, this);
        this._codeEditorController.Document.TextContent = srcCode!;
        this._codeEditorController.Document.DocumentChanged.Add(this.OnDocumentChanged, this);
    }
}
