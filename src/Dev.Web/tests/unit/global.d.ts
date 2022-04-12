import {CanvasKit, CanvasKitInitOptions} from "canvaskit-wasm";
import * as pattern from "ts-pattern";
import {Rx} from "../../src/PixUI";

declare global {
    //ts-pattern
    const match: typeof pattern.match;
    const when: typeof pattern.P.when;
    const instanceOf: typeof pattern.P.instanceOf;

    //CanvasKit
    const CanvasKit: CanvasKit;

    function CanvasKitInit(opts: CanvasKitInitOptions): Promise<CanvasKit>;

    //System
    interface Math {
        clamp(v: number, min: number, max: number): number;
    }

    interface Number {get obs(): Rx<number>;}

    interface String {get obs(): Rx<string>;}

    interface Boolean {get obs(): Rx<boolean>;}

    type Nullable<T> = T | null | undefined;

}
