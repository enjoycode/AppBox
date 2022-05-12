import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class TabController<T> implements PixUI.IStateBindable {
    public readonly DataSource: System.IList<T>;

    #SelectedIndex: number = -1;
    public get SelectedIndex() {
        return this.#SelectedIndex;
    }

    private set SelectedIndex(value) {
        this.#SelectedIndex = value;
    }

    private _tabBar: Nullable<PixUI.TabBar<T>>;
    private _tabBody: Nullable<PixUI.TabBody<T>>;

    public constructor(dataSource: System.IList<T>) {
        this.DataSource = dataSource;
    }

    public SetTabBar(tabBar: PixUI.TabBar<T>) {
        this._tabBar = tabBar;
    }

    public SetTabBody(tabBody: PixUI.TabBody<T>) {
        this._tabBody = tabBody;
    }

    public OnStateChanged(state: PixUI.StateBase, options: PixUI.BindingOptions) {
    }


    public IndexOf(dataItem: T): number {
        return this.DataSource.IndexOf(dataItem);
    }

    public SelectAt(index: number, byTapTab: boolean = false) {
        if (index < 0 || index == this.SelectedIndex)
            return;

        //TODO: check need scroll to target tab
        if (this._tabBar != null && this.SelectedIndex >= 0)
            this._tabBar.Tabs[this.SelectedIndex].IsSelected.Value = false;

        let oldIndex = this.SelectedIndex;
        this.SelectedIndex = index;
        this._tabBody?.SwitchFrom(oldIndex);

        if (this._tabBar != null)
            this._tabBar.Tabs[this.SelectedIndex].IsSelected.Value = true;
    }

    public Add(dataItem: T) {
        this.DataSource.Add(dataItem);
        this._tabBar?.OnAdd(dataItem);
        this._tabBody?.OnAdd(dataItem);

        this.SelectAt(this.DataSource.length - 1); //选中添加的
    }

    public Init(props: Partial<TabController<T>>): TabController<T> {
        Object.assign(this, props);
        return this;
    }

}
