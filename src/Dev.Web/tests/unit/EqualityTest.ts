import {Point} from "../../src/PixUI/CanvasKit/Point";
import {OpEquality, OpInequality} from "../../src/System/Utils";

describe("Equality tests", () => {

    it("OpEquality test", () => {
        let a = new Point(1, 2);
        let b = new Point(1, 2);

        //let ds = new Map<Point, string>([[a, "1"], [b, "2"]]);

        let res = OpEquality(a, b);
        expect(res).toEqual(true);
    });


    it("OpInequality test", () => {
        let a = new Point(1, 2);
        let b = new Point(1, 3);

        let res = OpInequality(a, b);
        expect(res).toEqual(true);
    });

});