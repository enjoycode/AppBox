import {ITextBuffer, TSPoint} from "./index";

export class ParserInput {
    private readonly _textBuffer: ITextBuffer;
    private readonly _readBuffer: Uint16Array;

    constructor(textBuffer: ITextBuffer) {
        this._textBuffer = textBuffer;
        this._readBuffer = new Uint16Array(1024);
    }

    public Read(startIndex: number, startPoint?: TSPoint, endIndex?: number): string | null {
        console.log(`ParserInput.Read: ${startIndex} ${startPoint} ${endIndex}`);

        const offset = startIndex;
        if (offset >= this._textBuffer.Length)
            return null;

        let count = Math.min(this._readBuffer.length, this._textBuffer.Length - offset);
        if (endIndex) {
            count = Math.min(count, endIndex - startIndex);
        }
        this._textBuffer.CopyTo(this._readBuffer, offset, count);
        // @ts-ignore
        return String.fromCharCode.apply(null, this._readBuffer.subarray(0, count));
    }

}