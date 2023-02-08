import {describe, it, expect} from "vitest";

class Person {
    public static personStatic: number = 12;
    
    private static NestedClass = class {
        public static nestedClassStatic: number = 10;
        
        public NestedName: string;
        public NestedPhone: string;
    }
    
    public Test() {
        let nested = new Person.NestedClass();
        nested.NestedName = "aa";
        let aa = Person.NestedClass.nestedClassStatic;
    }
}

describe("NestedClass Tests", () => {

    it("NestedClass", () => {
        
        //expect(timespan.TotalSeconds).toEqual(1);
    });

});