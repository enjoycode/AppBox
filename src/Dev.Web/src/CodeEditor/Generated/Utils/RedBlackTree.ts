import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as CodeEditor from '@/CodeEditor'

export class RedBlackTreeNode<T> {
    public Left: Nullable<RedBlackTreeNode<T>>;
    public Right: Nullable<RedBlackTreeNode<T>>;
    public Parent: Nullable<RedBlackTreeNode<T>>;
    public Value: T;
    public Color: boolean = false;

    public constructor(val: T) {
        this.Value = val;
    }

    public get LeftMost(): RedBlackTreeNode<T> {
        let node: RedBlackTreeNode<T> = this;
        while (node.Left != null)
            node = node.Left;
        return node;
    }

    public get RightMost(): RedBlackTreeNode<T> {
        let node: RedBlackTreeNode<T> = this;
        while (node.Right != null)
            node = node.Right;
        return node;
    }

    public Init(props: Partial<RedBlackTreeNode<T>>): RedBlackTreeNode<T> {
        Object.assign(this, props);
        return this;
    }
}

export interface IRedBlackTreeHost<T> extends System.IComparer<T> {
    Equals(a: T, b: T): boolean;

    UpdateAfterChildrenChange(node: RedBlackTreeNode<T>): void;

    UpdateAfterRotateLeft(node: RedBlackTreeNode<T>): void;

    UpdateAfterRotateRight(node: RedBlackTreeNode<T>): void;
}

/// <summary>
/// Description of RedBlackTree.
/// </summary>
export class RedBlackTree<T, Host extends IRedBlackTreeHost<T>> {
    public constructor(host: Host) {
        if (host == null) throw new System.ArgumentNullException("host");
        this._host = host;
    }

    private readonly _host: Host;
    #Root: Nullable<RedBlackTreeNode<T>>;
    public get Root() {
        return this.#Root;
    }

    private set Root(value) {
        this.#Root = value;
    }

    #Count: number = 0;
    public get Count() {
        return this.#Count;
    }

    private set Count(value) {
        this.#Count = value;
    }

    public Clear() {
        this.Root = null;
        this.Count = 0;
    }


    public Add(item: T) {
        this.AddInternal(new RedBlackTreeNode<T>(item));
    }

    private AddInternal(newNode: RedBlackTreeNode<T>) {
        console.assert(newNode.Color == RedBlackTree.BLACK);
        if (this.Root == null) {
            this.Count = 1;
            this.Root = newNode;
            return;
        }

        // Insert into the tree
        let parentNode: RedBlackTreeNode<T> = this.Root;
        while (true) {
            if (this._host.Compare(newNode.Value, parentNode.Value) <= 0) {
                if (parentNode.Left == null) {
                    this.InsertAsLeft(parentNode, newNode);
                    return;
                }

                parentNode = parentNode.Left;
            } else {
                if (parentNode.Right == null) {
                    this.InsertAsRight(parentNode, newNode);
                    return;
                }

                parentNode = parentNode.Right;
            }
        }
    }

    public InsertAsLeft(parentNode: RedBlackTreeNode<T>, newNode: RedBlackTreeNode<T>) {
        console.assert(parentNode.Left == null);
        parentNode.Left = newNode;
        newNode.Parent = parentNode;
        newNode.Color = RedBlackTree.RED;
        this._host.UpdateAfterChildrenChange(parentNode);
        this.FixTreeOnInsert(newNode);
        this.Count++;
    }

    public InsertAsRight(parentNode: RedBlackTreeNode<T>, newNode: RedBlackTreeNode<T>) {
        console.assert(parentNode.Right == null);
        parentNode.Right = newNode;
        newNode.Parent = parentNode;
        newNode.Color = RedBlackTree.RED;
        this._host.UpdateAfterChildrenChange(parentNode);
        this.FixTreeOnInsert(newNode);
        this.Count++;
    }

