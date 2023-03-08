import {Equals as SystemEquals} from "@/System/Utils";

export class Object {
    public static Equals(a: any, b: any): boolean {
        return SystemEquals(a, b);
    }
}