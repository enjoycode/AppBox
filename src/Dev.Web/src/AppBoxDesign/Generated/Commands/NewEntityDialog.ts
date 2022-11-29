import * as AppBoxClient from '@/AppBoxClient'
import * as System from '@/System'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class NewEntityDialog extends PixUI.Dialog {
    public constructor() {
        super();
        this.Width = PixUI.State.op_Implicit_From(300);
        this.Height = PixUI.State.op_Implicit_From(210);
        this.Title.Value = "New Entity";
    }

    private readonly _name: PixUI.State<string> = PixUI.State.op_Implicit_From("");
    private readonly _store: PixUI.State<Nullable<AppBoxDesign.DataStoreNodeVO>> = new PixUI.Rx<Nullable<AppBoxDesign.DataStoreNodeVO>>(null);

    protected BuildBody(): PixUI.Widget {
        return new PixUI.Container().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(20)),
                Child: new PixUI.Column().Init(
                    {
                        Children:
                            [
                                new PixUI.Form().Init(
                                    {
                                        LabelWidth: 80,
                                        Children:
                                            [
                                                new PixUI.FormItem("Name:", new PixUI.Input(this._name)),
                                                new PixUI.FormItem("DataStore:", new PixUI.Select<AppBoxDesign.DataStoreNodeVO>(this._store).Init(
                                                    {
                                                        Options: NewEntityDialog.GetAllDataStores()
                                                    }))
                                            ]
                                    })
                            ]
                    })
            });
    }

    protected OnClosing(canceled: boolean): boolean {
        if (!canceled && !System.IsNullOrEmpty(this._name.Value))
            this.CreateAsync();
        return super.OnClosing(canceled);
    }

    private async CreateAsync() {
        let selectedNode = AppBoxDesign.DesignStore.TreeController.FirstSelectedNode;
        if (selectedNode == null) return;

        let args =
            [
                (Math.floor(selectedNode.Data.Type) & 0xFFFFFFFF), selectedNode.Data.Id, this._name.Value,
                this._store.Value == null ? null : this._store.Value.Id
            ];

        let res = await AppBoxClient.Channel.Invoke<AppBoxDesign.NewNodeResult>("sys.DesignService.NewEntityModel", args);
        //根据返回结果同步添加新节点
        AppBoxDesign.DesignStore.OnNewNode(res!);
    }

    private static GetAllDataStores(): AppBoxDesign.DataStoreNodeVO[] {
        let dataStoreRootNode = <AppBoxDesign.DataStoreRootNodeVO><unknown>AppBoxDesign.DesignStore.TreeController.DataSource![0];
        let list = new Array<AppBoxDesign.DataStoreNodeVO>(dataStoreRootNode.Children!.length + 1);
        list[0] = AppBoxDesign.DataStoreNodeVO.None;
        for (let i = 1; i < list.length; i++) {
            list[i] = <AppBoxDesign.DataStoreNodeVO><unknown>dataStoreRootNode.Children[i - 1];
        }

        return list;
    }
}