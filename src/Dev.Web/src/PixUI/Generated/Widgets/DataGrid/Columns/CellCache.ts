import * as System from '@/System'

export class CellCache<T> {
    public readonly RowIndex: number;
    public readonly CachedItem: Nullable<T>;

    public constructor(rowIndex: number, item: Nullable<T>) {
        this.RowIndex = rowIndex;
        this.CachedItem = item;
    }
}

export class CellCacheComparer<T> implements System.IComparer<CellCache<T>> {
    public Compare(x: CellCache<T>, y: CellCache<T>): number {
        return x.RowIndex.CompareTo(y.RowIndex);
    }

    public Init(props: Partial<CellCacheComparer<T>>): CellCacheComparer<T> {
        Object.assign(this, props);
        return this;
    }
}
