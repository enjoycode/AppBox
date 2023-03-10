import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Row extends PixUI.MultiChildWidget<PixUI.Widget> {
    private readonly _alignment: PixUI.VerticalAlignment;
    private readonly _spacing: number;

    public constructor(alignment: PixUI.VerticalAlignment = PixUI.VerticalAlignment.Middle, spacing: number = 0) {
        super();
        if (spacing < 0) throw new System.ArgumentOutOfRangeException("spacing");
        this._alignment = alignment;
        this._spacing = spacing;
    }

    Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        let remaingWidth = width;
        let maxHeightOfChild: number = 0;

        //先计算非Expanded的子级
        let hasExpanded: boolean = false;
        let totalFlex: number = 0;
        for (let i = 0; i < this._children.length; i++) {
            if (i != 0 && remaingWidth >= this._spacing)
                remaingWidth = Math.max(0, remaingWidth - this._spacing);

            let child = this._children[i];
            if (child instanceof PixUI.Expanded) {
                const expanded = child;
                hasExpanded = true;
                totalFlex += expanded.Flex;
                continue;
            }

            if (remaingWidth <= 0) {
                child.Layout(0, 0);
            } else {
                child.Layout(remaingWidth, height);
                maxHeightOfChild = Math.max(maxHeightOfChild, child.H);
                remaingWidth -= child.W;
            }
        }

        //再计算Expanded子级
        if (hasExpanded) {
            for (const child of this._children) {
                if (child instanceof PixUI.Expanded) {
                    const expanded = child;
                    if (remaingWidth <= 0) {
                        child.Layout(0, 0);
                    } else {
                        child.Layout(remaingWidth * (expanded.Flex / totalFlex), height);
                        maxHeightOfChild = Math.max(maxHeightOfChild, child.H);
                    }
                }
            }
        }

        //最后计算位置
        let totalWidth = 0.0;
        for (let i = 0; i < this._children.length; i++) {
            if (i != 0) totalWidth += this._spacing;
            if (totalWidth >= width) break;

            let child = this._children[i];
            let childY = match(this._alignment)
                .with(PixUI.VerticalAlignment.Bottom, () => maxHeightOfChild - child.H)
                .with(PixUI.VerticalAlignment.Middle, () => (maxHeightOfChild - child.H) / 2)
                .otherwise(() => 0
                );
            child.SetPosition(totalWidth, childY);

            totalWidth += child.W;
        }

        // 最高的子级 and 所有子级的宽度
        this.SetSize(Math.min(width, totalWidth), maxHeightOfChild);
    }
}
