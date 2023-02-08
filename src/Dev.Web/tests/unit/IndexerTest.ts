import {describe, it, expect} from "vitest";

class Widget {}

interface SingleChild {
    [index: number] : Widget;
}

class SingleChild implements Iterable<Widget>{
    private _child?: Widget;

    [Symbol.iterator](): Iterator<Widget> {
        return {
            next(...args): IteratorResult<Widget, any> {
                return {done: true, value: null}
            }
        }
    }

}
