import * as System from '@/System'
import * as AppBoxCore from '@/AppBoxCore'
import * as CodeEditor from '@/CodeEditor'

export class CompletionItem implements CodeEditor.ICompletionItem, AppBoxCore.IBinSerializable {
    #Kind: CodeEditor.CompletionItemKind = 0;
    public get Kind() {
        return this.#Kind;
    }

    private set Kind(value) {
        this.#Kind = value;
    }

    #Label: string = "";
    public get Label() {
        return this.#Label;
    }

    private set Label(value) {
        this.#Label = value;
    }

    #InsertText: Nullable<string>;
    public get InsertText() {
        return this.#InsertText;
    }

    private set InsertText(value) {
        this.#InsertText = value;
    }

    #Detail: Nullable<string>;
    public get Detail() {
        return this.#Detail;
    }

    private set Detail(value) {
        this.#Detail = value;
    }

    public WriteTo(ws: AppBoxCore.IOutputStream) {
        throw new System.NotSupportedException();
    }

    public ReadFrom(rs: AppBoxCore.IInputStream) {
        this.Kind = <CodeEditor.CompletionItemKind><unknown>rs.ReadByte();
        this.Label = rs.ReadString()!;
        this.InsertText = rs.ReadString();
        this.Detail = rs.ReadString();
    }
}
