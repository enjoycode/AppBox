import {Point} from "../../src/PixUI/CanvasKit/Point";
import {OpEquality, OpInequality, Equals} from "@/System";

describe("Equality tests", () => {

    it("OpEquality test", () => {
        let a = new Point(1, 2);
        let b = new Point(1, 2);

        let res = OpEquality(a, b);
        expect(res).toEqual(true);
    });


    it("OpInequality test", () => {
        let a = new Point(1, 2);
        let b = new Point(1, 3);

        let res = OpInequality(a, b);
        expect(res).toEqual(true);
    });

    it("System.Equals test", () => {
        let a = new Point(1, 2);
        let b = new Point(1, 2);

        expect(Equals(a, b)).toEqual(true);
        expect(Equals(a, null)).toEqual(false);
    });

});