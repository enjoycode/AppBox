import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'
/// <summary>
/// <p> This class represents an immutable character sequence with
/// fast {@link #concat concatenation}, {@link #insert insertion} and
/// {@link #delete deletion} capabilities (O[Log(n)]) instead of
/// O[n] for StringBuffer/StringBuilder).</p>
///
/// <p><i> Implementation Note: To avoid expensive copy operations ,
/// {@link ImmutableText} instances are broken down into smaller immutable
/// sequences, they form a minimal-depth binary tree.
/// The tree is maintained balanced automatically through <a
/// href="http://en.wikipedia.org/wiki/Tree_rotation">tree rotations</a>.
/// Insertion/deletions are performed in <code>O[Log(n)]</code>
/// instead of <code>O[n]</code> for
/// <code>StringBuffer/StringBuilder</code>.</i></p>
/// </summary>
export class ImmutableText {
    private static readonly BlockSize: number = 1 << 6;

    private static readonly BlockMask: number = ~(ImmutableText.BlockSize - 1);

    private static readonly EmptyNode: CodeEditor.LeafNode = new CodeEditor.LeafNode(new Uint16Array(0));

    public static readonly Empty: ImmutableText = new ImmutableText(ImmutableText.EmptyNode);

    private readonly _root: CodeEditor.Node;

    private _hash: number = 0;

    public get Length(): number {
        return this._root.Length;
    }

    private myLastLeaf: Nullable<InnerLeaf>;

    public GetCharAt(index: number): number {
        if (this._root instanceof CodeEditor.LeafNode)
            return this._root.GetCharAt(index);

        let leaf = this.myLastLeaf;
        if (leaf == null || index < leaf.Offset ||
            index >= leaf.Offset + leaf.LeafNode.Length) {
            this.myLastLeaf = leaf = this.FindLeaf(index, 0);
        }

        return leaf.LeafNode.GetCharAt(index - leaf.Offset);
    }

    private constructor(node: CodeEditor.Node) {
        this._root = node;
    }

    public static FromString(str: string): ImmutableText {
        return new ImmutableText(new CodeEditor.LeafNode(System.StringToUint16Array(str)));
    }

    private Concat(that: ImmutableText): ImmutableText {
        return that.Length == 0 ? this :
            this.Length == 0 ? that :
                new ImmutableText(ImmutableText.ConcatNodes(this.EnsureChunked()._root, that.EnsureChunked()._root));
    }

    public InsertText(index: number, txt: string): ImmutableText {
        return this.GetText(0, index).Concat(ImmutableText.FromString(txt)).Concat(this.SubText(index));
    }

    public RemoveText(start: number, count: number): ImmutableText {
        if (count == 0)
            return this;
        let end = start + count;
        if (end > this.Length)
            throw new System.IndexOutOfRangeException();
        return this.EnsureChunked().GetText(0, start).Concat(this.SubText(end));
    }

    public GetText(start: number, count: number): ImmutableText {
        let end = start + count;
        if ((start < 0) || (start > end) || (end > this.Length)) {
            throw new System.IndexOutOfRangeException(" start :" + start + " end :" + end +
                " needs to be between 0 <= " + this.Length);
        }

        if ((start == 0) && (end == this.Length)) {
            return this;
        }

        if (start == end) {
            return ImmutableText.Empty;
        }

        return new ImmutableText(this._root.SubNode(start, end));
    }

    public CopyTo(srcOffset: number, dest: Uint16Array, count: number) {
        this.VerifyRange(srcOffset, count);
        this._root.CopyTo(srcOffset, dest, count);
    }

    private VerifyRange(startIndex: number, length: number) {
        if (startIndex < 0 || startIndex > this.Length) {
            throw new System.ArgumentOutOfRangeException("startIndex", `0 <= startIndex <= ${this.Length}`);
        }

        if (length < 0 || startIndex + length > this.Length) {
            throw new System.ArgumentOutOfRangeException("length", `0 <= length, startIndex(${startIndex})+length(${length}) <= ${length} `);
        }
    }

    public toString(): string {
        return this._root.toString();
    }

