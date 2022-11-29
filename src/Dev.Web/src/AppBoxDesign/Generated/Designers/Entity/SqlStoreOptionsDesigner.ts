import * as AppBoxClient from '@/AppBoxClient'
import * as AppBoxCore from '@/AppBoxCore'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class SqlStoreOptionsDesigner extends PixUI.View {
    public constructor(entityModel: AppBoxDesign.EntityModelVO, modelId: string) {
        super();
        this._entityModel = entityModel;
        this._modelId = modelId;
        this._pkController.DataSource = this._entityModel.SqlStoreOptions.PrimaryKeys;
        this._idxController.DataSource = this._entityModel.SqlStoreOptions.Indexes;

        this.Child = new PixUI.Container().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(8)),
                Child: new PixUI.Row(PixUI.VerticalAlignment.Top, 10).Init(
                    {
                        Children:
                            [
                                new PixUI.Expanded(this.BuildPrimaryKeysPannel()),
                                new PixUI.Expanded(this.BuildIndexesPannel()),
                            ]
                    })
            });
    }

    private readonly _entityModel: AppBoxDesign.EntityModelVO;
    private readonly _modelId: string;
    private readonly _pkController: PixUI.DataGridController<AppBoxCore.FieldWithOrder> = new PixUI.DataGridController();
    private readonly _idxController: PixUI.DataGridController<AppBoxDesign.SqlIndexModelVO> = new PixUI.DataGridController();

    private BuildPrimaryKeysPannel(): PixUI.Widget {
        return new PixUI.Card().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(10)),
                Child: new PixUI.Column(PixUI.HorizontalAlignment.Left, 10).Init(
                    {
                        Children:
                            [
                                new PixUI.Text(PixUI.State.op_Implicit_From("Primary Keys:")).Init({
                                    FontSize: PixUI.State.op_Implicit_From(20),
                                    FontWeight: PixUI.State.op_Implicit_From(CanvasKit.FontWeight.Bold)
                                }),
                                new PixUI.ButtonGroup().Init(
                                    {
                                        Children:
                                            [
                                                new PixUI.Button(PixUI.State.op_Implicit_From("Add"), PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Add)).Init({OnTap: this.OnAddPk.bind(this)}),
                                                new PixUI.Button(PixUI.State.op_Implicit_From("Remove"), PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Remove)).Init({OnTap: this.OnRemovePk.bind(this)})
                                            ]
                                    }),
                                new PixUI.DataGrid<AppBoxCore.FieldWithOrder>(this._pkController).Init(
                                    {
                                        Columns:
                                            [
                                                new PixUI.DataGridTextColumn<AppBoxCore.FieldWithOrder>("Name",
                                                    t => this._entityModel.Members.First(m => m.Id == t.MemberId).Name),
                                                new PixUI.DataGridCheckboxColumn<AppBoxCore.FieldWithOrder>("OrderByDesc",
                                                    t => t.OrderByDesc),
                                            ]
                                    })
                            ]
                    })
            });
    }

    private BuildIndexesPannel(): PixUI.Widget {
        return new PixUI.Card().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(10)),
                Child: new PixUI.Column(PixUI.HorizontalAlignment.Left, 10).Init(
                    {
                        Children:
                            [
                                new PixUI.Text(PixUI.State.op_Implicit_From("Indexes:")).Init({
                                    FontSize: PixUI.State.op_Implicit_From(20),
                                    FontWeight: PixUI.State.op_Implicit_From(CanvasKit.FontWeight.Bold)
                                }),
                                new PixUI.ButtonGroup().Init(
                                    {
                                        Children:
                                            [
                                                new PixUI.Button(PixUI.State.op_Implicit_From("Add"), PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Add)),
                                                new PixUI.Button(PixUI.State.op_Implicit_From("Remove"), PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Remove))
                                            ]
                                    }),
                                new PixUI.DataGrid<AppBoxDesign.SqlIndexModelVO>(this._idxController).Init(
                                    {
                                        Columns:
                                            [
                                                new PixUI.DataGridTextColumn<AppBoxDesign.SqlIndexModelVO>("Name",
                                                    t => t.Name),
                                                new PixUI.DataGridTextColumn<AppBoxDesign.SqlIndexModelVO>("Fields",
                                                    t => this.GetIndexesFieldsList(t)),
                                                new PixUI.DataGridCheckboxColumn<AppBoxDesign.SqlIndexModelVO>("Unique",
                                                    t => true),
                                            ]
                                    }),
                            ]
                    })
            });
    }

    private GetIndexesFieldsList(indexMode: AppBoxDesign.SqlIndexModelVO): string {
        let s = "";
        for (let i = 0; i < indexMode.Fields.length; i++) {
            if (i != 0)
                s += ", ";
            s += this._entityModel.Members.First(m => m.Id == indexMode.Fields[i].MemberId).Name;
            if (indexMode.Fields[i].OrderByDesc)
                s += " OrderByDesc";
        }

        return s;
    }

    private async OnAddPk(e: PixUI.PointerEvent) {
        let dlg = new AppBoxDesign.FieldWithOrderDialog(this._entityModel);
        let canceled = await dlg.ShowAndWaitClose();
        if (canceled) return;

        let fieldWithOrder = dlg.GetResult();
        if (fieldWithOrder == null) return;

        this._pkController.Add((fieldWithOrder).Clone());
        this.ChangePrimaryKeys();
    }

    private OnRemovePk(e: PixUI.PointerEvent) {
        if (this._pkController.CurrentRowIndex < 0) return;

        this._pkController.RemoveAt(this._pkController.CurrentRowIndex);
        this.ChangePrimaryKeys();
    }

    private async ChangePrimaryKeys() {
        let args =
            [
                this._modelId,
                this._entityModel.SqlStoreOptions.PrimaryKeys.length == 0
                    ? null
                    : this._entityModel.SqlStoreOptions.PrimaryKeys.ToArray()
            ];
        try {
            await AppBoxClient.Channel.Invoke("sys.DesignService.ChangePrimaryKeys", args);
        } catch (ex: any) {
            //TODO: rollback to pre state
            PixUI.Notification.Error(`Change primary keys error: ${ex.Message}`);
        }
    }
}