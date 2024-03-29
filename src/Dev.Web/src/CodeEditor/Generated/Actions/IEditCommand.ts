import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'

export interface IEditCommand {
    Execute(editor: CodeEditor.TextEditor): void;
}

export class CustomEditCommand implements IEditCommand {
    public constructor(command: System.Action1<CodeEditor.TextEditor>) {
        this._command = command;
    }

    private readonly _command: System.Action1<CodeEditor.TextEditor>;

    public Execute(editor: CodeEditor.TextEditor) {
        this._command(editor);
    }
}
