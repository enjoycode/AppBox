export class Tuple2<T1, T2> {
    public constructor(item1: T1, item2: T2) {
        this.Item1 = item1;
        this.Item2 = item2;
    }

    public readonly Item1: T1;
    public readonly Item2: T2;
}

export class Tuple4<T1,T2,T3,T4> {
    public constructor(item1: T1, item2: T2, item3: T3, item4: T4) {
        this.Item1 = item1;
        this.Item2 = item2;
        this.Item3 = item3;
        this.Item4 = item4;
    }

    public readonly Item1: T1;
    public readonly Item2: T2;
    public readonly Item3: T3;
    public readonly Item4: T4;
}