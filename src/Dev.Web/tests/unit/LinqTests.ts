import {List} from "@/System";

describe("Linq tests", () => {

    it("Sum test", () => {
        let list = new List<number>([1, 2, 3]);
        let sum = list.Sum();
        expect(sum).toEqual(6);
    });

});
