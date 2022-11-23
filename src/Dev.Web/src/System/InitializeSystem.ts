import {initializeLinq} from "@/System/Linq";
import {P, match} from "ts-pattern";

/** 初始化System */
export const initializeSystem = () => {
    //初始化Linq支持
    initializeLinq();

    //初始化Pattern支持
    let win: any = window;
    win.match = match;
    win.when = P.when;

    //初始化全局clamp函数
    win.clamp = function (v: number, min: number, max: number): number {
        return Math.min(Math.max(v, min), max)
    }

    Object.defineProperty(String.prototype, "Insert", {
        value: function Insert(pos: number, str: string): string {
            return this.slice(0, pos) + str + this.slice(pos);
        },
    });

    Object.defineProperty(String.prototype, "Remove", {
        value: function Remove(start: number, count: number): string {
            return this.substring(0, start) + this.substring(start + count);
        },
    });

    Object.defineProperty(Number.prototype, "CompareTo", {
        value: function CompareTo(other: number) {
            if (this < other) return -1;
            if (this > other) return 1;
            return 0;
        },
    });

    Object.defineProperty(Object.prototype, "Init", {
        value: function Init(props: Partial<typeof this>): typeof this {
            Object.assign(this, props);
            return this;
        },
    })

    // Object.defineProperty(Array.prototype, "IndexOf", {
    //     value: function IndexOf(item: any): number {
    //         return this.findIndex(item);
    //     }
    // });
}
