import * as System from '@/System'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class EntityDesigner extends PixUI.View implements AppBoxDesign.IDesigner {
    public constructor(modelNode: AppBoxDesign.ModelNode) {
        super();
        this._modelNode = modelNode;

        this.Child = new PixUI.Column().Init(
            {
                Children: [EntityDesigner.BuildActionBar(), new PixUI.Expanded().Init(
                    {
                        Child: new PixUI.Conditional<number>(this._activePad, [new PixUI.WhenBuilder<number>(t => t == 0, () => new AppBoxDesign.MembersDesigner())])
                    })]
            });
    }

    private readonly _modelNode: AppBoxDesign.ModelNode;
    private readonly _activePad: PixUI.State<number> = PixUI.State.op_Implicit_From(0);

    private static BuildActionBar(): PixUI.Widget {
        return new PixUI.Container().Init(
            {
                BgColor: PixUI.State.op_Implicit_From(PixUI.Colors.White),
                Height: PixUI.State.op_Implicit_From(40),
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.Only(15, 8, 15, 8)),
                Child: new PixUI.Row(PixUI.VerticalAlignment.Middle, 10).Init(
                    {
                        Children: [new PixUI.Text(PixUI.State.op_Implicit_From("")).Init({Width: PixUI.State.op_Implicit_From(120)}), new PixUI.Button(PixUI.State.op_Implicit_From("Members")).Init({Width: PixUI.State.op_Implicit_From(75)}), new PixUI.Button(PixUI.State.op_Implicit_From("Options")).Init({Width: PixUI.State.op_Implicit_From(75)}), new PixUI.Button(PixUI.State.op_Implicit_From("Data")).Init({Width: PixUI.State.op_Implicit_From(75)})]
                    })
            });
    }

    public SaveAsync(): Promise<void> {
        throw new System.NotImplementedException();
    }

    public Init(props: Partial<EntityDesigner>): EntityDesigner {
        Object.assign(this, props);
        return this;
    }
}
