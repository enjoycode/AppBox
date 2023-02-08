import {describe, it, expect} from "vitest";
import * as System from "@/System";

describe("Task Tests", () => {

    it("TaskCompletionSource Test", async () => {
        let tcs = new System.TaskCompletionSource<number>();
        setTimeout(() => {
            tcs.SetResult(1000);
        }, 1000);
        let res = await tcs.Task;
        expect(res).toEqual(1000);
    });

});