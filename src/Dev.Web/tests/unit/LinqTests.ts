import {List} from "../../src/System/Collections";

describe("Linq tests", () => {

    it("List test", () => {
        let list = new List<number>([1, 2, 3]);
        let sum = list.Sum();
        expect(sum).toEqual(6);
    });

    it("aa", () => {
        let a: bigint = 1n;
        let type = typeof a;
        console.log(type);
    });

});
