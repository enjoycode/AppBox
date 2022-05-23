import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'

export interface ICompletionItem {
    get Kind(): CodeEditor.CompletionItemKind;

    get Label(): string;

    get InsertText(): Nullable<string>;

    get Detail(): Nullable<string>;

}

export interface ICompletionProvider {
    get TriggerCharacters(): Uint16Array;


    ProvideCompletionItems(document: CodeEditor.Document, location: CodeEditor.TextLocation, completionWord: Nullable<string>): System.Task<Nullable<System.IList<ICompletionItem>>>;
}

export class CompletionWord {
    public readonly Offset: number;
    public readonly Word: string;

    public constructor(offset: number, word: string) {
        this.Offset = offset;
        this.Word = word;
    }
}
