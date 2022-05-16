import * as CodeEditor from '@/CodeEditor'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class ViewDesigner extends PixUI.View {
    private readonly _modelNode: AppBoxDesign.ModelNode;
    private readonly _codeEditorController: CodeEditor.CodeEditorController;

    public constructor(modelNode: AppBoxDesign.ModelNode) {
        super();
        this._modelNode = modelNode;
        this._codeEditorController = new CodeEditor.CodeEditorController("fileName.cs", "");

        this.Child = ViewDesigner.BuildEditor(this._codeEditorController);
    }

    private static BuildEditor(codeEditorController: CodeEditor.CodeEditorController): PixUI.Widget {
        return new PixUI.Column().Init({Children: [ViewDesigner.BuildActionBar(), new PixUI.Expanded().Init({Child: new CodeEditor.CodeEditorWidget(codeEditorController)})]});
    }

    private static BuildActionBar(): PixUI.Widget {
        return new PixUI.Container().Init({
            Color: PixUI.State.op_Implicit_From(new PixUI.Color(0xFF3C3C3C)),
            Height: PixUI.State.op_Implicit_From(40),
            Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.Only(15, 8, 15, 8)),
            Child: new PixUI.Row(PixUI.VerticalAlignment.Middle, 10).Init({Children: [
                new PixUI.Button(PixUI.State.op_Implicit_From("Preview")).Init({Width: 75 .obs}), 
                    new PixUI.Button(PixUI.State.op_Implicit_From("Debug")).Init({Width: 75 .obs})
                ]}
            )
        });
    }

    public Init(props: Partial<ViewDesigner>): ViewDesigner {
        Object.assign(this, props);
        return this;
    }
}
