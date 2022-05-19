import * as AppBoxClient from '@/AppBoxClient'
import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class ViewDesigner extends PixUI.View {
    private readonly _modelNode: AppBoxDesign.ModelNode;
    private readonly _codeEditorController: CodeEditor.CodeEditorController;
    private readonly _codeSyncService: AppBoxDesign.ModelCodeSyncService;
    private readonly _previewController: AppBoxDesign.PreviewController;
    private _hasLoadSourceCode: boolean = false;

    public constructor(modelNode: AppBoxDesign.ModelNode) {
        super();
        this._modelNode = modelNode;
        this._previewController = new AppBoxDesign.PreviewController(modelNode);
        this._codeEditorController = new CodeEditor.CodeEditorController("fileName.cs", "");
        this._codeSyncService = new AppBoxDesign.ModelCodeSyncService(0, modelNode.Id);

        this.Child = new PixUI.Row().Init({Children: [new PixUI.Expanded(this.BuildEditor(this._codeEditorController), 2), new PixUI.Expanded(new AppBoxDesign.WidgetPreviewer(this._previewController), 1)]});
    }

    private BuildEditor(codeEditorController: CodeEditor.CodeEditorController): PixUI.Widget {
        return new PixUI.Column().Init({Children: [this.BuildActionBar(), new PixUI.Expanded().Init({Child: new CodeEditor.CodeEditorWidget(codeEditorController)})]});
    }

    private BuildActionBar(): PixUI.Widget {
        return new PixUI.Container().Init({
            Color: PixUI.State.op_Implicit_From(new PixUI.Color(0xFF3C3C3C)),
            Height: PixUI.State.op_Implicit_From(40),
            Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.Only(15, 8, 15, 8)),
            Child: new PixUI.Row(PixUI.VerticalAlignment.Middle, 10).Init({
                Children: [
                    new PixUI.Button(PixUI.State.op_Implicit_From("Preview"))
                        .Init({Width: PixUI.State.op_Implicit_From(75)}),
                    new PixUI.Button(PixUI.State.op_Implicit_From("Debug"))
                        .Init({
                            Width: PixUI.State.op_Implicit_From(75),
                            OnTap: (e) => this._previewController.Invalidate()
                        })
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
            let srcCode = <string><unknown>await AppBoxClient.Channel.Invoke("sys.DesignService.OpenViewModel", [this._modelNode.Id]);
            this._codeEditorController.Document.TextContent = srcCode;
            //订阅代码变更事件同步至服务端
            this._codeEditorController.Document.DocumentChanged.Add(this._codeSyncService.OnDocumentChanged, this._codeSyncService);
        }
    }

    public Dispose() {
        super.Dispose();
        if (this._hasLoadSourceCode)
            this._codeEditorController.Document.DocumentChanged.Remove(this._codeSyncService.OnDocumentChanged, this._codeSyncService);
    }

    public Init(props: Partial<ViewDesigner>): ViewDesigner {
        Object.assign(this, props);
        return this;
    }
}
