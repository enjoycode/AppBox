import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'

export interface ICompletionProvider {
    get TriggerCharacters(): Uint16Array;


    ProvideCompletionItems(document: CodeEditor.Document, location: CodeEditor.TextLocation, completionWord: Nullable<string>): System.Task<Nullable<System.IList<CodeEditor.CompletionItem>>>;
}

export class CompletionWord {
    public readonly Offset: number;
    public readonly Word: string;

    public constructor(offset: number, word: string) {
        this.Offset = offset;
        this.Word = word;
    }
}