    public ToString(offset: number, length: number): string {
        let data = new Uint16Array(length);
        this.CopyTo(offset, data, length);
        // @ts-ignore
        return String.fromCharCode.apply(null, data);
    }


    private SubText(start: number): ImmutableText {
        return this.GetText(start, this.Length - start);
    }

    private EnsureChunked(): ImmutableText {
        if (this.Length > ImmutableText.BlockSize && this._root instanceof CodeEditor.LeafNode) {
            return new ImmutableText(ImmutableText.NodeOf(<CodeEditor.LeafNode>this._root, 0, this.Length));
        }

        return this;
    }

    private static NodeOf(node: CodeEditor.LeafNode, offset: number, length: number): CodeEditor.Node {
        if (length <= ImmutableText.BlockSize) {
            return node.SubNode(offset, offset + length);
        }

        // Splits on a block boundary.
        let half: number = ((length + ImmutableText.BlockSize) >> 1) & ImmutableText.BlockMask;
        return new CodeEditor.CompositeNode(ImmutableText.NodeOf(node, offset, half), ImmutableText.NodeOf(node, offset + half, length - half));
    }

    public static ConcatNodes(node1: CodeEditor.Node, node2: CodeEditor.Node): CodeEditor.Node {
        // All Text instances are maintained balanced:
        //   (head < tail * 2) & (tail < head * 2)
        let length = node1.Length + node2.Length;
        if (length <= ImmutableText.BlockSize) {
            // Merges to primitive.
            let mergedArray = new Uint16Array(node1.Length + node2.Length);
            node1.CopyTo(0, mergedArray, node1.Length);
            node2.CopyTo(0, mergedArray.subarray(node1.Length), node2.Length);
            return new CodeEditor.LeafNode(mergedArray);
        }

        // Returns a composite.
        let head = node1;
        let tail = node2;
        if ((head.Length << 1) < tail.Length && tail instanceof CodeEditor.CompositeNode) {
            let compositeTail = <CodeEditor.CompositeNode>tail;
            // head too small, returns (head + tail/2) + (tail/2)
            if (compositeTail.head.Length > compositeTail.tail.Length) {
                // Rotates to concatenate with smaller part.
                tail = compositeTail.RotateRight();
            }

            head = ImmutableText.ConcatNodes(head, compositeTail.head);
            tail = compositeTail.tail;
        } else {
            if ((tail.Length << 1) < head.Length && head instanceof CodeEditor.CompositeNode) {
                let compositeHead = <CodeEditor.CompositeNode>head;
                // tail too small, returns (head/2) + (head/2 concat tail)
                if (compositeHead.tail.Length > compositeHead.head.Length) {
                    // Rotates to concatenate with smaller part.
                    head = compositeHead.RotateLeft();
                }

                tail = ImmutableText.ConcatNodes(compositeHead.tail, tail);
                head = compositeHead.head;
            }
        }

        return new CodeEditor.CompositeNode(head, tail);
    }

    private FindLeaf(index: number, offset: number): InnerLeaf {
        let node: CodeEditor.Node = this._root;
        while (true) {
            if (index >= node.Length)
                throw new System.IndexOutOfRangeException();

            if (node instanceof CodeEditor.LeafNode) {
                const leafNode = node;
                return new InnerLeaf(leafNode, offset);
            }

            let composite = <CodeEditor.CompositeNode>node;
            if (index < composite.head.Length) {
                node = composite.head;
            } else {
                offset += composite.head.Length;
                index -= composite.head.Length;
                node = composite.tail;
            }
        }
    }

    public Init(props: Partial<ImmutableText>): ImmutableText {
        Object.assign(this, props);
        return this;
    }

}

export class InnerLeaf {
    public readonly LeafNode: CodeEditor.LeafNode;
    public readonly Offset: number;

    public constructor(leafNode: CodeEditor.LeafNode, offset: number) {
        this.LeafNode = leafNode;
        this.Offset = offset;
    }

    public Init(props: Partial<InnerLeaf>): InnerLeaf {
        Object.assign(this, props);
        return this;
    }
}
