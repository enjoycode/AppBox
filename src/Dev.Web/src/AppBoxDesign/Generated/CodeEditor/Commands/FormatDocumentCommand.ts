import * as AppBoxDesign from '@/AppBoxDesign'
import * as AppBoxClient from '@/AppBoxClient'
import * as CodeEditor from '@/CodeEditor'

export class FormatDocumentCommand implements CodeEditor.IEditCommand {
    public static readonly Default: FormatDocumentCommand = new FormatDocumentCommand();

    public async Execute(editor: CodeEditor.TextEditor) {
        let modelIdString = editor.Document.Tag!;

        let res = await AppBoxClient.Channel.Invoke<AppBoxDesign.TextChange[]>("sys.DesignService.FormatDocument", [modelIdString]);
        if (res == null || res.length == 0) return;

        //TODO:暂逐个处理，另UpdateCaretPosition至有效位置
        editor.Document.StartUndoGroup();
        for (const change of res) {
            editor.Document.Replace(change.Offset, change.Length, change.Text ?? '');
        }
        editor.Document.EndUndoGroup();
    }
}