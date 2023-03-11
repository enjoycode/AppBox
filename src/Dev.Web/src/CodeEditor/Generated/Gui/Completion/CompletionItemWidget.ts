import * as CodeEditor from '@/CodeEditor'
import * as PixUI from '@/PixUI'

export class CompletionItemWidget extends PixUI.Widget {
    public constructor(item: CodeEditor.ICompletionItem, isSelected: PixUI.State<boolean>) {
        super();
        this._item = item;
        this._isSelected = isSelected;
        this._iconPainter = new PixUI.IconPainter(() => this.Invalidate(PixUI.InvalidAction.Repaint));
    }

    private readonly _item: CodeEditor.ICompletionItem;
    private readonly _isSelected: PixUI.State<boolean>;
    private readonly _iconPainter: PixUI.IconPainter;
    private _paragraph: Nullable<PixUI.Paragraph>; //TODO: use TextPainter

    Layout(availableWidth: number, availableHeight: number) {
        this.SetSize(availableWidth, availableHeight);
    }

    Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        let fontSize: number = 13;
        let x: number = 2;
        let y: number = 3;
        this._iconPainter.Paint(canvas, fontSize, PixUI.Colors.Gray, CompletionItemWidget.GetIcon(this._item.Kind), x, y);
        this._paragraph ??= PixUI.TextPainter.BuildParagraph(this._item.Label, Number.POSITIVE_INFINITY,
            fontSize, PixUI.Colors.Black, null, 1, true);

        canvas.drawParagraph(this._paragraph!, x + 20, y);
    }

    private static GetIcon(kind: CodeEditor.CompletionItemKind): PixUI.IconData {
        switch (kind) {
            case CodeEditor.CompletionItemKind.Function:
            case CodeEditor.CompletionItemKind.Method:
                return PixUI.Icons.Filled.Functions;
            case CodeEditor.CompletionItemKind.Event:
                return PixUI.Icons.Filled.Bolt;
            default:
                return PixUI.Icons.Filled.Title;
        }
    }
}
