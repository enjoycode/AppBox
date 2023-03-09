import {describe, expect, it} from "vitest";
import {Dictionary, Out} from "../../src/System";


describe("Dictionary Tests", () => {

    it("TryGetValue Test", () => {
        let dic = new Dictionary<string, number>();
        dic.Add("a", 1);

        let v1: number;
        let res1 = dic.TryGetValue("a", new Out<number>(()=>v1,$v=>v1=$v));
        expect(res1).toEqual(true);
        expect(v1).toEqual(1);

        let res2 = dic.TryGetValue("b", new Out<number>(()=>v1,$v=>v1=$v));
        expect(res2).toEqual(false);
    });

    it("ForEach Test", () => {
        let dic = new Dictionary<string, number>().Init([["a", 1], ["b", 2]]);
        for (const entry of dic) {
            console.log("Key=" + entry.Key + "  Value=" + entry.Value);
        }
    });

});