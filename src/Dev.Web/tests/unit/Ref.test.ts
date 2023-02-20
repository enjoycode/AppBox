import {describe, it, expect} from "vitest";
import * as System from "@/System";

class DemoClass {
    public name?: string;
    
    public static TestRef1(refArg: System.Ref<number>) {
        refArg.Value += 3;
    }
    
    public static TestRef2(refArg: System.Ref<DemoClass>) {
        refArg.Value = new DemoClass();
        refArg.Value.name = "新建的名称";
    }
}

describe("Ref Tests", () => {

    it("测试ref参数至值类型", () => {
        let refValue = 0;

        DemoClass.TestRef1(new System.Ref<number>(() => refValue, v => refValue = v));

        expect(refValue).toEqual(3);
    });


    it("测试ref参数至null", () => {
        let refObj: DemoClass;

        DemoClass.TestRef2(new System.Ref<DemoClass>(() => refObj, v => refObj = v));

        expect(refObj.name).toEqual("新建的名称");
    });
});