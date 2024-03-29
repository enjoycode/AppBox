import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class PopupMenuStack extends PixUI.Popup {
    private readonly _closeAll: System.Action;

    public constructor(overlay: PixUI.Overlay, closeAll: System.Action) {
        super(overlay);
        this._closeAll = closeAll;
    }

    private readonly _children: System.List<PixUI.PopupMenu> = new System.List<PixUI.PopupMenu>();

    public get HasChild(): boolean {
        return this._children.length > 0;
    }


    public Add(child: PixUI.PopupMenu) {
        child.Parent = this;
        this._children.Add(child);

        if (this._children.length == 1)
            this.Show();
        else
            this.Invalidate(PixUI.InvalidAction.Repaint);
    }

    public TryCloseSome(newHoverItem: PixUI.MenuItemWidget): boolean {
        //判断子级回到任意上级
        for (let i: number = this._children.length - 1; i >= 0; i--) {
            if ((newHoverItem === this._children[i].Owner)) {
                this.CloseTo(newHoverItem.Depth);
                return true; //调用者不需要后续操作
            }
        }

        let lastMenuItem = this._children[this._children.length - 1].Owner;
        //判断是否同级
        if (newHoverItem.Depth == lastMenuItem?.Depth) {
            this.CloseTo(newHoverItem.Depth - 1);
        }
        //再判断是否直接子级
        else if (lastMenuItem != null && !PopupMenuStack.IsChildOf(newHoverItem, lastMenuItem)) {
            this.CloseTo(newHoverItem.Depth - 1);
        }

        return false;
    }

    private static IsChildOf(child: PixUI.MenuItemWidget, parent: PixUI.MenuItemWidget): boolean {
        let isChild = false;
        for (const item of parent.MenuItem.Children!) {
            if ((item === child.MenuItem)) {
                isChild = true;
                break;
            }
        }

        return isChild;
    }

    private CloseTo(depth: number) {
        let needInvalidate = false;
        for (let i = this._children.length - 1; i >= 0; i--) {
            if (i == depth)
                break;

            this._children[i].Parent = null;
            this._children.RemoveAt(i);
            needInvalidate = true;
        }

        if (needInvalidate)
            this.Invalidate(PixUI.InvalidAction.Repaint);
    }


    VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        for (const child of this._children) {
            if (action(child)) break;
        }
    }

    HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        for (const child of this._children) {
            if (this.HitTestChild(child, x, y, result)) return true;
        }

        return false;
    }

    Layout(availableWidth: number, availableHeight: number) {
        //do nothing,每个弹出的子菜单在加入前已经手动布局过
    }

    Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        for (const child of this._children) {
            canvas.translate(child.X, child.Y);
            child.Paint(canvas, area);
            canvas.translate(-child.X, -child.Y);
        }
    }


    PreviewEvent(type: PixUI.EventType, e: any): PixUI.EventPreviewResult {
        //TODO: 判断ESC键及其他
        if (type == PixUI.EventType.PointerDown) {
            let pointerEvent = <PixUI.PointerEvent><unknown>e!;
            //判断是否在所有子菜单区域外，是则移除所有
            let someOneContains = false;
            for (const child of this._children) {
                if (child.ContainsPoint(pointerEvent.X, pointerEvent.Y)) {
                    someOneContains = true;
                    break;
                }
            }

            if (!someOneContains) {
                this._closeAll();
                return PixUI.EventPreviewResult.Processed;
            }
        }

        return super.PreviewEvent(type, e);
    }

}
