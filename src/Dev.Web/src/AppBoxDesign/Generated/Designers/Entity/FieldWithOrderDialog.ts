import * as AppBoxCore from '@/AppBoxCore'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class FieldWithOrderDialog extends PixUI.Dialog {
    public constructor(entityModel: AppBoxDesign.EntityModelVO) {
        super();
        this._entityModel = entityModel;
        this.Width = PixUI.State.op_Implicit_From(380);
        this.Height = PixUI.State.op_Implicit_From(200);
        this.Title.Value = "EntityFieldWithOrder";
    }

    private readonly _entityModel: AppBoxDesign.EntityModelVO;
    private readonly _selected: PixUI.State<Nullable<AppBoxDesign.EntityMemberVO>> = new PixUI.Rx<Nullable<AppBoxDesign.EntityMemberVO>>(null);
    private readonly _orderByDesc: PixUI.State<boolean> = PixUI.State.op_Implicit_From(false);

    protected BuildBody(): PixUI.Widget {
        return new PixUI.Container().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(20)),
                Child: new PixUI.Form().Init(
                    {
                        Children:
                            [
                                new PixUI.FormItem("EntityField:", new PixUI.Select<AppBoxDesign.EntityMemberVO>(this._selected).Init(
                                    {
                                        Options: this._entityModel.Members
                                            .Where(m => m.Type == AppBoxCore.EntityMemberType.EntityField)
                                            .ToArray()
                                    })),
                                new PixUI.FormItem("OrderByDesc:", new PixUI.Checkbox(this._orderByDesc))
                            ]
                    })
            });
    }

    public GetResult(): Nullable<AppBoxCore.FieldWithOrder> {
        if (this._selected.Value == null) return null;
        return new AppBoxCore.FieldWithOrder(this._selected.Value.Id, this._orderByDesc.Value);
    }
}