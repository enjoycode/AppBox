import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'
/// <summary>
/// 专用于在Overlay绘制光标、高亮及选择区等
/// </summary>
export class EditorDecorator extends PixUI.Widget {
    public constructor(codeEditor: CodeEditor.CodeEditorWidget) {
        super();
        this._codeEditor = codeEditor;
    }

    private readonly _codeEditor: CodeEditor.CodeEditorWidget;

    public Layout(availableWidth: number, availableHeight: number) {
        this.SetSize(0, 0);
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        canvas.save();

        let pt2Win = this._codeEditor.LocalToWindow(0, 0);
        canvas.translate(pt2Win.X, pt2Win.Y);
        //TODO: clip area

        let textEditor = this._codeEditor.Controller.TextEditor;

        // paint caret and highlight line
        textEditor.Caret.Paint(canvas);

        // paint selection
        let textView = textEditor.TextView;
        let paint = PixUI.PaintUtils.Shared((textEditor.Theme.SelectionColor).Clone());
        for (const selection of textEditor.SelectionManager.SelectionCollection) {
            let startLine = selection.StartPosition.Line;
            let endLine = selection.EndPosition.Line;

            for (let i = startLine; i <= endLine; i++) {
                if (!textEditor.Document.FoldingManager.IsLineVisible(i))
                    continue;

                let startXPos = 0;
                let endXPos = 0;
                if (i == startLine) {
                    startXPos = textView.GetDrawingXPos(i, selection.StartPosition.Column);
                    if (i == endLine)
                        endXPos = textView.GetDrawingXPos(i, selection.EndPosition.Column);
                    else
                        endXPos = textView.Bounds.Width;
                } else if (i == endLine) {
                    endXPos = textView.GetDrawingXPos(i, selection.EndPosition.Column);
                } else {
                    endXPos = textView.Bounds.Width;
                }

                let yPos = textView.Bounds.Top +
                    textEditor.Document.GetVisibleLine(i) * textView.FontHeight -
                    textEditor.VirtualTop.Y;
                canvas.drawRect(PixUI.Rect.FromLTWH(startXPos + textView.Bounds.Left, yPos, endXPos - startXPos, textView.FontHeight), paint);
            }
        }


        canvas.restore();
    }

    public Init(props: Partial<EditorDecorator>): EditorDecorator {
        Object.assign(this, props);
        return this;
    }
}