    private FixTreeOnInsert(node: RedBlackTreeNode<T>) {
        console.assert(node != null);
        console.assert(node.Color == RedBlackTree.RED);
        console.assert(node.Left == null || node.Left.Color == RedBlackTree.BLACK);
        console.assert(node.Right == null || node.Right.Color == RedBlackTree.BLACK);

        let parentNode: RedBlackTreeNode<T> = node.Parent;
        if (parentNode == null) {
            // we inserted in the root -> the node must be black
            // since this is a root node, making the node black increments the number of black nodes
            // on all paths by one, so it is still the same for all paths.
            node.Color = RedBlackTree.BLACK;
            return;
        }

        if (parentNode.Color == RedBlackTree.BLACK) {
            // if the parent node where we inserted was black, our red node is placed correctly.
            // since we inserted a red node, the number of black nodes on each path is unchanged
            // -> the tree is still balanced
            return;
        }
        // parentNode is red, so there is a conflict here!

        // because the root is black, parentNode is not the root -> there is a grandparent node
        let grandparentNode: RedBlackTreeNode<T> = parentNode.Parent;
        let uncleNode: RedBlackTreeNode<T> = this.Sibling(parentNode);
        if (uncleNode != null && uncleNode.Color == RedBlackTree.RED) {
            parentNode.Color = RedBlackTree.BLACK;
            uncleNode.Color = RedBlackTree.BLACK;
            grandparentNode.Color = RedBlackTree.RED;
            this.FixTreeOnInsert(grandparentNode);
            return;
        }

        // now we know: parent is red but uncle is black
        // First rotation:
        if (node == parentNode.Right && parentNode == grandparentNode.Left) {
            this.RotateLeft(parentNode);
            node = node.Left;
        } else if (node == parentNode.Left && parentNode == grandparentNode.Right) {
            this.RotateRight(parentNode);
            node = node.Right;
        }

        // because node might have changed, reassign variables:
        parentNode = node.Parent;
        grandparentNode = parentNode.Parent;

        // Now recolor a bit:
        parentNode.Color = RedBlackTree.BLACK;
        grandparentNode.Color = RedBlackTree.RED;
        // Second rotation:
        if (node == parentNode.Left && parentNode == grandparentNode.Left) {
            this.RotateRight(grandparentNode);
        } else {
            // because of the first rotation, this is guaranteed:
            console.assert(node == parentNode.Right && parentNode == grandparentNode.Right);
            this.RotateLeft(grandparentNode);
        }
    }

    private ReplaceNode(replacedNode: RedBlackTreeNode<T>, newNode: RedBlackTreeNode<T>) {
        if (replacedNode.Parent == null) {
            console.assert(replacedNode == this.Root);
            this.Root = newNode;
        } else {
            if (replacedNode.Parent.Left == replacedNode)
                replacedNode.Parent.Left = newNode;
            else
                replacedNode.Parent.Right = newNode;
        }

        if (newNode != null) {
            newNode.Parent = replacedNode.Parent;
        }

        replacedNode.Parent = null;
    }

    private RotateLeft(p: RedBlackTreeNode<T>) {
        // let q be p's right child
        let q: RedBlackTreeNode<T> = p.Right;
        console.assert(q != null);
        console.assert(q.Parent == p);
        // set q to be the new root
        this.ReplaceNode(p, q);

        // set p's right child to be q's left child
        p.Right = q.Left;
        if (p.Right != null) p.Right.Parent = p;
        // set q's left child to be p
        q.Left = p;
        p.Parent = q;
        this._host.UpdateAfterRotateLeft(p);
    }

    private RotateRight(p: RedBlackTreeNode<T>) {
        // let q be p's left child
        let q: RedBlackTreeNode<T> = p.Left;
        console.assert(q != null);
        console.assert(q.Parent == p);
        // set q to be the new root
        this.ReplaceNode(p, q);

        // set p's left child to be q's right child
        p.Left = q.Right;
        if (p.Left != null) p.Left.Parent = p;
        // set q's right child to be p
        q.Right = p;
        p.Parent = q;
        this._host.UpdateAfterRotateRight(p);
    }

    private Sibling(node: RedBlackTreeNode<T>): RedBlackTreeNode<T> {
        return node == node.Parent.Left ? node.Parent.Right : node.Parent.Left;
    }


    public RemoveAt(iterator: RedBlackTreeIterator<T>) {
        let node: RedBlackTreeNode<T> = iterator.Node;
        if (node == null)
            throw new System.ArgumentException("Invalid iterator");
        while (node.Parent != null)
            node = node.Parent;
        if (node != this.Root)
            throw new System.ArgumentException("Iterator does not belong to this tree");
        this.RemoveNode(iterator.Node);
    }

