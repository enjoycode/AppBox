import * as AppBoxClient from '@/AppBoxClient'
import * as System from '@/System'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class NewEntityDialog extends PixUI.Dialog<any> {
    public constructor(overlay: PixUI.Overlay) {
        super(overlay);
        this.Width = PixUI.State.op_Implicit_From(300);
        this.Height = PixUI.State.op_Implicit_From(180);
        this.Title.Value = "New Entity";
        this.OnClose = this._OnClose.bind(this);
    }

    private readonly _name: PixUI.State<string> = PixUI.State.op_Implicit_From("");
    private readonly _store: PixUI.State<Nullable<AppBoxDesign.DataStoreNode>> = new PixUI.Rx<Nullable<AppBoxDesign.DataStoreNode>>(null);

    protected BuildBody(): PixUI.Widget {
        return new PixUI.Container().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(20)),
                Child: new PixUI.Column().Init(
                    {
                        Children: [new PixUI.Form().Init(
                            {
                                LabelWidth: 80,
                                Children: [new PixUI.FormItem("Name:", new PixUI.Input(this._name)), new PixUI.FormItem("DataStore:", new PixUI.Select<AppBoxDesign.DataStoreNode>(this._store).Init(
                                    {
                                        Options: NewEntityDialog.GetAllDataStores()
                                    }))
                                ]
                            }), new PixUI.Row(PixUI.VerticalAlignment.Middle, 20).Init(
                            {
                                Children: [new PixUI.Button(PixUI.State.op_Implicit_From("Cancel")).Init({
                                    Width: PixUI.State.op_Implicit_From(65),
                                    OnTap: _ => this.Close(true)
                                }), new PixUI.Button(PixUI.State.op_Implicit_From("OK")).Init({
                                    Width: PixUI.State.op_Implicit_From(65),
                                    OnTap: _ => this.Close(false)
                                })]
                            })
                        ]
                    })
            });
    }

    protected GetResult(canceled: boolean): Nullable<any> {
        return null;
    }

    private _OnClose(canceled: boolean, result: Nullable<any>) {
        if (canceled) return;
        if (System.IsNullOrEmpty(this._name.Value)) return;

        let selectedNode = AppBoxDesign.DesignStore.TreeController.FirstSelectedNode;
        if (selectedNode == null) return;

        let args = [(Math.floor(selectedNode.Data.Type) & 0xFFFFFFFF), selectedNode.Data.Id, this._name.Value, this._store.Value == null ? null : this._store.Value.Id
        ];
        NewEntityDialog.CreateAsync("sys.DesignService.NewEntityModel", args);
    }

    private static async CreateAsync(service: string, args: Nullable<any>[]) {
        let res = await AppBoxClient.Channel.Invoke<AppBoxDesign.NewNodeResult>(service, args);
        //根据返回结果同步添加新节点
        AppBoxDesign.DesignStore.OnNewNode(res!);
    }

    private static GetAllDataStores(): AppBoxDesign.DataStoreNode[] {
        let dataStoreRootNode = <AppBoxDesign.DataStoreRootNode><unknown>AppBoxDesign.DesignStore.TreeController.DataSource![0];
        let list = new Array<AppBoxDesign.DataStoreNode>(dataStoreRootNode.Children!.length + 1);
        list[0] = AppBoxDesign.DataStoreNode.None;
        for (let i = 1; i < list.length; i++) {
            list[i] = <AppBoxDesign.DataStoreNode><unknown>dataStoreRootNode.Children[i - 1];
        }

        return list;
    }

    public Init(props: Partial<NewEntityDialog>): NewEntityDialog {
        Object.assign(this, props);
        return this;
    }
}