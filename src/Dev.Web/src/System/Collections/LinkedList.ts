import {KeyValuePair} from "@/System";

export class LinkedListNode<T> {
    private prev: LinkedListNode<T> | null;
    private next: LinkedListNode<T> | null;
    private item: T;

    public get Value(): T {
        return this.item;
    }
    public set Value(value) {
        this.item = value;
    }

    public get Next(): LinkedListNode<T> | null {
        return this.next == null /*|| next == list!.head*/ ? null : this.next;
    }

    public get Previous(): LinkedListNode<T> | null {
        return this.prev == null /*|| this == list!.head*/ ? null : this.prev;
    }
}

export class LinkedList<T> {
    //TODO:

    public get length(): number {
        throw new Error();
    }

    public get First(): LinkedListNode<T> {
        throw new Error();
    }

    public get Last(): LinkedListNode<T> {
        throw new Error();
    }

    public Contains(item: T): boolean {
        throw new Error();
    }

    public AddLast(item: T): LinkedListNode<T> {
        throw new Error();
    }

    public AddFirst(item: T): LinkedListNode<T> {
        throw new Error();
    }

    public AddAfter(node: LinkedListNode<T>, item: T): LinkedListNode<T> {
        throw new Error();
    }

    public AddBefore(node: LinkedListNode<T>, item: T): LinkedListNode<T> {
        throw new Error();
    }

    public Remove(node: LinkedListNode<T> | T): boolean {
        throw new Error();
    }

    public Clear(): void {
        throw new Error();
    }

    *[Symbol.iterator](): IterableIterator<T> {
        throw new Error();
    }
}