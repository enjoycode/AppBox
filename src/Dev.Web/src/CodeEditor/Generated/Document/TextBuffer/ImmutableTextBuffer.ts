import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class ImmutableTextBuffer implements CodeEditor.ITextBuffer {
    public constructor(buffer: Nullable<CodeEditor.ImmutableText> = null) {
        this._buffer = buffer ?? CodeEditor.ImmutableText.Empty;
    }

    private _buffer: CodeEditor.ImmutableText;

    public get ImmutableText(): CodeEditor.ImmutableText {
        return this._buffer;
    }

    public get Length(): number {
        return this._buffer.Length;
    }

    public GetCharAt(offset: number): number {
        return this._buffer.GetText(offset, 1).GetCharAt(0);
    }

    public GetText(offset: number, length: number): string {
        return this._buffer.ToString(offset, length);
    }

    public Insert(offset: number, text: string) {
        this._buffer = this._buffer.InsertText(offset, text);
    }

    public Remove(offset: number, length: number) {
        this._buffer = this._buffer.RemoveText(offset, length);
    }

    public Replace(offset: number, length: number, text: string) {
        this._buffer = this._buffer.RemoveText(offset, length);
        if (!System.IsNullOrEmpty(text))
            this._buffer = this._buffer.InsertText(offset, text);
    }

    public SetContent(text: string) {
        this._buffer = CodeEditor.ImmutableText.FromString(text);
    }

    public CopyTo(dest: Uint16Array, offset: number, count: number) {
        this._buffer.CopyTo(offset, dest, count);
    }

    public Init(props: Partial<ImmutableTextBuffer>): ImmutableTextBuffer {
        Object.assign(this, props);
        return this;
    }
}
