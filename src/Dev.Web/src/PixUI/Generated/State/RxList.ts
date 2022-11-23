import * as System from '@/System'
import * as PixUI from '@/PixUI'

// @ts-ignore for IList implements
export class RxList<T> extends PixUI.StateBase {
    public get Readonly(): boolean {
        return true;
    }

    private readonly _source: System.IList<T>;

    public constructor(source: System.IList<T>) {
        super();
        this._source = source;
    }


    public Add(item: T) {
        this._source.Add(item);
        this.NotifyValueChanged();
    }

    public Remove(item: T): boolean {
        let res = this._source.Remove(item);
        if (res)
            this.NotifyValueChanged();
        return res;
    }

    public Clear() {
        this._source.Clear();
        this.NotifyValueChanged();
    }

    public Contains(item: T): boolean {
        return this._source.Contains(item);
    }

    public IndexOf(item: T): number {
        return this._source.IndexOf(item);
    }

    public Insert(index: number, item: T) {
        this._source.Insert(index, item);
        this.NotifyValueChanged();
    }

    public RemoveAt(index: number) {
        this._source.RemoveAt(index);
        this.NotifyValueChanged();
    }

}
