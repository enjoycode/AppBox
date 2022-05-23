export interface ITextBuffer {
    get Length(): number;


    Insert(offset: number, text: string): void;

    Remove(offset: number, length: number): void;

    Replace(offset: number, length: number, text: string): void;

    GetText(offset: number, length: number): string;

    GetCharAt(offset: number): number;

    SetContent(text: string): void;

    CopyTo(dest: Uint16Array, offset: number, count: number): void;
}
