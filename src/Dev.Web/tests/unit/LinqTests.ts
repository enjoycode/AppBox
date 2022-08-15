import {List} from "@/System";

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


describe("Linq tests", () => {

    it("Sum test", () => {
        let list = new List<number>([1, 2, 3]);
        let sum = list.Sum();
        expect(sum).toEqual(6);
    });
    
    it("Cast test", () => {
       let src = new List<Base>([new Child("Eric")]);
       let dest = src.Cast<Child>().ToArray();
       expect(dest[0].Name).toEqual("Eric");
    });

});
