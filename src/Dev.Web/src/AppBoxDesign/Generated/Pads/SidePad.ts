import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export enum SidePadType {
    DesignTree,
    Outline,
    Toolbox,
    Settings
}

export class NaviBar extends PixUI.View {
    private readonly _buttonColor: PixUI.State<PixUI.Color> = PixUI.State.op_Implicit_From(PixUI.Colors.White);
    private readonly _buttonSize: PixUI.State<number> = PixUI.State.op_Implicit_From(25);

    public constructor() {
        super();
        this.Child = new PixUI.Container().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.Only(5, 0, 0, 0)),
                Width: PixUI.State.op_Implicit_From(45),
                BgColor: PixUI.State.op_Implicit_From(new PixUI.Color(43, 49, 56)),
                Child: new PixUI.Column().Init(
                    {
                        Children:
                            [
                                new PixUI.Expanded().Init(
                                    {
                                        Child: new PixUI.Column(PixUI.HorizontalAlignment.Center, 5).Init(
                                            {
                                                Children:
                                                    [
                                                        this.BuildButton(PixUI.Icons.Filled.Folder, SidePadType.DesignTree),
                                                        this.BuildButton(PixUI.Icons.Filled.AccountTree, SidePadType.Outline),
                                                        this.BuildButton(PixUI.Icons.Filled.Build, SidePadType.Toolbox),
                                                        this.BuildButton(PixUI.Icons.Filled.Settings, SidePadType.Settings),
                                                    ]
                                            })
                                    }),
                                this.BuildButton(PixUI.Icons.Filled.ArrowLeft)
                            ]
                    })
            });
    }

    private BuildButton(icon: PixUI.IconData, type: Nullable<SidePadType> = null): PixUI.Button {
        let color = this._buttonColor;
        if (type != null)
            color = this.Compute1(AppBoxDesign.DesignStore.ActiveSidePad,
                s => s == type ? new PixUI.Color(0xFF4AC5EA) : new PixUI.Color(0xFF6A7785));

        return new PixUI.Button(null, PixUI.State.op_Implicit_From(icon)).Init(
            {
                FontSize: this._buttonSize,
                TextColor: color, Style: PixUI.ButtonStyle.Transparent,
                OnTap: e => this.OnClick(type)
            });
    }

    private OnClick(type: Nullable<SidePadType>) {
        if (type != null)
            AppBoxDesign.DesignStore.ActiveSidePad.Value = type;
    }
}

export class SidePad extends PixUI.View {
    public constructor() {
        super();
        this.Child = new PixUI.Row().Init(
            {
                Children:
                    [
                        new NaviBar(),
                        new PixUI.Container().Init(
                            {
                                DebugLabel: "SidePad",
                                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(5)),
                                Width: PixUI.State.op_Implicit_From(250),
                                BgColor: PixUI.State.op_Implicit_From(new PixUI.Color(0xFFF3F3F3)),
                                Child: new PixUI.Conditional(AppBoxDesign.DesignStore.ActiveSidePad)
                                    .When(t => t == SidePadType.DesignTree, () => new AppBoxDesign.DesignTreePad())
                                    .When(t => t == SidePadType.Outline, () => new AppBoxDesign.OutlinePad())
                                    .When(t => t == SidePadType.Toolbox, () => new AppBoxDesign.ToolboxPad())
                                    .When(t => t == SidePadType.Settings, () => new AppBoxDesign.SettingsPad())
                            })
                    ]
            });
    }
}
