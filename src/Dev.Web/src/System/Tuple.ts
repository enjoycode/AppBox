export class Tuple2<T1, T2> {
    public constructor(item1: T1, item2: T2) {
        this.Item1 = item1;
        this.Item2 = item2;
    }

    public readonly Item1: T1;
    public readonly Item2: T2;
}