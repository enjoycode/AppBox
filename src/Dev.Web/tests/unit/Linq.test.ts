import {describe, it, expect} from "vitest";
import {List} from "@/System";
import {IEnumerable} from "../../src/System";
import {from} from "../../src/System/Linq";

class Base {}

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

function* yieldFunc(): Generator<number> {
    yield 1;
    yield 2;
    yield 3;
}

describe("LinqTests", () => {

    it("SumTest", () => {
        let list = new List<number>([1, 2, 3]);
        let sum = list.Sum();
        expect(sum).toEqual(6);
    });
    
    it("CastTest", () => {
       let src = new List<Base>([new Child("Eric")]);
       let dest = src.Cast<Child>().ToArray();
       expect(dest[0].Name).toEqual("Eric");
    });
    
    it("YieldTest", () => {
       let e: IEnumerable<number> = from(yieldFunc); 
       for(let item of e) {
           console.log(item);
       }
       expect(e.Sum()).toEqual(6);
    });

});
