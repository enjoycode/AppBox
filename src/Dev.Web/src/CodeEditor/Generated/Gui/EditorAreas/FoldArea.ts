import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class FoldArea extends CodeEditor.EditorArea {
    public constructor(textEditor: CodeEditor.TextEditor) {
        super(textEditor);
    }

    private _selectedFoldLine: number = -1;

    private GetNormalPaint(): PixUI.Paint {
        return PixUI.PaintUtils.Shared(new PixUI.Color(200, 200, 200, 255), CanvasKit.PaintStyle.Stroke, 1);
    }

    private GetSelectedPaint(): PixUI.Paint {
        return PixUI.PaintUtils.Shared(new PixUI.Color(200, 200, 200, 255), CanvasKit.PaintStyle.Stroke, 1.5);
    }

    private SelectedFoldingFrom(list: System.IList<CodeEditor.FoldMarker>): boolean {
        for (const fm of list) {
            if (this._selectedFoldLine == fm.StartLine) return true;
        }

        return false;
    }

    public get Size(): PixUI.Size {
        return new PixUI.Size(this.TextEditor.TextView.FontHeight, -1);
    }

    public get IsVisible(): boolean {
        return this.TextEditor.Document.TextEditorOptions.EnableFolding;
    }

    public HandlePointerDown(x: number, y: number, buttons: PixUI.PointerButtons) {
        let physicalLine = (Math.floor(((y + this.TextEditor.VirtualTop.Y) / this.TextEditor.TextView.FontHeight)) & 0xFFFFFFFF);
        let realLine = this.Document.GetFirstLogicalLine(physicalLine);
        if (realLine < 0 || realLine + 1 >= this.Document.TotalNumberOfLines)
            return;

        let foldings = this.Document.FoldingManager.GetFoldingsWithStart(realLine);
        for (const fm of foldings) {
            fm.IsFolded = !fm.IsFolded;
        }

        // clear line cached paragraph
        let line = this.Document.GetLineSegment(realLine);
        line.ClearCachedParagraph();
        // update the caret position
        this.TextEditor.Caret.UpdateCaretPosition();
        // notify folding changed
        if (foldings.length > 0) {
            this.Document.FoldingManager.RaiseFoldingsChanged();
            // TODO:重绘范围
            this.TextEditor.Controller.RequestInvalidate?.call(this, true, null);
        }
    }

    public Paint(canvas: PixUI.Canvas, rect: PixUI.Rect) {
        if (rect.Width <= 0 || rect.Height <= 0) return;

        //background
        let paint = PixUI.PaintUtils.Shared(this.TextEditor.Theme.TextBgColor);
        canvas.drawRect(rect, paint);

        let fontHeight = this.TextEditor.TextView.FontHeight;
        let visibleLineRemainder = this.TextEditor.TextView.VisibleLineDrawingRemainder;
        let maxHeight = (Math.floor(((this.Bounds.Height + visibleLineRemainder) / fontHeight + 1)) & 0xFFFFFFFF);
        for (let y = 0; y < maxHeight; ++y) {
            let markerRect = PixUI.Rect.FromLTWH(
                this.Bounds.Left, this.Bounds.Top + y * fontHeight - visibleLineRemainder, this.Bounds.Width, fontHeight);
            if (rect.IntersectsWith(markerRect.Left, markerRect.Top, markerRect.Width, markerRect.Height)) {
                //TODO: paint separator line?
                // canvas.drawLine(ui.Offset(drawingPosition.left, markerRect.top),
                //     ui.Offset(drawingPosition.left, markerRect.bottom), normalPaint);

                let currentLine = this.Document
                    .GetFirstLogicalLine(this.TextEditor.TextView.FirstPhysicalLine + y);
                if (currentLine < this.Document.TotalNumberOfLines) {
                    this.PaintFoldMarker(canvas, currentLine, markerRect);
                }
            }
        }
    }

    private PaintFoldMarker(canvas: PixUI.Canvas, lineNumber: number, rect: PixUI.Rect) {
        let foldingManager = this.Document.FoldingManager;
        //TODO: 优化一次循环
        let foldingsWithStart = foldingManager.GetFoldingsWithStart(lineNumber);
        let foldingsBetween = foldingManager.GetFoldingsContainsLineNumber(lineNumber);
        let foldingsWithEnd = foldingManager.GetFoldingsWithEnd(lineNumber);

        let isFoldStart = foldingsWithStart.length > 0;
        let isBetween = foldingsBetween.length > 0;
        let isFoldEnd = foldingsWithEnd.length > 0;

        let isStartSelected = this.SelectedFoldingFrom(foldingsWithStart);
        let isBetweenSelected = this.SelectedFoldingFrom(foldingsBetween);
        let isEndSelected = this.SelectedFoldingFrom(foldingsWithEnd);

        let foldMarkerSize = this.TextEditor.TextView.FontHeight * 0.57;
        foldMarkerSize -= foldMarkerSize % 2;
        let foldMarkerYPos = rect.Top + (rect.Height - foldMarkerSize) / 2;
        let xPos = rect.Left + (rect.Width - foldMarkerSize) / 2 + foldMarkerSize / 2;

        if (isFoldStart) {
            let isVisible = true;
            let moreLinedOpenFold = false;
            for (const fm of foldingsWithStart) {
                if (fm.IsFolded)
                    isVisible = false;
                else
                    moreLinedOpenFold = fm.EndLine > fm.StartLine;
            }

            let isFoldEndFromUpperFold = false;
            for (const fm of foldingsWithEnd) {
                if (fm.EndLine > fm.StartLine && !fm.IsFolded)
                    isFoldEndFromUpperFold = true;
            }

            this.PaintMarker(canvas, PixUI.Rect.FromLTWH(rect.Left + (rect.Width - foldMarkerSize) / 2, foldMarkerYPos, foldMarkerSize, foldMarkerSize), isVisible, isStartSelected);

            // paint line above fold marker
            if (isBetween || isFoldEndFromUpperFold) {
                canvas.drawLine(xPos, rect.Top, xPos, foldMarkerYPos - 1, isBetweenSelected ? this.GetSelectedPaint() : this.GetNormalPaint());
            }

            // paint line below fold marker
            if (isBetween || moreLinedOpenFold) {
                canvas.drawLine(
                    xPos, foldMarkerYPos + foldMarkerSize + 1, xPos, rect.Bottom, isEndSelected || (isStartSelected && isVisible) || isBetweenSelected
                        ? this.GetSelectedPaint()
                        : this.GetNormalPaint());
            }
        } else {
            if (isFoldEnd) {
                let midY = rect.Top + rect.Height / 2;

                // paint fold end marker
                canvas.drawLine(
                    xPos, midY, xPos + foldMarkerSize / 2, midY, isEndSelected ? this.GetSelectedPaint() : this.GetNormalPaint());

                // paint line above fold end marker
                // must be drawn after fold marker because it might have a different color than the fold marker
                canvas.drawLine(xPos, rect.Top, xPos, midY, isBetweenSelected || isEndSelected ? this.GetSelectedPaint() : this.GetNormalPaint());

                // paint line below fold end marker
                if (isBetween) {
                    canvas.drawLine(xPos, midY + 1, xPos, rect.Bottom, isBetweenSelected ? this.GetSelectedPaint() : this.GetNormalPaint());
                }
            } else if (isBetween) {
                // just paint the line
                canvas.drawLine(xPos, rect.Top, xPos, rect.Bottom, isBetweenSelected ? this.GetSelectedPaint() : this.GetNormalPaint());
            }
        }
    }

    private PaintMarker(canvas: PixUI.Canvas, rect: PixUI.Rect, isOpened: boolean, isSelected: boolean) {
        canvas.drawRect(PixUI.Rect.FromLTWH(rect.Left, rect.Top, rect.Width, rect.Height), isSelected ? this.GetSelectedPaint() : this.GetNormalPaint());

        let space = rect.Height / 8 + 1;
        let mid = rect.Height / 2 + rect.Height % 2;

        // draw minus
        canvas.drawLine(rect.Left + space, rect.Top + mid, rect.Left + rect.Width - space, rect.Top + mid, this.GetNormalPaint());

        // draw plus
        if (!isOpened) {
            canvas.drawLine(rect.Left + mid, rect.Top + space, rect.Left + mid, rect.Top + rect.Height - space, this.GetNormalPaint());
        }
    }

    public Init(props: Partial<FoldArea>): FoldArea {
        Object.assign(this, props);
        return this;
    }
}
