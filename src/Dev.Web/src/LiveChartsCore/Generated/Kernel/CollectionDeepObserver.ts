import * as System from '@/System'

export class CollectionDeepObserver<T> {
    private readonly _onCollectionChanged: System.NotifyCollectionChangedEventHandler;
    private readonly _onItemPropertyChanged: System.PropertyChangedEventHandler;
    private readonly _itemsListening: System.HashSet<System.INotifyPropertyChanged> = new System.HashSet();

    protected checkINotifyPropertyChanged: boolean = false;

    public constructor(
        onCollectionChanged: System.NotifyCollectionChangedEventHandler,
        onItemPropertyChanged: System.PropertyChangedEventHandler,
        checkINotifyPropertyChanged: Nullable<boolean> = null) {
        this._onCollectionChanged = onCollectionChanged;
        this._onItemPropertyChanged = onItemPropertyChanged;

        if (checkINotifyPropertyChanged != null) {
            this.checkINotifyPropertyChanged = checkINotifyPropertyChanged;
            return;
        }

        this.checkINotifyPropertyChanged = true;
    }

    public Initialize(instance: Nullable<System.IEnumerable<T>>) {
        if (instance == null) return;

        if (System.IsInterfaceOfINotifyCollectionChanged(instance)) {
            const incc = instance;
            incc.CollectionChanged.Add(this.OnCollectionChanged, this);
        }

        if (this.checkINotifyPropertyChanged)
            for (const item of CollectionDeepObserver.GetINotifyPropertyChangedItems(instance))
                item.PropertyChanged.Add(this._onItemPropertyChanged, this);
    }

    public Dispose(instance: Nullable<System.IEnumerable<T>>) {
        if (instance == null) return;

        if (System.IsInterfaceOfINotifyCollectionChanged(instance)) {
            const incc = instance;
            incc.CollectionChanged.Remove(this.OnCollectionChanged, this);
        }

        if (this.checkINotifyPropertyChanged)
            for (const item of CollectionDeepObserver.GetINotifyPropertyChangedItems(instance))
                item.PropertyChanged.Remove(this._onItemPropertyChanged, this);
    }

    private OnCollectionChanged(sender: any, e: System.NotifyCollectionChangedEventArgs) {
        if (this.checkINotifyPropertyChanged)
            switch (e.Action) {
                case System.NotifyCollectionChangedAction.Add:
                    for (const item of CollectionDeepObserver.GetINotifyPropertyChangedItems(e.NewItems)) {
                        item.PropertyChanged.Add(this._onItemPropertyChanged, this);
                        this._itemsListening.Add(item);
                    }
                    break;
                case System.NotifyCollectionChangedAction.Remove:
                    for (const item of CollectionDeepObserver.GetINotifyPropertyChangedItems(e.OldItems)) {
                        item.PropertyChanged.Remove(this._onItemPropertyChanged, this);
                        this._itemsListening.Remove(item);
                    }
                    break;
                case System.NotifyCollectionChangedAction.Replace:
                    for (const item of CollectionDeepObserver.GetINotifyPropertyChangedItems(e.NewItems)) {
                        item.PropertyChanged.Add(this._onItemPropertyChanged, this);
                        this._itemsListening.Add(item);
                    }
                    for (const item of CollectionDeepObserver.GetINotifyPropertyChangedItems(e.OldItems)) {
                        item.PropertyChanged.Remove(this._onItemPropertyChanged, this);
                        this._itemsListening.Remove(item);
                    }
                    break;
                case System.NotifyCollectionChangedAction.Reset:
                    for (const item of this._itemsListening) {
                        item.PropertyChanged.Remove(this._onItemPropertyChanged, this);
                    }
                    this._itemsListening.Clear();
                    if (System.IsInterfaceOfIEnumerable(sender)) {
                        const s = sender;
                        for (const item of CollectionDeepObserver.GetINotifyPropertyChangedItems(s)) {
                            item.PropertyChanged.Add(this._onItemPropertyChanged, this);
                            this._itemsListening.Remove(item);
                        }
                    }
                    break;
                case System.NotifyCollectionChangedAction.Move:
                    // ignored.
                    break;
                default:
                    break;
            }

        this._onCollectionChanged(sender, e);
    }

    private static GetINotifyPropertyChangedItems(source: Nullable<System.IEnumerable>): System.IEnumerable<System.INotifyPropertyChanged> {
        const _$generator = function* (source: Nullable<System.IEnumerable>) {
            if (source == null) return;

            for (const item of source) {
                if (System.IsInterfaceOfINotifyPropertyChanged(item)) {
                    const inpc = item;
                    yield inpc;
                }
            }
        }
            .bind(this);
        return System.EnumerableFrom(() => _$generator(source));
    }
}
