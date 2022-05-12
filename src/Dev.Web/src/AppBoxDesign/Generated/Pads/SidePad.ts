import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDesign from '@/AppBoxDesign'

export enum SidePadType {
    DesignTree,
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
                        Child: new PixUI.Column(PixUI.HorizontalAlignment.Center, 5).Init({Children: [this.BuildButton(PixUI.Icons.Filled.AccountTree, SidePadType.DesignTree), this.BuildButton(PixUI.Icons.Filled.Build, SidePadType.Toolbox), this.BuildButton(PixUI.Icons.Filled.Settings, SidePadType.Settings)]}
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
            color = this.Compute1(AppBoxDesign.DesignStore.ActiveSidePad, s => s == type ? new PixUI.Color(0xFF4AC5EA) : new PixUI.Color(0xFF6A7785));

        return new PixUI.Button(null, PixUI.State.op_Implicit_From(icon)).Init({
            FontSize: this._buttonSize,
            TextColor: color,
            Style: PixUI.ButtonStyle.Transparent,
            OnTap: e => this.OnClick(type)
        });
    }

    private OnClick(type: Nullable<SidePadType>) {
        if (type != null)
            AppBoxDesign.DesignStore.ActiveSidePad.Value = type;
    }

    public Init(props: Partial<NaviBar>): NaviBar {
        Object.assign(this, props);
        return this;
    }
}

export class SidePad extends PixUI.View {
    private readonly _designTreePad: AppBoxDesign.DesignTreePad = new AppBoxDesign.DesignTreePad();
    private readonly _toolboxPad: AppBoxDesign.ToolboxPad = new AppBoxDesign.ToolboxPad();
    private readonly _settingsPad: AppBoxDesign.SettingsPad = new AppBoxDesign.SettingsPad();

    public constructor() {
        super();
        let activePad = this.Compute1(
            AppBoxDesign.DesignStore.ActiveSidePad, s => {
                switch (s) {
                    case SidePadType.DesignTree:
                        return this._designTreePad;
                    case SidePadType.Toolbox:
                        return this._toolboxPad;
                    case SidePadType.Settings:
                        return this._settingsPad;
                    default:
                        return null;
                }
            });


        this.Child = new PixUI.Row
        ().Init({
            Children: [new NaviBar(), new PixUI.Container
            ().Init({
                    DebugLabel: "SidePad",
                    Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(5)),
                    Width: PixUI.State.op_Implicit_From(250),
                    Color: PixUI.State.op_Implicit_From(new PixUI.Color(0xFFF3F3F3)),
                    Child: new PixUI.DynamicView().Init({DynamicWidget: activePad})
                }
            )]
        });
    }

    public Init(props: Partial<SidePad>): SidePad {
        Object.assign(this, props);
        return this;
    }
}
