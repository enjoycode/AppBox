import * as System from '@/System'
import * as PixUI from '@/PixUI'

// @ts-ignore for IList implements
export class RxList<T> extends PixUI.StateBase implements System.IList<T> {
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
        this.OnValueChanged();
    }

    public Remove(item: T): boolean {
        let res = this._source.Remove(item);
        if (res)
            this.OnValueChanged();
        return res;
    }

    public Clear() {
        this._source.Clear();
        this.OnValueChanged();
    }

    public Contains(item: T): boolean {
        return this._source.Contains(item);
    }

    public IndexOf(item: T): number {
        return this._source.IndexOf(item);
    }

    public Insert(index: number, item: T) {
        this._source.Insert(index, item);
        this.OnValueChanged();
    }

    public RemoveAt(index: number) {
        this._source.RemoveAt(index);
        this.OnValueChanged();
    }

    public Init(props: Partial<RxList<T>>): RxList<T> {
        Object.assign(this, props);
        return this;
    }

}
