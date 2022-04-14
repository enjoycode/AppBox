import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class Point {
    public Row: number = 0;
    public Column: number = 0;

    public static FromLocation(location: CodeEditor.TextLocation): Point {
        throw new System.Exception();
    }
}
