import * as CodeEditor from '@/CodeEditor'
import * as PixUI from '@/PixUI'
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
        let textEditor = this._codeEditor.Controller.TextEditor;

        //TODO:解决转场动画过程中超出绘制范围
        //方案1: 待实现Widget.VisibleArea属性(向上判断是否Clip直至根)后替换,但无法解决不规则的clip
        //方案2: 绘制CodeEditor时想办法获取canvas的clip并缓存，在这里重新clip相同的区域
        //方案3: 简单判断是否动画过程中，是则干脆不绘制，或者不用Overlay绘制

        canvas.save();

        let pt2Win = this._codeEditor.LocalToWindow(0, 0);
        canvas.translate(pt2Win.X, pt2Win.Y);
        //clip to visible area
        canvas.clipRect(textEditor.TextView.Bounds, CanvasKit.ClipOp.Intersect, false);

        // paint caret and highlight line
        textEditor.Caret.Paint(canvas);

        // paint selection
        let textView = textEditor.TextView;
        let paint = PixUI.PaintUtils.Shared(textEditor.Theme.SelectionColor);
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
