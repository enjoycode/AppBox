import {List, Predicate} from "@/System";
import {Widget} from "./Generated/Widgets/Widget";

export class WidgetList<T extends Widget> extends List<T> {
    private readonly _parent: Widget;

    public constructor(parent: Widget) {
        super();
        this._parent = parent;
    }

    public Add(item: T): void {
        item.Parent = this._parent;
        this.push(item);
    }

    public Remove(item: T): boolean {
        let index = this.indexOf(item);
        if (index >= 0) {
            item.Parent = null;
            this.splice(index, 1);
        }
        return index >= 0;
    }

    public RemoveAll(pred: Predicate<T>) {
        for (let i = this.length - 1; i >= 0; i--) {
            if (pred(this[i])) {
                this[i].Parent = null;
                this.splice(i, 1);
            }
        }
    }

    IndexOf(item: T): number {
        return this.indexOf(item);
    }

    Insert(index: number, item: T): void {
        item.Parent = this._parent;
        this.splice(index, 0, item);
    }

    RemoveAt(index: number): void {
        this[index].Parent = null;
        this.splice(index, 1);
    }

    Clear(): void {
        for (const item of this) {
            item.Parent = null;
        }
        this.splice(0);
    }
}
