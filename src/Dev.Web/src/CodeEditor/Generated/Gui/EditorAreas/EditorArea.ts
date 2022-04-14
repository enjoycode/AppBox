import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export abstract class EditorArea {
    protected constructor(textEditor: CodeEditor.TextEditor) {
        this.TextEditor = textEditor;
    }

    protected get Theme(): CodeEditor.TextEditorTheme {
        return this.TextEditor.Theme;
    }

    protected get Document(): CodeEditor.Document {
        return this.TextEditor.Document;
    }

    public readonly TextEditor: CodeEditor.TextEditor;

    public Bounds: PixUI.Rect = PixUI.Rect.Empty;

    public get IsVisible(): boolean {
        return true;
    }

    public get Size(): PixUI.Size {
        return new PixUI.Size(-1, -1);
    }

    public HandlePointerDown(x: number, y: number, buttons: PixUI.PointerButtons) {
    }

    public abstract Paint(canvas: PixUI.Canvas, rect: PixUI.Rect): void;
}
