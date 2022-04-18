import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export abstract class Node {
    public abstract get Length(): number;


    public abstract GetCharAt(index: number): number;

    public abstract CopyTo(srcOffset: number, dest: Uint16Array, count: number): void;

    public abstract SubNode(start: number, end: number): Node ;

    public toString(): string {
        throw new System.NotImplementedException();
    }

    public SubSequence(start: number, end: number): Node {
        return this.SubNode(start, end);
    }
}

export class LeafNode extends Node {
    public constructor(data: Uint16Array) {
        super();
        this._data = data;
    }

    private readonly _data: Uint16Array;

    public get Length(): number {
        return this._data.length;
    }

    public GetCharAt(index: number): number {
        return this._data[index];
    }

    public CopyTo(srcOffset: number, dest: Uint16Array, count: number) {
        let src = this._data.subarray(srcOffset, srcOffset + count);
        dest.set(src);
    }

    public SubNode(start: number, end: number): Node {
        if (start == 0 && end == this.Length)
            return this;

        let subArray = new Uint16Array(end - start);
        subArray.set(this._data.subarray(start, end));
        return new LeafNode(subArray);
    }

    public toString(): string {
        // @ts-ignore
        return String.fromCharCode.apply(null, this._data);
    }

    public Init(props: Partial<LeafNode>): LeafNode {
        Object.assign(this, props);
        return this;
    }
}

export class CompositeNode extends Node {
    public constructor(head: Node, tail: Node) {
        super();
        this._count = head.Length + tail.Length;
        this.head = head;
        this.tail = tail;
    }

    private readonly _count: number;
    public readonly head: Node;
    public readonly tail: Node;

    public get Length(): number {
        return this._count;
    }

    public GetCharAt(index: number): number {
        let headLength = this.head.Length;
        return index < headLength
            ? this.head.GetCharAt(index)
            : this.tail.GetCharAt(index - headLength);
    }

    public RotateRight(): Node {
        // See: http://en.wikipedia.org/wiki/Tree_rotation
        if (this.head instanceof CompositeNode) {
            const p = this.head;
            return new CompositeNode(p.head, new CompositeNode(p.tail, this.tail));
        }

        return this; // Head not a composite, cannot rotate.
    }

    public RotateLeft(): Node {
        // See: http://en.wikipedia.org/wiki/Tree_rotation
        if (this.tail instanceof CompositeNode) {
            const q = this.tail;
            return new CompositeNode(new CompositeNode(this.head, q.head), q.tail);
        }

        return this; // Tail not a composite, cannot rotate.
    }

    public CopyTo(srcOffset: number, dest: Uint16Array, count: number) {
        let cesure = this.head.Length;
        if (srcOffset + count <= cesure) {
            this.head.CopyTo(srcOffset, dest, count);
        } else if (srcOffset >= cesure) {
            this.tail.CopyTo(srcOffset - cesure, dest, count);
        } else {
            // Overlaps head and tail.
            let headChunkSize = cesure - srcOffset;
            this.head.CopyTo(srcOffset, dest, headChunkSize);
            this.tail.CopyTo(0, dest.subarray(headChunkSize), count - headChunkSize);
        }
    }

    public SubNode(start: number, end: number): Node {
        let cesure = this.head.Length;
        if (end <= cesure)
            return this.head.SubNode(start, end);

        if (start >= cesure)
            return this.tail.SubNode(start - cesure, end - cesure);

        if ((start == 0) && (end == this._count))
            return this;

        // Overlaps head and tail.
        return CodeEditor.ImmutableText.ConcatNodes(this.head.SubNode(start, cesure), this.tail.SubNode(0, end - cesure));
    }

    public Init(props: Partial<CompositeNode>): CompositeNode {
        Object.assign(this, props);
        return this;
    }
}
