import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export interface ITextBuffer {
    get Length(): number;


    Insert(offset: number, text: string): void;

    Remove(offset: number, length: number): void;

    Replace(offset: number, length: number, text: string): void;

    GetText(offset: number, length: number): string;

    GetCharAt(offset: number): any;

    SetContent(text: string): void;

    CopyTo(dest: Uint16Array, offset: number, count: number): void;
}
