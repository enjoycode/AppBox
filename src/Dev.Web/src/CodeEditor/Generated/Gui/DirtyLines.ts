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
        //TODO:暂返回TextArea的范围，考虑仅行范围
        return this._controller.TextEditor.TextView.Bounds;
    }

    public ToChild(childX: number, childY: number): PixUI.IDirtyArea {
        throw new System.NotSupportedException();
    }

    public Init(props: Partial<DirtyLines>): DirtyLines {
        Object.assign(this, props);
        return this;
    }
}