    public RemoveNode(removedNode: RedBlackTreeNode<T>) {
        if (removedNode.Left != null && removedNode.Right != null) {
            // replace removedNode with it's in-order successor

            let leftMost: RedBlackTreeNode<T> = removedNode.Right.LeftMost;
            this.RemoveNode(leftMost); // remove leftMost from its current location

            // and overwrite the removedNode with it
            this.ReplaceNode(removedNode, leftMost);
            leftMost.Left = removedNode.Left;
            if (leftMost.Left != null) leftMost.Left.Parent = leftMost;
            leftMost.Right = removedNode.Right;
            if (leftMost.Right != null) leftMost.Right.Parent = leftMost;
            leftMost.Color = removedNode.Color;

            this._host.UpdateAfterChildrenChange(leftMost);
            if (leftMost.Parent != null) this._host.UpdateAfterChildrenChange(leftMost.Parent);
            return;
        }

        this.Count--;

        // now either removedNode.left or removedNode.right is null
        // get the remaining child
        let parentNode: RedBlackTreeNode<T> = removedNode.Parent;
        let childNode: RedBlackTreeNode<T> = removedNode.Left ?? removedNode.Right;
        this.ReplaceNode(removedNode, childNode);
        if (parentNode != null) this._host.UpdateAfterChildrenChange(parentNode);
        if (removedNode.Color == RedBlackTree.BLACK) {
            if (childNode != null && childNode.Color == RedBlackTree.RED) {
                childNode.Color = RedBlackTree.BLACK;
            } else {
                this.FixTreeOnDelete(childNode, parentNode);
            }
        }
    }

    private static Sibling(node: RedBlackTreeNode<T>, parentNode: RedBlackTreeNode<T>): RedBlackTreeNode<T> {
        console.assert(node == null || node.Parent == parentNode);
        if (node == parentNode.Left)
            return parentNode.Right;
        else
            return parentNode.Left;
    }

    private static readonly RED: boolean = true;
    private static readonly BLACK: boolean = false;

    private static GetColor(node: RedBlackTreeNode<T>): boolean {
        return node != null ? node.Color : RedBlackTree.BLACK;
    }

    FixTreeOnDelete(node: RedBlackTreeNode<T>, parentNode: RedBlackTreeNode<T>) {
        console.assert(node == null || node.Parent == parentNode);
        if (parentNode == null)
            return;

        // warning: node may be null
        let sibling: RedBlackTreeNode<T> = RedBlackTree.Sibling(node, parentNode);
        if (sibling.Color == RedBlackTree.RED) {
            parentNode.Color = RedBlackTree.RED;
            sibling.Color = RedBlackTree.BLACK;
            if (node == parentNode.Left) {
                this.RotateLeft(parentNode);
            } else {
                this.RotateRight(parentNode);
            }

            sibling = RedBlackTree.Sibling(node, parentNode); // update value of sibling after rotation
        }

        if (parentNode.Color == RedBlackTree.BLACK
            && sibling.Color == RedBlackTree.BLACK
            && RedBlackTree.GetColor(sibling.Left) == RedBlackTree.BLACK
            && RedBlackTree.GetColor(sibling.Right) == RedBlackTree.BLACK) {
            sibling.Color = RedBlackTree.RED;
            this.FixTreeOnDelete(parentNode, parentNode.Parent);
            return;
        }

        if (parentNode.Color == RedBlackTree.RED
            && sibling.Color == RedBlackTree.BLACK
            && RedBlackTree.GetColor(sibling.Left) == RedBlackTree.BLACK
            && RedBlackTree.GetColor(sibling.Right) == RedBlackTree.BLACK) {
            sibling.Color = RedBlackTree.RED;
            parentNode.Color = RedBlackTree.BLACK;
            return;
        }

        if (node == parentNode.Left &&
            sibling.Color == RedBlackTree.BLACK &&
            RedBlackTree.GetColor(sibling.Left) == RedBlackTree.RED &&
            RedBlackTree.GetColor(sibling.Right) == RedBlackTree.BLACK) {
            sibling.Color = RedBlackTree.RED;
            sibling.Left.Color = RedBlackTree.BLACK;
            this.RotateRight(sibling);
        } else if (node == parentNode.Right &&
            sibling.Color == RedBlackTree.BLACK &&
            RedBlackTree.GetColor(sibling.Right) == RedBlackTree.RED &&
            RedBlackTree.GetColor(sibling.Left) == RedBlackTree.BLACK) {
            sibling.Color = RedBlackTree.RED;
            sibling.Right.Color = RedBlackTree.BLACK;
            this.RotateLeft(sibling);
        }

        sibling = RedBlackTree.Sibling(node, parentNode); // update value of sibling after rotation

        sibling.Color = parentNode.Color;
        parentNode.Color = RedBlackTree.BLACK;
        if (node == parentNode.Left) {
            if (sibling.Right != null) {
                console.assert(sibling.Right.Color == RedBlackTree.RED);
                sibling.Right.Color = RedBlackTree.BLACK;
            }

            this.RotateLeft(parentNode);
        } else {
            if (sibling.Left != null) {
                console.assert(sibling.Left.Color == RedBlackTree.RED);
                sibling.Left.Color = RedBlackTree.BLACK;
            }

            this.RotateRight(parentNode);
        }
    }


