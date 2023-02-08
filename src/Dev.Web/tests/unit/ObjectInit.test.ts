import {describe, it, expect} from "vitest";

class Person {
    Name: string;
    Age: number;

    Init2(props: Partial<this>): this {
        Object.assign(this, props);
        return this;
    }

    Add(to: Person): void {
        //do nothing
    }
}

describe("Object Tests", () => {

    it("InitTest", () => {
        Object.defineProperty(Object.prototype, "Init", {
            value: function Init(props: Partial<typeof this>): typeof this {
                Object.assign(this, props);
                return this;
            },
            writable: false,
            configurable: false,
        })
        let p1 = new Person().Init2({Name: "Rick"});
        let p2 = (<any>(new Person())).Init({Name: "Eric"});
        p1.Add(p2);

        expect(p1.Name).toEqual("Rick");
        expect(p2.Name).toEqual("Eric");
    });

});