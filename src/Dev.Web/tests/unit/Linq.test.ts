import {describe, it, expect} from "vitest";
import {List} from "@/System";
import {IEnumerable} from "../../src/System";
import {from} from "../../src/System/Linq";

class Base {
}

class Child extends Base {
    private _name: string;

    public get Name(): string {
        return this._name;
    }

    constructor(name: string) {
        super();
        this._name = name;
    }
}

class YieldClass {
    //private c: number = 0;

    public Gen(count: number): IEnumerable<number> {
        const generator = function* (this: YieldClass, count: number) {
            let c = 0;
            while (true) {
                c++;
                if (c > count) {
                    return;
                } else {
                    yield c;
                }
            }
        }.bind(this);
        return from(() => generator(count));
    }
}

describe("LinqTests", () => {

    it("SumTest", () => {
        let list = new List<number>([1, 2, 3]);
        let sum = list.Sum();
        expect(sum).toEqual(6);
    });

    it("OrderByTest", () => {
        let src = from([0, 0.1, 1.1, 1000.3, 1002.3, 10049, 1005.3, 10050, 10051, 1006.3, 2.1, 3.1]);
        let dest = src.OrderBy(n => n).ToArray();
    });

    it("CastTest", () => {
        let src = new List<Base>([new Child("Eric")]);
        let dest = src.Cast<Child>().ToArray();
        expect(dest[0].Name).toEqual("Eric");
    });

    it("ConcatTest", () => {
        let a: IEnumerable<number> = from([1, 2]);
        let b: IEnumerable<number> = from([3, 4]);
        let c = a.Concat(b);
        expect(c.Sum()).toEqual(10);
    });

    it("YieldTest", () => {
        let c = new YieldClass();
        let e: IEnumerable<number> = c.Gen(10);
        for (let item of e) {
            console.log(item);
        }
        expect(e.Sum()).toEqual(55);
    });

    it("FirstTest", () => {
        let c = new YieldClass();
        let e: IEnumerable<number> = c.Gen(10);
        let n1 = e.First();
        let n2 = e.First();
        expect(n1).toEqual(n2);
    });

});
