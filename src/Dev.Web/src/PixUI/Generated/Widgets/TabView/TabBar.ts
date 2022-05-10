import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class TabBar<T> extends PixUI.Widget {
    private readonly _controller: PixUI.TabController<T>;
    private readonly _tabBuilder: System.Action2<T, PixUI.Tab>;
    private readonly _tabs: System.List<PixUI.Tab> = new System.List<PixUI.Tab>();
    public readonly Scrollable: boolean;
    private _color: Nullable<PixUI.State<PixUI.Color>>;

    private _scrollOffset: number = 0;

    public constructor(controller: PixUI.TabController<T>, tabBuilder: System.Action2<T, PixUI.Tab>, scrollable: boolean = false) {
        super();
        this._controller = controller;
        this._controller.SetTabBar(this);
        this._tabBuilder = tabBuilder;
        this.Scrollable = scrollable;
    }

    public get Color(): Nullable<PixUI.State<PixUI.Color>> {
        return this._color;
    }

    public set Color(value: Nullable<PixUI.State<PixUI.Color>>) {
        this._color = this.Rebind(this._color, value, PixUI.BindingOptions.AffectsVisual);
    }

    public get IsOpaque(): boolean {
        return this._color != null && this._color.Value.Alpha == 0xFF;
    }


    private OnTabSelected(selected: PixUI.Tab) {
        let selectedIndex = this._tabs.IndexOf(selected);
        if (selectedIndex < 0 || selectedIndex == this._controller.SelectedIndex)
            return;

        //TODO: check need scroll to target tab
        this._tabs[this._controller.SelectedIndex].IsSelected.Value = false;
        this._controller.SetSelectedIndex(selectedIndex, true);
        selected.IsSelected.Value = true;
    }


    public HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        if (!this.ContainsPoint(x, y)) return false;

        result.Add(this);
        if (this._tabs.length == 0) return true;

        for (const tab of this._tabs) {
            let diffX = tab.X - this._scrollOffset;
            if (tab.HitTest(x - diffX, y - tab.Y, result))
                return true;
        }

        return true;
    }

    public Layout(availableWidth: number, availableHeight: number) {
        this.TryBuildTabs();

        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);
        if (this._tabs.length == 0) {
            this.SetSize(width, height);
            return;
        }

        if (this.Scrollable) {
            this.SetSize(width, height); //TODO:考虑累加宽度

            let offsetX = 0;
            for (let i = 0; i < this._tabs.length; i++) {
                this._tabs[i].Layout(Number.POSITIVE_INFINITY, height);
                this._tabs[i].SetPosition(offsetX, 0);
                offsetX += this._tabs[i].W;
            }
        } else {
            this.SetSize(width, height);

            let tabWidth = width / this._tabs.length;
            for (let i = 0; i < this._tabs.length; i++) {
                this._tabs[i].Layout(tabWidth, height);
                this._tabs[i].SetPosition(tabWidth * i, 0);
            }
        }
    }

    private TryBuildTabs() {
        if (this._controller.DataSource.length == this._tabs.length)
            return;

        for (const dataItem of this._controller.DataSource) {
            let tab = new PixUI.Tab(this.Scrollable);
            this._tabBuilder(dataItem, tab);
            tab.Parent = this;
            tab.OnTap = _ => this.OnTabSelected(tab);
            this._tabs.Add(tab);
        }

        this._tabs[0].IsSelected.Value = true;
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        // paint background
        if (this._color != null)
            canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), PixUI.PaintUtils.Shared(this._color.Value));

        for (const tab of this._tabs) //TODO: check visible
        {
            canvas.translate(tab.X, tab.Y);
            tab.Paint(canvas, area?.ToChild(tab.X, tab.Y));
            canvas.translate(-tab.X, -tab.Y);
        }

        //TODO: paint indicator
    }

    public Init(props: Partial<TabBar<T>>): TabBar<T> {
        Object.assign(this, props);
        return this;
    }

}
