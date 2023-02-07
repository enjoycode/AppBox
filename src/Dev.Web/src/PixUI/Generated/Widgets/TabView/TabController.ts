import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class TabController<T> implements PixUI.IStateBindable {
    public constructor(dataSource: System.IList<T>) {
        this.DataSource = dataSource;
        // if (DataSource is RxList<T> rxList)
        // {
        //     rxList.AddBinding(this, BindingOptions.None);
        // }
    }

    private _tabBar: Nullable<PixUI.TabBar<T>>;
    private _tabBody: Nullable<PixUI.TabBody<T>>;

    public readonly DataSource: System.IList<T>;

    public get Count(): number {
        return this.DataSource.length;
    }

    #SelectedIndex: number = -1;
    public get SelectedIndex() {
        return this.#SelectedIndex;
    }

    private set SelectedIndex(value) {
        this.#SelectedIndex = value;
    }

    public BindTabBar(tabBar: PixUI.TabBar<T>) {
        this._tabBar = tabBar;
    }

    public BindTabBody(tabBody: PixUI.TabBody<T>) {
        this._tabBody = tabBody;
    }

    public OnStateChanged(state: PixUI.StateBase, options: PixUI.BindingOptions) {
    }


    public readonly TabSelectChanged = new System.Event<number>();
    public readonly TabAdded = new System.Event<T>();
    public readonly TabClosed = new System.Event<T>();


    public GetAt(index: number): T {
        return this.DataSource[index];
    }

    // public T this[int index] => DataSource[index];

    public IndexOf(dataItem: T): number {
        return this.DataSource.IndexOf(dataItem);
    }

    /// <summary>
    /// 选择指定的Tab
    /// </summary>
    public SelectAt(index: number, byTapTab: boolean = false) {
        if (index < 0 || index == this.SelectedIndex) return;

        //TODO: check need scroll to target tab
        if (this._tabBar != null && this.SelectedIndex >= 0)
            this._tabBar.Tabs[this.SelectedIndex].IsSelected.Value = false;

        let oldIndex = this.SelectedIndex;
        this.SelectedIndex = index;
        this._tabBody?.SwitchFrom(oldIndex);

        if (this._tabBar != null)
            this._tabBar.Tabs[this.SelectedIndex].IsSelected.Value = true;

        this.TabSelectChanged.Invoke(index);
    }

    public Add(dataItem: T) {
        this.DataSource.Add(dataItem);
        this._tabBar?.OnAdd(dataItem);
        this._tabBody?.OnAdd(dataItem);
        this.TabAdded.Invoke(dataItem);

        this.SelectAt(this.DataSource.length - 1); //选中添加的
    }

    public Remove(dataItem: T) {
        let index = this.DataSource.IndexOf(dataItem);
        if (index < 0) return;

        let isSelected = index == this.SelectedIndex; //是否正在移除选中的
        if (index < this.SelectedIndex)
            this.SelectedIndex -= 1;

        this.DataSource.RemoveAt(index);
        this._tabBar?.OnRemoveAt(index);
        this._tabBody?.OnRemoveAt(index);
        this.TabClosed.Invoke(dataItem);

        //原本是选中的那个，移除后选择新的
        if (isSelected) {
            this.SelectedIndex = -1; //reset first
            if (this.DataSource.length > 0) {
                let newSelectedIndex = Math.max(0, index - 1);
                this.SelectAt(newSelectedIndex);
            } else {
                this._tabBody?.ClearBody();
                this.TabSelectChanged.Invoke(-1);
            }
        }
    }

}
