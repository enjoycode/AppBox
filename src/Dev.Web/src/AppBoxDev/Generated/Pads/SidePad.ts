import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDev from '@/AppBoxDev'

export enum SidePadType {
    ModelsTree,
    Toolbox,
    Settings
}

export class NaviBar extends PixUI.View {
    private readonly _buttonColor: PixUI.State<PixUI.Color> = PixUI.State.op_Implicit_From(PixUI.Colors.White);
    private readonly _buttonSize: PixUI.State<number> = PixUI.State.op_Implicit_From(25);

    public constructor() {
        super();
        this.Child = new PixUI.Container
        ().Init({
            Width: PixUI.State.op_Implicit_From(45),
            Color: PixUI.State.op_Implicit_From(new PixUI.Color(43, 49, 56)),
            Child: new PixUI.Column
            ().Init({
                    Children: [new PixUI.Expanded
                    ().Init({
                        Child: new PixUI.Column(PixUI.HorizontalAlignment.Center, 5).Init({Children: [this.BuildButton(PixUI.Icons.Filled.AccountTree, SidePadType.ModelsTree), this.BuildButton(PixUI.Icons.Filled.Build, SidePadType.Toolbox), this.BuildButton(PixUI.Icons.Filled.Settings, SidePadType.Settings)]}
                        )
                    }), this.BuildButton(PixUI.Icons.Filled.ArrowLeft)
                    ]
                }
            )
        });
    }

    private BuildButton(icon: PixUI.IconData, type: Nullable<SidePadType> = null): PixUI.Button {
        let color = this._buttonColor;
        if (type != null)
            color = PixUI.RxComputed.Make1(AppBoxDev.DevController.ActiveSidePad, s => s == type ? new PixUI.Color(0xFF4AC5EA) : new PixUI.Color(0xFF6A7785));

        return new PixUI.Button(null, PixUI.State.op_Implicit_From(icon)).Init({
            FontSize: this._buttonSize,
            TextColor: color,
            Style: PixUI.ButtonStyle.Transparent,
            OnTap: e => this.OnClick(type)
        });
    }

    private OnClick(type: Nullable<SidePadType>) {
        if (type != null)
            AppBoxDev.DevController.ActiveSidePad.Value = type;
    }

    public Init(props: Partial<NaviBar>): NaviBar {
        Object.assign(this, props);
        return this;
    }
}

export class SidePad extends PixUI.View {
    public constructor() {
        super();
        this.Child = new PixUI.Row
        ().Init({Children: [new NaviBar(), new PixUI.DynamicView().Init({Width: PixUI.State.op_Implicit_From(350)})]});
    }

    public Init(props: Partial<SidePad>): SidePad {
        Object.assign(this, props);
        return this;
    }
}
