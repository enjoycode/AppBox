import * as System from '@/System'

export class NamedLabeler {
    private readonly _labels: System.IList<string>;

    public constructor(labels: System.IList<string>) {
        this._labels = labels;
    }

    public Function(value: number): string {
        let index = (Math.floor(value) & 0xFFFFFFFF);

        return index < 0 || index > this._labels.length - 1
            ? '' : this._labels[index];
    }
}
