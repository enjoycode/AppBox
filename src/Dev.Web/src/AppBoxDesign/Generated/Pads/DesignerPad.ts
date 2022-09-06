import * as AppBoxClient from '@/AppBoxClient'
import * as AppBoxCore from '@/AppBoxCore'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class DesignerPad extends PixUI.View {
    public constructor() {
        super();
        AppBoxDesign.DesignStore.TreeController.SelectionChanged.Add(DesignerPad.OnTreeSelectionChanged);
        // DesignStore.DesignerController.TabAdded += OnDesignerOpened;
        AppBoxDesign.DesignStore.DesignerController.TabClosed.Add(this.OnDesignerClosed, this);

        this.BgColor = PixUI.State.op_Implicit_From(PixUI.Colors.White);

        this.Child = new PixUI.TabView<AppBoxDesign.DesignNodeVO>(AppBoxDesign.DesignStore.DesignerController, DesignerPad.BuildTab, DesignerPad.BuildBody, true, 40).Init(
            {SelectedTabColor: PixUI.Colors.White, TabBarBgColor: new PixUI.Color(0xFFF3F3F3)});
    }

    private static BuildTab(node: AppBoxDesign.DesignNodeVO, isSelected: PixUI.State<boolean>): PixUI.Widget {
        let textColor = PixUI.RxComputed.Make1(isSelected, selected => selected ? PixUI.Theme.FocusedColor : PixUI.Colors.Black
        );

        return new PixUI.Text(node.Label).Init({TextColor: textColor});
    }

    private static BuildBody(node: AppBoxDesign.DesignNodeVO): PixUI.Widget {
        if (node.Type == AppBoxDesign.DesignNodeType.ModelNode) {
            let modelNode = <AppBoxDesign.ModelNodeVO><unknown>node;
            switch (modelNode.ModelType) {
                case AppBoxCore.ModelType.Entity: {
                    let entityDesigner = new AppBoxDesign.EntityDesigner(modelNode);
                    node.Designer = entityDesigner;
                    return entityDesigner;
                }
                case AppBoxCore.ModelType.View: {
                    let viewDesigner = new AppBoxDesign.ViewDesigner(modelNode);
                    node.Designer = viewDesigner;
                    return viewDesigner;
                }
                case AppBoxCore.ModelType.Service: {
                    let designer = new AppBoxDesign.ServiceDesigner(modelNode);
                    node.Designer = designer;
                    return designer;
                }
            }
        }

        return new PixUI.Container().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(10)),
                BgColor: PixUI.State.op_Implicit_From(PixUI.Colors.White),
                Child: new PixUI.Text(node.Label),
            });
    }

    // private void OnDesignerOpened(DesignNode node)
    // {
    //     if (DesignStore.DesignerController.Count == 1)
    //         BgColor!.Value = new Color(0xFFF3F3F3);
    // }

    private async OnDesignerClosed(node: AppBoxDesign.DesignNodeVO) {
        // if (DesignStore.DesignerController.Count == 0)
        //     BgColor!.Value = Colors.White;

        node.Designer = null;
        if (node.Type == AppBoxDesign.DesignNodeType.ModelNode) {
            let modelNode = <AppBoxDesign.ModelNodeVO><unknown>node;
            if (modelNode.ModelType == AppBoxCore.ModelType.Service ||
                modelNode.ModelType == AppBoxCore.ModelType.View)
                await AppBoxClient.Channel.Invoke("sys.DesignService.CloseDesigner", [(Math.floor(node.Type) & 0xFFFFFFFF), node.Id]);
        }
    }

    private static OnTreeSelectionChanged() {
        let currentNode = AppBoxDesign.DesignStore.TreeController.FirstSelectedNode;
        if (currentNode != null && currentNode.Data instanceof AppBoxDesign.ModelNodeVO) {
            //先检查是否已经打开
            let existsIndex = AppBoxDesign.DesignStore.DesignerController.IndexOf(currentNode.Data);
            if (existsIndex < 0)
                AppBoxDesign.DesignStore.DesignerController.Add(currentNode.Data);
            else
                AppBoxDesign.DesignStore.DesignerController.SelectAt(existsIndex);
        }
    }

    public Init(props: Partial<DesignerPad>): DesignerPad {
        Object.assign(this, props);
        return this;
    }
}
