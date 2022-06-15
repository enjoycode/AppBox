import * as AppBoxClient from '@/AppBoxClient'
import * as System from '@/System'
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
                Color: PixUI.State.op_Implicit_From(new PixUI.Color(0xFF3C3C3C)),
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

    private async TryLoadSourceCode(): System.ValueTask {
        if (!this._hasLoadSourceCode) {
            this._hasLoadSourceCode = true;
            let srcCode = <string><unknown>await AppBoxClient.Channel.Invoke("sys.DesignService.OpenServiceModel", [this._modelNode.Id]);
            this._codeEditorController.Document.TextContent = srcCode;
            //订阅代码变更事件
            this._codeEditorController.Document.DocumentChanged.Add(this.OnDocumentChanged, this);
        }
    }

    private OnDocumentChanged(e: CodeEditor.DocumentEventArgs) {
        //同步变更至服务端
        this._codeSyncService.OnDocumentChanged(e);
        //TODO: check syntax error first.
        //启动延时任务
        this._delayDocChangedTask.Run();
    }

    private RunDelayTask() {
        //TODO:获取错误列表
    }

    public Dispose() {
        super.Dispose();
        if (this._hasLoadSourceCode) {
            this._codeEditorController.Document.DocumentChanged.Remove(this.OnDocumentChanged, this);
        }
    }

    public async SaveAsync(): Promise<void> {
        await AppBoxClient.Channel.Invoke("sys.DesignService.SaveModel", [this._modelNode.Id]);
    }

    public Init(props: Partial<ServiceDesigner>): ServiceDesigner {
        Object.assign(this, props);
        return this;
    }
}