    public Find(item: T): RedBlackTreeIterator<T> {
        let it: RedBlackTreeIterator<T> = this.LowerBound(item);
        while (it.IsValid && this._host.Compare(it.Current, item) == 0) {
            if (this._host.Equals(it.Current, item))
                return it;
            it.MoveNext();
        }

        return
    default
        (RedBlackTreeIterator<T>);
    }

    public LowerBound(item: T): RedBlackTreeIterator<T> {
        let node: Nullable<RedBlackTreeNode<T>> = this.Root;
        let resultNode: Nullable<RedBlackTreeNode<T>> = null;
        while (node != null) {
            if (this._host.Compare(node.Value, item) < 0) {
                node = node.Right;
            } else {
                resultNode = node;
                node = node.Left;
            }
        }

        return new RedBlackTreeIterator<T>(resultNode);
    }

    public UpperBound(item: T): RedBlackTreeIterator<T> {
        let it: RedBlackTreeIterator<T> = this.LowerBound(item);
        while (it.IsValid && this._host.Compare(it.Current, item) == 0) {
            it.MoveNext();
        }

        return it;
    }

    public Begin(): RedBlackTreeIterator<T> {
        return this.Root == null
            ? new RedBlackTreeIterator<T>(null) : new RedBlackTreeIterator<T>(this.Root.LeftMost);
    }


    public Contains(item: T): boolean {
        return this.Find(item).IsValid;
    }

    public Remove(item: T): boolean {
        let it = this.Find(item);
        if (!it.IsValid)
            return false;

        this.RemoveAt(it);
        return true;
    }

    public Init(props: Partial<RedBlackTree<T, Host>>): RedBlackTree<T, Host> {
        Object.assign(this, props);
        return this;
    }

}

export class RedBlackTreeIterator<T> {
    #Node: Nullable<RedBlackTreeNode<T>>;
    public get Node() {
        return this.#Node;
    }

    private set Node(value) {
        this.#Node = value;
    }

    public constructor(node: Nullable<RedBlackTreeNode<T>>) {
        this.Node = node;
    }

    public get IsValid(): boolean {
        return this.Node != null;
    }

    public get Current(): T {
        if (this.Node != null)
            return this.Node.Value;
        throw new System.InvalidOperationException();
    }


    public MoveNext(): boolean {
        if (this.Node == null)
            return false;
        if (this.Node.Right != null) {
            this.Node = this.Node.Right.LeftMost;
        } else {
            let oldNode: RedBlackTreeNode<T>;
            do {
                oldNode = this.Node;
                this.Node = this.Node.Parent;
                // we are on the way up from the right part, don't output node again
            } while (this.Node != null && this.Node.Right == oldNode);
        }

        return this.Node != null;
    }

    public MoveBack(): boolean {
        if (this.Node == null)
            return false;
        if (this.Node.Left != null) {
            this.Node = this.Node.Left.RightMost;
        } else {
            let oldNode: RedBlackTreeNode<T>;
            do {
                oldNode = this.Node;
                this.Node = this.Node.Parent;
                // we are on the way up from the left part, don't output node again
            } while (this.Node != null && this.Node.Left == oldNode);
        }

        return this.Node != null;
    }
}
