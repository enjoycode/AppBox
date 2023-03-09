import * as System from '@/System'
import * as CodeEditor from '@/CodeEditor'

export class RBNode {
    public readonly LineSegment: CodeEditor.LineSegment;
    public Count: number = 0;
    public TotalLength: number = 0;

    public constructor(lineSegment: CodeEditor.LineSegment) {
        this.LineSegment = lineSegment;
        this.Count = 1;
        this.TotalLength = lineSegment.TotalLength;
    }

    public toString(): string {
        return "[RBNode count=" + this.Count + " totalLength=" + this.TotalLength
            + " lineSegment.LineNumber=" + this.LineSegment.LineNumber
            + " lineSegment.Offset=" + this.LineSegment.Offset
            + " lineSegment.TotalLength=" + this.LineSegment.TotalLength
            + " lineSegment.DelimiterLength=" + this.LineSegment.DelimiterLength + "]";
    }
}

export class RBHost implements CodeEditor.IRedBlackTreeHost<RBNode> {
    public Compare(x: RBNode, y: RBNode): number {
        throw new System.NotImplementedException();
    }

    public Equals(a: RBNode, b: RBNode): boolean {
        throw new System.NotImplementedException();
    }

    public UpdateAfterChildrenChange(node: CodeEditor.RedBlackTreeNode<RBNode>) {
        let count: number = 1;
        let totalLength: number = node.Value.LineSegment.TotalLength;
        if (node.Left != null) {
            count += node.Left.Value.Count;
            totalLength += node.Left.Value.TotalLength;
        }

        if (node.Right != null) {
            count += node.Right.Value.Count;
            totalLength += node.Right.Value.TotalLength;
        }

        if (count != node.Value.Count || totalLength != node.Value.TotalLength) {
            node.Value.Count = count;
            node.Value.TotalLength = totalLength;
            if (node.Parent != null) this.UpdateAfterChildrenChange(node.Parent);
        }
    }

    public UpdateAfterRotateLeft(node: CodeEditor.RedBlackTreeNode<RBNode>) {
        this.UpdateAfterChildrenChange(node);
        this.UpdateAfterChildrenChange(node.Parent!);
    }

    public UpdateAfterRotateRight(node: CodeEditor.RedBlackTreeNode<RBNode>) {
        this.UpdateAfterChildrenChange(node);
        this.UpdateAfterChildrenChange(node.Parent!);
    }
}

export class LinesEnumerator {
    public static readonly Invalid: LinesEnumerator = new LinesEnumerator(new CodeEditor.RedBlackTreeIterator<RBNode>(null));

    public Iterator: CodeEditor.RedBlackTreeIterator<RBNode>;

    public constructor(it: CodeEditor.RedBlackTreeIterator<RBNode>) {
        this.Iterator = (it).Clone();
    }

    public Clone(): LinesEnumerator {
        return new LinesEnumerator((this.Iterator).Clone());
    }

    public get Current(): CodeEditor.LineSegment {
        return this.Iterator.Current.LineSegment;
    }

    public get IsValid(): boolean {
        return this.Iterator.IsValid;
    }

    public get CurrentIndex(): number {
        if (this.Iterator.Node == null)
            throw new System.InvalidOperationException();
        return LinesEnumerator.GetIndexFromNode(this.Iterator.Node);
    }

    public get CurrentOffset(): number {
        if (this.Iterator.Node == null)
            throw new System.InvalidOperationException();
        return LinesEnumerator.GetOffsetFromNode(this.Iterator.Node);
    }

    public MoveNext(): boolean {
        return this.Iterator.MoveNext();
    }

    public MoveBack(): boolean {
        return this.Iterator.MoveBack();
    }

    private static GetIndexFromNode(node: CodeEditor.RedBlackTreeNode<RBNode>): number {
        let index = (node.Left != null) ? node.Left.Value.Count : 0;
        while (node.Parent != null) {
            if (node == node.Parent.Right) {
                if (node.Parent.Left != null)
                    index += node.Parent.Left.Value.Count;
                index++;
            }

            node = node.Parent;
        }

        return index;
    }

    private static GetOffsetFromNode(node: CodeEditor.RedBlackTreeNode<RBNode>): number {
        let offset = (node.Left != null) ? node.Left.Value.TotalLength : 0;
        while (node.Parent != null) {
            if (node == node.Parent.Right) {
                if (node.Parent.Left != null)
                    offset += node.Parent.Left.Value.TotalLength;
                offset += node.Parent.Value.LineSegment.TotalLength;
            }

            node = node.Parent;
        }

        return offset;
    }
}

export class LineSegmentTree {
    private readonly _tree: CodeEditor.RedBlackTree<RBNode, RBHost> = new CodeEditor.RedBlackTree<RBNode, RBHost>(new RBHost());

