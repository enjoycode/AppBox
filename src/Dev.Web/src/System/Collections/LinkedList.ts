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
}