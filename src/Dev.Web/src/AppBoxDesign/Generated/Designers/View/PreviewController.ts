import * as AppBoxDesign from '@/AppBoxDesign'
import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class WidgetTreeNode {
    public constructor(widget: PixUI.Widget) {
        this.Widget = widget;
        this.Children = new System.List<WidgetTreeNode>();
        this.Widget.VisitChildren(child => {
            this.Children.Add(new WidgetTreeNode(child));
            return false;
        });
    }

    public readonly Widget: PixUI.Widget;
    public readonly Children: System.IList<WidgetTreeNode>;
}

/// <summary>
/// 视图模型的预览控制器
/// </summary>
export class PreviewController {
    public constructor(modelNode: AppBoxDesign.ModelNodeVO) {
        this.ModelNode = modelNode;
    }

    public readonly ModelNode: AppBoxDesign.ModelNodeVO;
    private _invalidateAction: Nullable<System.Action>;
    private _refreshOutlineAction: Nullable<System.Action>;
    public CurrentWidget: Nullable<PixUI.Widget>; //当前加载的预览的Widget实例
    public set InvalidateAction(value: System.Action) {
        this._invalidateAction = value;
    }

    public get RefreshOutlineAction(): Nullable<System.Action> {
        return this._refreshOutlineAction;
    }

    public set RefreshOutlineAction(value: Nullable<System.Action>) {
        this._refreshOutlineAction = value;
    }

    public Invalidate() {
        this._invalidateAction?.call(this);
    }

    public GetWidgetTree(): Nullable<WidgetTreeNode> {
        return this.CurrentWidget == null ? null : new WidgetTreeNode(this.CurrentWidget);
    }
}