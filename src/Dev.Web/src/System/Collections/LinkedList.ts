import {KeyValuePair} from "@/System";

export class LinkedListNode<T> {
    prev: LinkedListNode<T> | null;
    next: LinkedListNode<T> | null;
    list: LinkedList<T> | null;
    
    private item: T;
    
    public constructor(value: T, list: LinkedList<T> = null) {
        this.item = value;
        this.list = list;
    }

    public get Value(): T {
        return this.item;
    }
    public set Value(value) {
        this.item = value;
    }

    public get Next(): LinkedListNode<T> | null {
        return this.next == null || this.next === this.list!.head ? null : this.next;
    }

    public get Previous(): LinkedListNode<T> | null {
        return this.prev == null || this === this.list!.head ? null : this.prev;
    }
    
    Invalidate() {
        this.list = null;
        this.next = null;
        this.prev = null;
    }
}

export class LinkedList<T> {
    head: LinkedListNode<T> | null;
    private count: number = 0;

    public get length(): number {
        return this.count;
    }

    public get First(): LinkedListNode<T> {
        return this.head;
    }

    public get Last(): LinkedListNode<T> {
        return this.head.prev;
    }

    public Contains(item: T): boolean {
        throw new Error();
    }

    public AddLast(value: T): LinkedListNode<T> {
        let result = new LinkedListNode(value, this);
        if (this.head == null)
            this.InternalInsertNodeToEmptyList(result);
        else
            this.InternalInsertNodeBefore(this.head, result);
        return result;
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
    
    private InternalInsertNodeBefore(node: LinkedListNode<T>, newNode: LinkedListNode<T>) {
        newNode.next = node;
        newNode.prev = node.prev;
        node.prev!.next = newNode;
        node.prev = newNode;
        this.count++;
    }
    
    private InternalInsertNodeToEmptyList(newNode: LinkedListNode<T>) {
        newNode.next = newNode;
        newNode.prev = newNode;
        this.head = newNode;
        this.count++;
    }

    public Remove(node: LinkedListNode<T> | T): boolean {
        throw new Error();
    }

    public Clear(): void {
        throw new Error();
    }

    *[Symbol.iterator](): IterableIterator<T> {
        if (this.head == null) return;
        let temp = this.head;
        while (true) {
            yield temp.Value;
            temp = temp.next;
            if (temp == null || temp === this.head)
                return;
        }
    }
}