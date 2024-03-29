import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class TabView<T> extends PixUI.Widget {
    public constructor(controller: PixUI.TabController<T>,
                       tabBuilder: System.Func3<T, PixUI.State<boolean>, PixUI.Widget>,
                       bodyBuilder: System.Func2<T, PixUI.Widget>,
                       closable: boolean = false, tabBarIndent: number = 35) {
        super();
        this._tabBarIndent = tabBarIndent;
        this._tabBody = new PixUI.TabBody<T>(controller, bodyBuilder);
        this._tabBar = new PixUI.TabBar<T>(controller, (data, tab) => {
            tab.Child = new PixUI.Container().Init(
                {
                    IsLayoutTight: true,
                    Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.Only(10, 2, closable ? 0 : 10, 2)),
                    Child: closable
                        ? new PixUI.Row().Init(
                            {
                                Children:
                                    [
                                        tabBuilder(data, tab.IsSelected),
                                        new PixUI.Button(null, PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Close)).Init(
                                            {
                                                Style: PixUI.ButtonStyle.Transparent,
                                                Shape: PixUI.ButtonShape.Pills,
                                                OnTap: _ => controller.Remove(data)
                                            })
                                    ]
                            })
                        : tabBuilder(data, tab.IsSelected)
                });
        }, true);

        this._tabBody.Parent = this;
        this._tabBar.Parent = this;
    }

    private readonly _tabBar: PixUI.TabBar<T>;
    private readonly _tabBody: PixUI.TabBody<T>;
    private readonly _tabBarIndent: number;

    public get TabBarBgColor(): Nullable<PixUI.Color> {
        return this._tabBar.BgColor;
    }

    public set TabBarBgColor(value: Nullable<PixUI.Color>) {
        this._tabBar.BgColor = value;
    }

    public get SelectedTabColor(): Nullable<PixUI.Color> {
        return this._tabBar.SelectedColor;
    }

    public set SelectedTabColor(value: Nullable<PixUI.Color>) {
        this._tabBar.SelectedColor = value;
    }

    public get HoverTabColor(): Nullable<PixUI.Color> {
        return this._tabBar.HoverColor;
    }

    public set HoverTabColor(value: Nullable<PixUI.Color>) {
        this._tabBar.HoverColor = value;
    }

    VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        if (action(this._tabBar)) return;
        action(this._tabBody);
    }

    Layout(availableWidth: number, availableHeight: number) {
        //TODO:支持上、下、左、右布局
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        this._tabBar.Layout(width, this._tabBarIndent);
        this._tabBar.SetPosition(0, 0);
        this._tabBody.Layout(width, height - this._tabBar.H);
        this._tabBody.SetPosition(0, this._tabBar.H);

        this.SetSize(width, height);
    }

}
