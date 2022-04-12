import {Rx} from "@/PixUI";

export const initializeSystem = () => {
    Object.defineProperty(String.prototype, "obs", {
        get: function () {
            return new Rx<string>(this);
        }
    });

    Object.defineProperty(String.prototype, "Insert", {
        value: function Insert(pos: number, str: string): string {
            return this.slice(0, pos) + str + this.slice(pos);
        },
        writable: true,
        configurable: true,
    });

    Object.defineProperty(String.prototype, "Remove", {
        value: function Remove(start: number, count: number): string {
            return this.substring(0, start) + this.substring(start + count);
        },
        writable: true,
        configurable: true,
    });

    Object.defineProperty(Number.prototype, "obs", {
        get: function () {
            return new Rx<number>(this);
        }
    });
    Object.defineProperty(Boolean.prototype, "obs", {
        get: function () {
            return new Rx<boolean>(this);
        }
    });

    // Object.defineProperty(Array.prototype, "IndexOf", {
    //     value: function IndexOf(item: any): number {
    //         return this.findIndex(item);
    //     }
    // });
}
