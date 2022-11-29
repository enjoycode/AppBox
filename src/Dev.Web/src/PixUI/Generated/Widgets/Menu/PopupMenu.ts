import * as System from '@/System'
import * as PixUI from '@/PixUI'
/// <summary>
/// 弹出的子菜单，由MenuController创建并加入至其PopupMenuStack内
/// </summary>
export class PopupMenu extends PixUI.Widget {
    public constructor(owner: Nullable<PixUI.MenuItemWidget>, items: Nullable<PixUI.MenuItem[]>, depth: number, controller: PixUI.MenuController) {
        super();
        if (owner == null && items == null)
            throw new System.ArgumentNullException();

        this.Owner = owner;
        this._controller = controller;
        if (owner != null) {
            this._children = new System.List<PixUI.MenuItemWidget>(owner.MenuItem.Children!.length);
            this.BuildMenuItemWidgets(owner.MenuItem.Children!, depth);
        } else {
            this._children = new System.List<PixUI.MenuItemWidget>(items!.length);
            this.BuildMenuItemWidgets(items, depth);
        }
    }

    public readonly Owner: Nullable<PixUI.MenuItemWidget>; //maybe null on ContextMenu
    private readonly _children: System.IList<PixUI.MenuItemWidget>;
    private readonly _controller: PixUI.MenuController;

    private BuildMenuItemWidgets(items: System.IEnumerable<PixUI.MenuItem>, depth: number) {
        for (const item of items) {
            let child = new PixUI.MenuItemWidget(item, depth, true, this._controller);
            child.Parent = this;
            this._children.Add(child);
        }
    }

    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        for (const child of this._children) {
            if (action(child)) break;
        }
    }

    public Layout(availableWidth: number, availableHeight: number) {
        if (this.HasLayout) return;
        this.HasLayout = true;

        let maxChildWidth = 0;
        let maxWidthChild: Nullable<PixUI.MenuItemWidget> = null;
        let offsetY = 0;
        for (const child of this._children) {
            child.Layout(Number.POSITIVE_INFINITY, this._controller.PopupItemHeight);
            child.SetPosition(0, offsetY);
            if (child.W >= maxChildWidth) {
                maxChildWidth = child.W;
                if (maxWidthChild == null || child.MenuItem.Type != PixUI.MenuItemType.SubMenu)
                    maxWidthChild = child;
            }

            offsetY += child.H;
        }

        if (maxWidthChild!.MenuItem.Type != PixUI.MenuItemType.SubMenu) {
            maxChildWidth += PixUI.Theme.DefaultFontSize;
        }

        //重设所有子项等宽
        for (const child of this._children) {
            child.ResetWidth(maxChildWidth);
        }

        this.SetSize(maxChildWidth, offsetY);
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        //画背景及阴影
        let rrect = PixUI.RRect.FromRectAndRadius(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), 4, 4);
        let path = new CanvasKit.Path();
        path.addRRect(rrect);
        PixUI.DrawShadow(canvas, path, PixUI.Colors.Black, 5, false, this.Root!.Window.ScaleFactor);
        let paint = PixUI.PaintUtils.Shared(this._controller.BackgroundColor);
        canvas.drawRRect(rrect, paint);

        canvas.save();
        canvas.clipPath(path, CanvasKit.ClipOp.Intersect, false);

        this.PaintChildren(canvas, area);

        canvas.restore();
        path.delete();
    }
}
