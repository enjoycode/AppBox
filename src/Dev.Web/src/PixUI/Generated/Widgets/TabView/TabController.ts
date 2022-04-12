import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class TabController<T> implements PixUI.IStateBindable {
    public readonly DataSource: System.IList<T>;

    #SelectedIndex: number = 0;
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
        if (this.DataSource instanceof PixUI.RxList) {
            const rxList = this.DataSource;
            rxList.AddBinding(this, PixUI.BindingOptions.None);
        }
    }

    public SetSelectedIndex(index: number, byTapTab: boolean) {
        let oldIndex = this.SelectedIndex;
        this.SelectedIndex = index;
        this._tabBody?.SwitchTo(oldIndex);
    }

    public SetTabBar(tabBar: PixUI.TabBar<T>) {
        this._tabBar = tabBar;
    }

    public SetTabBody(tabBody: PixUI.TabBody<T>) {
        this._tabBody = tabBody;
    }

    public OnStateChanged(state: PixUI.StateBase, options: PixUI.BindingOptions) {
    }

    public Init(props: Partial<TabController<T>>): TabController<T> {
        Object.assign(this, props);
        return this;
    }
}
