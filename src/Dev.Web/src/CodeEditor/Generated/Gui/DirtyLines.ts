import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'
import * as PixUI from '@/PixUI'
/// <summary>
/// 需要重新绘制的行范围[StartLine, EndLine)
/// </summary>
export class DirtyLines implements PixUI.IDirtyArea {
    public constructor(controller: CodeEditor.CodeEditorController) {
        this._controller = controller;
    }

    private readonly _controller: CodeEditor.CodeEditorController;
    public StartLine: number = 0;
    public EndLine: number = 0;

    public Merge(newArea: Nullable<PixUI.IDirtyArea>) {
        //TODO:
    }

    public GetRect(): PixUI.Rect {
        //TODO:暂返回所有范围,注意需要包含GutterArea
        return PixUI.Rect.Empty;
    }

    public IntersectsWith(child: PixUI.Widget): boolean {
        throw new System.NotSupportedException();
    }

    public ToChild(child: PixUI.Widget): Nullable<PixUI.IDirtyArea> {
        throw new System.NotSupportedException();
    }
}
