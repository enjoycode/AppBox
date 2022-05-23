import * as CodeEditor from '@/CodeEditor'

export class CompletionItem {
    public readonly Kind: CodeEditor.CompletionItemKind;
    public readonly Label: string;
    public readonly InsertText: Nullable<string>;
    public readonly Detail: Nullable<string>;

    public constructor(kind: CodeEditor.CompletionItemKind, label: string, insertText: Nullable<string> = null, detail: Nullable<string> = null) {
        this.Kind = kind;
        this.Label = label;
        this.InsertText = insertText;
        this.Detail = detail;
    }
}
