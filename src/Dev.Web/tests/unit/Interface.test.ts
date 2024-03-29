import {describe, it, expect} from "vitest";

interface IState {
    get Name(): string;
}

class State1 implements IState {
    get Name(): string {
        return "";
    }
}

class State2 implements IState {
    Name: string = "hello";
}

class State3 {
    private static readonly $meta_IState = true;
}

class State4 extends State3 {

}

function IsInterfaceOfState(obj: any): obj is IState {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj)
        && ('Name' in obj && typeof obj['Name'] === "string");
}

describe("InterfaceOf Tests", () => {

    it("InterfaceOf", () => {
        let obj1 = new State1();
        let obj2 = new State2();

        expect(IsInterfaceOfState(obj1)).toEqual(true);
        expect(IsInterfaceOfState(obj2)).toEqual(true);
        expect(IsInterfaceOfState({Name: "rick"})).toEqual(true);
        expect(IsInterfaceOfState({})).toEqual(false);
    });

    it("Static meta", () => {
        let obj = new State4();
        if ('$meta_IState' in obj.constructor) {
            console.log("Has Meta");
        } else {
            console.log("NO");
        }
    });

});
