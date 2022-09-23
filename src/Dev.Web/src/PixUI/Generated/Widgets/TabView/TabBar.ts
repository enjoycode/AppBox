import * as System from '@/System'
import * as PixUI from '@/PixUI'

export interface ITabBar {
    get Scrollable(): boolean;

    get SelectedColor(): Nullable<PixUI.Color>;

    get HoverColor(): Nullable<PixUI.Color>;

}

export class TabBar<T> extends PixUI.Widget implements ITabBar {
    public constructor(controller: PixUI.TabController<T>, tabBuilder: System.Action2<T, PixUI.Tab>, scrollable: boolean = false) {
        super();
        this._controller = controller;
        this._controller.BindTabBar(this);
        this._tabBuilder = tabBuilder;
        this.Scrollable = scrollable;

        // build tabs
        if (this._controller.DataSource.length == this._tabs.length)
            return;

        for (const dataItem of this._controller.DataSource) {
            this._tabs.Add(this.BuildTab(dataItem));
        }

        this._controller.SelectAt(0); //选中第一个Tab
    }

    private readonly _controller: PixUI.TabController<T>;
    private readonly _tabBuilder: System.Action2<T, PixUI.Tab>;
    private readonly _tabs: System.List<PixUI.Tab> = new System.List<PixUI.Tab>();

    public get Tabs(): System.IList<PixUI.Tab> {
        return this._tabs;
    }

    #Scrollable: boolean = false;
    public get Scrollable() {
        return this.#Scrollable;
    }

    private set Scrollable(value) {
        this.#Scrollable = value;
    }

    private _scrollOffset: number = 0;

    public BgColor: Nullable<PixUI.Color>;

    public SelectedColor: Nullable<PixUI.Color>;

    public HoverColor: Nullable<PixUI.Color>;


    private OnTabSelected(selected: PixUI.Tab) {
        let selectedIndex = this._tabs.IndexOf(selected);
        this._controller.SelectAt(selectedIndex, true);
    }

    public OnAdd(dataItem: T) {
        this._tabs.Add(this.BuildTab(dataItem));
        this.Invalidate(PixUI.InvalidAction.Relayout);
    }

    public OnRemoveAt(index: number) {
        this._tabs[index].Parent = null;
        this._tabs.RemoveAt(index);
        this.Invalidate(PixUI.InvalidAction.Relayout);
    }


    private BuildTab(dataItem: T): PixUI.Tab {
        let tab = new PixUI.Tab();
        this._tabBuilder(dataItem, tab);
        tab.Parent = this;
        tab.OnTap = _ => this.OnTabSelected(tab);
        return tab;
    }

    public get IsOpaque(): boolean {
        return this.BgColor != null && this.BgColor.IsOpaque;
    }

    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        if (this._tabs.length == 0) return;
        for (const tab of this._tabs) {
            if (action(tab)) break;
        }
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

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this.BgColor != null)
            canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), PixUI.PaintUtils.Shared(this.BgColor));

        for (const tab of this._tabs) //TODO: check visible
        {
            canvas.translate(tab.X, tab.Y);
            tab.Paint(canvas, area?.ToChild(tab));
            canvas.translate(-tab.X, -tab.Y);
        }

        //TODO: paint indicator
    }

    public Init(props: Partial<TabBar<T>>): TabBar<T> {
        Object.assign(this, props);
        return this;
    }

}
