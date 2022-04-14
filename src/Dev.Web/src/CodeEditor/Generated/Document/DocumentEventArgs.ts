import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class DocumentEventArgs {
    public constructor(document: CodeEditor.Document, offset: number, length: number, text: string) {
        this.Document = document;
        this.Offset = offset;
        this.Length = length;
        this.Text = text;
    }

    public readonly Document: CodeEditor.Document;
    public readonly Offset: number;
    public readonly Length: number;
    public readonly Text: string;
}
