import {CanvasKit, CanvasKitInitOptions, TypefaceFontProvider} from "canvaskit-wasm";
import * as pattern from "ts-pattern";
import {IEnumerable} from "@/System/Linq";
import {Rx} from "@/PixUI";

declare global {
    //ts-pattern
    const match: typeof pattern.match;
    const when: typeof pattern.P.when;
    const instanceOf: typeof pattern.P.instanceOf;

    //CanvasKit
    const CanvasKit: CanvasKit;

    function CanvasKitInit(opts: CanvasKitInitOptions): Promise<CanvasKit>;

    //Linq
    interface Array<T> extends IEnumerable<T> { }
    interface Uint8Array extends IEnumerable<number> { }
    interface Uint8ClampedArray extends IEnumerable<number> { }
    interface Uint16Array extends IEnumerable<number> { }
    interface Uint32Array extends IEnumerable<number> { }
    interface Int8Array extends IEnumerable<number> { }
    interface Int16Array extends IEnumerable<number> { }
    interface Int32Array extends IEnumerable<number> { }
    interface Float32Array extends IEnumerable<number> { }
    interface Float64Array extends IEnumerable<number> { }
    interface Map<K, V> extends IEnumerable<[K, V]> { }
    interface Set<T> extends IEnumerable<T> { }
    interface String extends IEnumerable<string> { }

    //System
    function clamp(v: number, min: number, max: number): number;

    type Nullable<T> = T | null | undefined;

    interface Number {
        get obs(): Rx<number>;
        CompareTo(other: number): number;
    }

    interface String {
        get obs(): Rx<string>;
        Insert(pos: number, str: string): string;
        Remove(start: number, count: number): string;
    }

    interface Boolean {get obs(): Rx<boolean>;}

    interface Object {
        Init(props: any): any;
    }

}




