import {Point} from "../../src/PixUI/CanvasKit/Point";
import {OpEquality, OpInequality} from "../../src/System/Utils";

class Animable {
    private static readonly $meta_info = true;
}

class Cat extends Animable {

}

describe("Equality tests", () => {

    it("OpEquality test", () => {
        let a = new Point(1, 2);
        let b = new Point(1, 2);


        // let ds1 = Uint16Array.from('Hello');
        //let ds3 = Int16Array.from("123456");
        //let ds3 = new Uint16Array("12345");
        let ds2 = Uint16Array.from([65, 66, 67, 68]);
        //let ds2 = new Uint16Array([65, 66, 67, 68]);
        //let str1 = new TextDecoder("utf-16").decode(ds2);
        // @ts-ignore
        let str2 = String.fromCharCode.apply(null, ds2);
        expect(str2).toEqual("ABCD");

        let res = OpEquality(a, b);
        expect(res).toEqual(true);
    });


    it("OpInequality test", () => {
        let a = new Point(1, 2);
        let b = new Point(1, 3);

        let res = OpInequality(a, b);
        expect(res).toEqual(true);
    });

    it("Inherit test", () => {
       let cat = new Cat();
       expect("$meta_info" in cat.constructor).toEqual(true);
    });
    
    it("Number test", () => {
        let num = Number.MAX_VALUE;
        expect(Number.isFinite(num)).toEqual(true);
    });

});