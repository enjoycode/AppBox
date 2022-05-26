import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'

export interface ICompletionItem {
    get Kind(): CodeEditor.CompletionItemKind;

    get Label(): string;

    get InsertText(): Nullable<string>;

    get Detail(): Nullable<string>;

}

export interface ICompletionProvider {
    get TriggerCharacters(): System.IEnumerable<number>;


    ProvideCompletionItems(document: CodeEditor.Document, offset: number, completionWord: Nullable<string>): System.Task<Nullable<System.IList<ICompletionItem>>>;
}

export class CompletionWord {
    public readonly Offset: number;
    public readonly Word: string;

    public constructor(offset: number, word: string) {
        this.Offset = offset;
        this.Word = word;
    }
}
