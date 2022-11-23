import * as System from "@/System";


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

describe("DateTime Tests", () => {

    it("Subtract", () => {
        let date1 = new System.DateTime(2020, 1, 1, 1, 1, 1);
        let date2 = new System.DateTime(2020, 1, 1, 1, 1, 2);
        let timespan = date2.Subtract(date1);
        expect(timespan.TotalSeconds).toEqual(1);
    });

    it("TypeTest", () => {
        Object.defineProperty(Object.prototype, "Init", {
            value: function Init(props: Partial<typeof this>): typeof this {
                Object.assign(this, props);
                return this;
            },
            writable: false,
            configurable: false,
        })
        let p1 = new Person().Init2({Name: "Rick"});
        let p2 = new Person().Init({Name: "Rick"});
        p1.Add(p2);

        //expect(p1.Name).toEqual("Rick");
        //expect(p2.Name).toEqual("Rick");
    });

});
