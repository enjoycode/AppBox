import {describe, it, expect} from "vitest";
import {Matrix4} from "../../src/PixUI/CanvasKit/Matrix4";

describe("Matrix Tests", () => {

    it("RotateZ", () => {
        let matrix = Matrix4.CreateIdentity();
        matrix.RotateZ(<number><unknown>(0.75 * Math.PI * 2.0));
        console.log(matrix);
        //expect(timespan.TotalSeconds).toEqual(1);
    });

});