    public GetNode(index: number): CodeEditor.RedBlackTreeNode<RBNode> {
        if (index < 0 || index >= this._tree.Count)
            throw new System.ArgumentOutOfRangeException("index",
                "index should be between 0 and " + (this._tree.Count - 1));
        let node: CodeEditor.RedBlackTreeNode<RBNode> = this._tree.Root;
        while (true) {
            if (node.Left != null && index < node.Left.Value.Count) {
                node = node.Left;
            } else {
                if (node.Left != null) {
                    index -= node.Left.Value.Count;
                }

                if (index == 0)
                    return node;
                index--;
                node = node.Right;
            }
        }
    }

    private GetNodeByOffset(offset: number): CodeEditor.RedBlackTreeNode<RBNode> {
        if (offset < 0 || offset > this.TotalLength)
            throw new System.ArgumentOutOfRangeException("offset",
                "offset should be between 0 and " + this.TotalLength);
        if (offset == this.TotalLength) {
            if (this._tree.Root == null)
                throw new System.InvalidOperationException("Cannot call GetNodeByOffset while tree is empty.");
            return this._tree.Root.RightMost;
        }

        let node = this._tree.Root;
        while (true) {
            if (node.Left != null && offset < node.Left.Value.TotalLength) {
                node = node.Left;
            } else {
                if (node.Left != null) {
                    offset -= node.Left.Value.TotalLength;
                }

                offset -= node.Value.LineSegment.TotalLength;
                if (offset < 0)
                    return node;
                node = node.Right;
            }
        }
    }

    public GetByOffset(offset: number): CodeEditor.LineSegment {
        return this.GetNodeByOffset(offset).Value.LineSegment;
    }

    public get TotalLength(): number {
        return this._tree.Root == null ? 0 : this._tree.Root.Value.TotalLength;
    }

    public SetSegmentLength(segment: CodeEditor.LineSegment, newTotalLength: number) {
        if (segment == null)
            throw new System.ArgumentNullException("segment");
        let node: CodeEditor.RedBlackTreeNode<RBNode> = segment.TreeEntry.Iterator.Node!;
        segment.TotalLength = newTotalLength;
        new RBHost().UpdateAfterChildrenChange(node);
    }

    public RemoveSegment(segment: CodeEditor.LineSegment) {
        this._tree.RemoveAt((segment.TreeEntry.Iterator).Clone());
    }

    public InsertSegmentAfter(segment: CodeEditor.LineSegment, length: number): CodeEditor.LineSegment {
        let newSegment = new CodeEditor.LineSegment();
        newSegment.TotalLength = length;
        newSegment.DelimiterLength = segment.DelimiterLength;

        newSegment.TreeEntry = this.InsertAfter(segment.TreeEntry.Iterator.Node!, newSegment);
        return newSegment;
    }

    InsertAfter(node: CodeEditor.RedBlackTreeNode<RBNode>, newSegment: CodeEditor.LineSegment): LinesEnumerator {
        let newNode: CodeEditor.RedBlackTreeNode<RBNode> = new CodeEditor.RedBlackTreeNode<RBNode>(new RBNode(newSegment));
        if (node.Right == null) {
            this._tree.InsertAsRight(node, newNode);
        } else {
            this._tree.InsertAsLeft(node.Right.LeftMost, newNode);
        }
        return new LinesEnumerator(new CodeEditor.RedBlackTreeIterator<RBNode>(newNode));
    }

    public get Count(): number {
        return this._tree.Count;
    }

    public GetAt(index: number): CodeEditor.LineSegment {
        return this.GetNode(index).Value.LineSegment;
    }

    public IndexOf(item: CodeEditor.LineSegment): number {
        let index = item.LineNumber;
        if (index < 0 || index >= this.Count)
            return -1;
        if (item != this.GetAt(index))
            return -1;
        return index;
    }


    public constructor() {
        this.Clear();
    }

    public Clear() {
        this._tree.Clear();
        let emptySegment: CodeEditor.LineSegment = new CodeEditor.LineSegment();
        emptySegment.TotalLength = 0;
        emptySegment.DelimiterLength = 0;
        this._tree.Add(new RBNode(emptySegment));
        emptySegment.TreeEntry = this.GetEnumeratorForIndex(0);
    }

    public Contains(item: CodeEditor.LineSegment): boolean {
        return this.IndexOf(item) >= 0;
    }

    // public Enumerator GetEnumerator()
    // {
    //     return new LinesEnumerator(tree.GetEnumerator());
    // }

    public GetEnumeratorForIndex(index: number): LinesEnumerator {
        return new LinesEnumerator(new CodeEditor.RedBlackTreeIterator<RBNode>(this.GetNode(index)));
    }

    public GetEnumeratorForOffset(offset: number): LinesEnumerator {
        return new LinesEnumerator(new CodeEditor.RedBlackTreeIterator<RBNode>(this.GetNodeByOffset(offset)));
    }
}
