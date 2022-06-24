import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Column extends PixUI.MultiChildWidget<PixUI.Widget> {
    private readonly _alignment: PixUI.HorizontalAlignment;
    private readonly _spacing: number;
    private _totalFlex: number = 0;

    public constructor(alignment: PixUI.HorizontalAlignment = PixUI.HorizontalAlignment.Center, spacing: number = 0, debugLabel: Nullable<string> = null) {
        super();
        if (spacing < 0) throw new System.ArgumentOutOfRangeException("spacing");
        this._alignment = alignment;
        this._spacing = spacing;
        this.DebugLabel = debugLabel;
    }

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        let remaingHeight = height;
        let maxWidthOfChild: number = 0;

        //先计算非Expanded的子级
        this._totalFlex = 0;
        for (let i = 0; i < this._children.length; i++) {
            if (i != 0 && remaingHeight >= this._spacing)
                remaingHeight = Math.max(0, remaingHeight - this._spacing);

            let child = this._children[i];
            if (child instanceof PixUI.Expanded) {
                const expanded = child;
                this._totalFlex += expanded.Flex;
                continue;
            }

            if (remaingHeight <= 0) {
                child.Layout(0, 0);
            } else {
                child.Layout(width, remaingHeight);
                maxWidthOfChild = Math.max(maxWidthOfChild, child.W);
                remaingHeight -= child.H;
            }
        }

        //再计算Expanded子级
        if (this._totalFlex > 0) {
            for (const child of this._children) {
                if (child instanceof PixUI.Expanded) {
                    const expanded = child;
                    if (remaingHeight <= 0) {
                        child.Layout(0, 0);
                    } else {
                        child.Layout(width, remaingHeight * (expanded.Flex / this._totalFlex));
                        maxWidthOfChild = Math.max(maxWidthOfChild, child.W);
                    }
                }
            }
        }

        //最后计算位置
        let totalHeight = 0.0;
        for (let i = 0; i < this._children.length; i++) {
            if (i != 0) totalHeight += this._spacing;
            if (totalHeight >= height) break;

            let child = this._children[i];
            let childX = match(this._alignment)
                .with(PixUI.HorizontalAlignment.Right, () => maxWidthOfChild - child.W)
                .with(PixUI.HorizontalAlignment.Center, () => (maxWidthOfChild - child.W) / 2)
                .otherwise(() => 0);
            child.SetPosition(childX, totalHeight);

            totalHeight += child.H;
        }

        //最宽的子级 and 所有子级的高度
        this.SetSize(maxWidthOfChild, Math.min(height, totalHeight));
    }

    public OnChildSizeChanged(child: PixUI.Widget, dx: number, dy: number, affects: PixUI.AffectsByRelayout) {
        console.assert(this.AutoSize);

        let oldWidth = this.W;
        let oldHeight = this.H;

        let width = this.Width == null
            ? this.CachedAvailableWidth
            : Math.min(this.Width.Value, this.CachedAvailableWidth);
        let height = this.Height == null
            ? this.CachedAvailableHeight
            : Math.min(this.Height.Value, this.CachedAvailableHeight);

        //TODO:可优化变窄或变宽但不是原来最宽的

        if (dx != 0) {
            //重新计算最宽的
            let newWidth = 0;
            for (const item of this._children) {
                newWidth = Math.min(Math.max(item.W, newWidth), width);
            }

            this.SetSize(newWidth, oldHeight);

            //重设X坐标
            for (const item of this._children) {
                let childX = match(this._alignment)
                    .with(PixUI.HorizontalAlignment.Right, () => this.W - item.W)
                    .with(PixUI.HorizontalAlignment.Center, () => (this.W - item.W) / 2)
                    .otherwise(() => 0);
                item.SetPosition(childX, item.Y);
            }
        }

        if (dy != 0) {
            if (this._totalFlex > 0) {
                //TODO: recalc expanded and layout 
                throw new System.NotImplementedException();
            } else {
                let indexOfChild = this._children.IndexOf(child);
                for (let i = indexOfChild + 1; i < this._children.length; i++) {
                    this._children[i].SetPosition(this._children[i].X, this._children[i].Y + dy);
                }

                this.SetSize(this.W, this.H + dy);
            }
        }

        this.TryNotifyParentIfSizeChanged(oldWidth, oldHeight, affects);
    }

    public Init(props: Partial<Column>): Column {
        Object.assign(this, props);
        return this;
    }
}
