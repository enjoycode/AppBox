import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class GutterArea extends CodeEditor.EditorArea {
    public constructor(textEditor: CodeEditor.TextEditor) {
        super(textEditor);
        this._numberCache = this.GenerateNumberCache();
        this._numberWidth = this._numberCache[7].getLongestLine();
    }

    private readonly _numberCache: PixUI.Paragraph[];
    private readonly _numberWidth: number;

    private GenerateNumberCache(): PixUI.Paragraph[] {
        let cache = new Array<PixUI.Paragraph>(10);
        let ts = PixUI.MakeTextStyle({color: this.Theme.LineNumberColor});
        for (let i = 0; i < 10; i++) {
            let ps = PixUI.MakeParagraphStyle({maxLines: 1});
            let pb = PixUI.MakeParagraphBuilder(ps);
            pb.pushStyle(ts);
            pb.addText(i.toString());
            let ph = pb.build();
            ph.layout(Number.MAX_VALUE);
            cache[i] = ph;
            pb.delete();
        }

        return cache;
    }

    public get Size(): PixUI.Size {
        return new PixUI.Size(this._numberWidth * 5, -1);
    }

    public Paint(canvas: PixUI.Canvas, rect: PixUI.Rect) {
        if (rect.Width <= 0 || rect.Height <= 0) return;

        // background
        let paint = PixUI.PaintUtils.Shared(this.Theme.LineBgColor);
        canvas.drawRect(rect, paint);

        // line numbers
        let lineHeight = this.TextEditor.TextView.FontHeight;
        let visibleLineRemainder = this.TextEditor.TextView.VisibleLineDrawingRemainder;
        let maxHeight = (Math.floor(((this.Bounds.Height + visibleLineRemainder) / lineHeight)) & 0xFFFFFFFF) + 1;
        for (let y = 0; y < maxHeight; y++) {
            let yPos = this.Bounds.Top + lineHeight * y - visibleLineRemainder +
                this.Theme.LineSpace;
            if (rect.IntersectsWith(this.Bounds.Left, yPos, this.Bounds.Width, lineHeight)) {
                let curLine = this.Document.GetFirstLogicalLine(
                    this.Document.GetVisibleLine(this.TextEditor.TextView.FirstVisibleLine) + y);
                if (curLine < this.Document.TotalNumberOfLines)
                    this.DrawLineNumber(canvas, curLine + 1, yPos);
            }
        }
    }

    private DrawLineNumber(canvas: PixUI.Canvas, lineNumber: number, yPos: number) {
        //TODO:暂计算至千位
        let unitPlace = lineNumber % 10;

        let tenPlace = (Math.floor((lineNumber / 10)) & 0xFFFFFFFF) % 10;
        let hundredPlace = (Math.floor((lineNumber / 100)) & 0xFFFFFFFF) % 10;
        let thousandPlace = (Math.floor((lineNumber / 1000)) & 0xFFFFFFFF) % 10;

        canvas.drawParagraph(this._numberCache[unitPlace], 2 + this._numberWidth * 3, yPos);
        if (lineNumber >= 10)
            canvas.drawParagraph(this._numberCache[tenPlace], 2 + this._numberWidth * 2, yPos);
        if (lineNumber >= 100)
            canvas.drawParagraph(this._numberCache[hundredPlace], 2 + this._numberWidth, yPos);
        if (lineNumber >= 1000)
            canvas.drawParagraph(this._numberCache[thousandPlace], 2, yPos);
    }
}
