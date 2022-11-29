import * as AppBoxDesign from '@/AppBoxDesign'
import * as AppBoxClient from '@/AppBoxClient'
import * as CodeEditor from '@/CodeEditor'

export class GotoDefinitionCommand implements CodeEditor.IEditCommand {
    public static readonly Default: GotoDefinitionCommand = new GotoDefinitionCommand();

    public async Execute(editor: CodeEditor.TextEditor) {
        let modelIdString = editor.Document.Tag!;
        let line = editor.Caret.Line;
        let column = editor.Caret.Column;

        let res = await AppBoxClient.Channel.Invoke<Nullable<AppBoxDesign.ReferenceVO>>("sys.DesignService.GotoDefinition", [modelIdString, line, column]);
        if (res == null) return;

        //找到对应的节点, TODO: 考虑优化当前节点即目标节点
        let node = AppBoxDesign.DesignStore.FindDesignNodeById(res.ModelId);
        if (node != null)
            AppBoxDesign.DesignStore.OpenOrActiveDesigner(node, res); //打开或激活节点
    }

    public static RunOnCodeEditor(controller: CodeEditor.CodeEditorController, reference: AppBoxDesign.ReferenceVO) {
        let doc = controller.Document;
        let pos = doc.OffsetToPosition(reference.Offset);
        let end = doc.OffsetToPosition(reference.Offset + reference.Length);
        controller.SetCaret(pos.Line, pos.Column);
        controller.SetSelection((pos).Clone(), (end).Clone());
    }
}