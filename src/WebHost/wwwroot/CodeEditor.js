var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _Root, _Count, _Node, _StartPosition, _EndPosition, _FoldText, _Language, _TotalLength, _DelimiterLength, _CachedFolds, _FontHeight, _MouseRegion, _FocusNode;
import * as System from "/System.js";
import * as PixUI from "/PixUI.js";
class ParserInput {
  constructor(textBuffer) {
    __publicField(this, "_textBuffer");
    __publicField(this, "_readBuffer");
    this._textBuffer = textBuffer;
    this._readBuffer = new Uint16Array(1024);
  }
  Read(startIndex, startPoint, endIndex) {
    console.log(`ParserInput.Read: ${startIndex} ${startPoint} ${endIndex}`);
    const offset = startIndex;
    if (offset >= this._textBuffer.Length)
      return null;
    let count = Math.min(this._readBuffer.length, this._textBuffer.Length - offset);
    if (endIndex) {
      count = Math.min(count, endIndex - startIndex);
    }
    this._textBuffer.CopyTo(this._readBuffer, offset, count);
    return String.fromCharCode.apply(null, this._readBuffer.subarray(0, count));
  }
}
const _TSPoint = class {
  constructor(row, column) {
    __publicField(this, "row");
    __publicField(this, "column");
    this.row = Math.floor(row) & 4294967295;
    this.column = Math.floor(column) & 4294967295;
  }
  Clone() {
    return new _TSPoint(Math.floor(this.row) & 4294967295, Math.floor(this.column) & 4294967295);
  }
  static FromLocation(location) {
    return new _TSPoint(location.Line, location.Column * SyntaxParser.ParserEncoding);
  }
  toString() {
    return `(${this.row}, ${this.column})`;
  }
};
let TSPoint = _TSPoint;
__publicField(TSPoint, "Empty", new _TSPoint(0, 0));
class TSEdit {
  constructor() {
    __publicField(this, "startIndex", 0);
    __publicField(this, "oldEndIndex", 0);
    __publicField(this, "newEndIndex", 0);
    __publicField(this, "startPosition", TSPoint.Empty.Clone());
    __publicField(this, "oldEndPosition", TSPoint.Empty.Clone());
    __publicField(this, "newEndPosition", TSPoint.Empty.Clone());
  }
  Clone() {
    let clone = new TSEdit();
    clone.startIndex = this.startIndex;
    clone.oldEndIndex = this.oldEndIndex;
    clone.newEndIndex = this.newEndIndex;
    clone.startPosition = this.startPosition;
    clone.oldEndPosition = this.oldEndPosition;
    clone.newEndPosition = this.newEndPosition;
    return clone;
  }
}
class RedBlackTreeNode {
  constructor(val) {
    __publicField(this, "Left");
    __publicField(this, "Right");
    __publicField(this, "Parent");
    __publicField(this, "Value");
    __publicField(this, "Color", false);
    this.Value = val;
  }
  get LeftMost() {
    let node = this;
    while (node.Left != null)
      node = node.Left;
    return node;
  }
  get RightMost() {
    let node = this;
    while (node.Right != null)
      node = node.Right;
    return node;
  }
}
const _RedBlackTree = class {
  constructor(host) {
    __publicField(this, "_host");
    __privateAdd(this, _Root, void 0);
    __privateAdd(this, _Count, 0);
    if (host == null)
      throw new System.ArgumentNullException("host");
    this._host = host;
  }
  get Root() {
    return __privateGet(this, _Root);
  }
  set Root(value) {
    __privateSet(this, _Root, value);
  }
  get Count() {
    return __privateGet(this, _Count);
  }
  set Count(value) {
    __privateSet(this, _Count, value);
  }
  Clear() {
    this.Root = null;
    this.Count = 0;
  }
  Add(item) {
    this.AddInternal(new RedBlackTreeNode(item));
  }
  AddInternal(newNode) {
    console.assert(newNode.Color == _RedBlackTree.BLACK);
    if (this.Root == null) {
      this.Count = 1;
      this.Root = newNode;
      return;
    }
    let parentNode = this.Root;
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
  InsertAsLeft(parentNode, newNode) {
    console.assert(parentNode.Left == null);
    parentNode.Left = newNode;
    newNode.Parent = parentNode;
    newNode.Color = _RedBlackTree.RED;
    this._host.UpdateAfterChildrenChange(parentNode);
    this.FixTreeOnInsert(newNode);
    this.Count++;
  }
  InsertAsRight(parentNode, newNode) {
    console.assert(parentNode.Right == null);
    parentNode.Right = newNode;
    newNode.Parent = parentNode;
    newNode.Color = _RedBlackTree.RED;
    this._host.UpdateAfterChildrenChange(parentNode);
    this.FixTreeOnInsert(newNode);
    this.Count++;
  }
  FixTreeOnInsert(node) {
    console.assert(node != null);
    console.assert(node.Color == _RedBlackTree.RED);
    console.assert(node.Left == null || node.Left.Color == _RedBlackTree.BLACK);
    console.assert(node.Right == null || node.Right.Color == _RedBlackTree.BLACK);
    let parentNode = node.Parent;
    if (parentNode == null) {
      node.Color = _RedBlackTree.BLACK;
      return;
    }
    if (parentNode.Color == _RedBlackTree.BLACK) {
      return;
    }
    let grandparentNode = parentNode.Parent;
    let uncleNode = this.Sibling(parentNode);
    if (uncleNode != null && uncleNode.Color == _RedBlackTree.RED) {
      parentNode.Color = _RedBlackTree.BLACK;
      uncleNode.Color = _RedBlackTree.BLACK;
      grandparentNode.Color = _RedBlackTree.RED;
      this.FixTreeOnInsert(grandparentNode);
      return;
    }
    if (node == parentNode.Right && parentNode == grandparentNode.Left) {
      this.RotateLeft(parentNode);
      node = node.Left;
    } else if (node == parentNode.Left && parentNode == grandparentNode.Right) {
      this.RotateRight(parentNode);
      node = node.Right;
    }
    parentNode = node.Parent;
    grandparentNode = parentNode.Parent;
    parentNode.Color = _RedBlackTree.BLACK;
    grandparentNode.Color = _RedBlackTree.RED;
    if (node == parentNode.Left && parentNode == grandparentNode.Left) {
      this.RotateRight(grandparentNode);
    } else {
      console.assert(node == parentNode.Right && parentNode == grandparentNode.Right);
      this.RotateLeft(grandparentNode);
    }
  }
  ReplaceNode(replacedNode, newNode) {
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
  RotateLeft(p) {
    let q = p.Right;
    console.assert(q != null);
    console.assert(q.Parent == p);
    this.ReplaceNode(p, q);
    p.Right = q.Left;
    if (p.Right != null)
      p.Right.Parent = p;
    q.Left = p;
    p.Parent = q;
    this._host.UpdateAfterRotateLeft(p);
  }
  RotateRight(p) {
    let q = p.Left;
    console.assert(q != null);
    console.assert(q.Parent == p);
    this.ReplaceNode(p, q);
    p.Left = q.Right;
    if (p.Left != null)
      p.Left.Parent = p;
    q.Right = p;
    p.Parent = q;
    this._host.UpdateAfterRotateRight(p);
  }
  Sibling(node) {
    return node == node.Parent.Left ? node.Parent.Right : node.Parent.Left;
  }
  RemoveAt(iterator) {
    let node = iterator.Node;
    if (node == null)
      throw new System.ArgumentException("Invalid iterator");
    while (node.Parent != null)
      node = node.Parent;
    if (node != this.Root)
      throw new System.ArgumentException("Iterator does not belong to this tree");
    this.RemoveNode(iterator.Node);
  }
  RemoveNode(removedNode) {
    var _a;
    if (removedNode.Left != null && removedNode.Right != null) {
      let leftMost = removedNode.Right.LeftMost;
      this.RemoveNode(leftMost);
      this.ReplaceNode(removedNode, leftMost);
      leftMost.Left = removedNode.Left;
      if (leftMost.Left != null)
        leftMost.Left.Parent = leftMost;
      leftMost.Right = removedNode.Right;
      if (leftMost.Right != null)
        leftMost.Right.Parent = leftMost;
      leftMost.Color = removedNode.Color;
      this._host.UpdateAfterChildrenChange(leftMost);
      if (leftMost.Parent != null)
        this._host.UpdateAfterChildrenChange(leftMost.Parent);
      return;
    }
    this.Count--;
    let parentNode = removedNode.Parent;
    let childNode = (_a = removedNode.Left) != null ? _a : removedNode.Right;
    this.ReplaceNode(removedNode, childNode);
    if (parentNode != null)
      this._host.UpdateAfterChildrenChange(parentNode);
    if (removedNode.Color == _RedBlackTree.BLACK) {
      if (childNode != null && childNode.Color == _RedBlackTree.RED) {
        childNode.Color = _RedBlackTree.BLACK;
      } else {
        this.FixTreeOnDelete(childNode, parentNode);
      }
    }
  }
  static Sibling2(node, parentNode) {
    console.assert(node == null || node.Parent == parentNode);
    if (node == parentNode.Left)
      return parentNode.Right;
    else
      return parentNode.Left;
  }
  static GetColor(node) {
    return node != null ? node.Color : _RedBlackTree.BLACK;
  }
  FixTreeOnDelete(node, parentNode) {
    console.assert(node == null || node.Parent == parentNode);
    if (parentNode == null)
      return;
    let sibling = _RedBlackTree.Sibling2(node, parentNode);
    if (sibling.Color == _RedBlackTree.RED) {
      parentNode.Color = _RedBlackTree.RED;
      sibling.Color = _RedBlackTree.BLACK;
      if (node == parentNode.Left)
        this.RotateLeft(parentNode);
      else
        this.RotateRight(parentNode);
      sibling = _RedBlackTree.Sibling2(node, parentNode);
    }
    if (parentNode.Color == _RedBlackTree.BLACK && sibling.Color == _RedBlackTree.BLACK && _RedBlackTree.GetColor(sibling.Left) == _RedBlackTree.BLACK && _RedBlackTree.GetColor(sibling.Right) == _RedBlackTree.BLACK) {
      sibling.Color = _RedBlackTree.RED;
      this.FixTreeOnDelete(parentNode, parentNode.Parent);
      return;
    }
    if (parentNode.Color == _RedBlackTree.RED && sibling.Color == _RedBlackTree.BLACK && _RedBlackTree.GetColor(sibling.Left) == _RedBlackTree.BLACK && _RedBlackTree.GetColor(sibling.Right) == _RedBlackTree.BLACK) {
      sibling.Color = _RedBlackTree.RED;
      parentNode.Color = _RedBlackTree.BLACK;
      return;
    }
    if (node == parentNode.Left && sibling.Color == _RedBlackTree.BLACK && _RedBlackTree.GetColor(sibling.Left) == _RedBlackTree.RED && _RedBlackTree.GetColor(sibling.Right) == _RedBlackTree.BLACK) {
      sibling.Color = _RedBlackTree.RED;
      sibling.Left.Color = _RedBlackTree.BLACK;
      this.RotateRight(sibling);
    } else if (node == parentNode.Right && sibling.Color == _RedBlackTree.BLACK && _RedBlackTree.GetColor(sibling.Right) == _RedBlackTree.RED && _RedBlackTree.GetColor(sibling.Left) == _RedBlackTree.BLACK) {
      sibling.Color = _RedBlackTree.RED;
      sibling.Right.Color = _RedBlackTree.BLACK;
      this.RotateLeft(sibling);
    }
    sibling = _RedBlackTree.Sibling2(node, parentNode);
    sibling.Color = parentNode.Color;
    parentNode.Color = _RedBlackTree.BLACK;
    if (node == parentNode.Left) {
      if (sibling.Right != null) {
        console.assert(sibling.Right.Color == _RedBlackTree.RED);
        sibling.Right.Color = _RedBlackTree.BLACK;
      }
      this.RotateLeft(parentNode);
    } else {
      if (sibling.Left != null) {
        console.assert(sibling.Left.Color == _RedBlackTree.RED);
        sibling.Left.Color = _RedBlackTree.BLACK;
      }
      this.RotateRight(parentNode);
    }
  }
  Find(item) {
    let it = this.LowerBound(item);
    while (it.IsValid && this._host.Compare(it.Current, item) == 0) {
      if (this._host.Equals(it.Current, item))
        return it;
      it.MoveNext();
    }
    return new RedBlackTreeIterator(null);
  }
  LowerBound(item) {
    let node = this.Root;
    let resultNode = null;
    while (node != null) {
      if (this._host.Compare(node.Value, item) < 0) {
        node = node.Right;
      } else {
        resultNode = node;
        node = node.Left;
      }
    }
    return new RedBlackTreeIterator(resultNode);
  }
  UpperBound(item) {
    let it = this.LowerBound(item);
    while (it.IsValid && this._host.Compare(it.Current, item) == 0) {
      it.MoveNext();
    }
    return it;
  }
  Begin() {
    return this.Root == null ? new RedBlackTreeIterator(null) : new RedBlackTreeIterator(this.Root.LeftMost);
  }
  Contains(item) {
    return this.Find(item).IsValid;
  }
  Remove(item) {
    let it = this.Find(item);
    if (!it.IsValid)
      return false;
    this.RemoveAt(it.Clone());
    return true;
  }
};
let RedBlackTree = _RedBlackTree;
_Root = new WeakMap();
_Count = new WeakMap();
__publicField(RedBlackTree, "RED", true);
__publicField(RedBlackTree, "BLACK", false);
const _RedBlackTreeIterator = class {
  constructor(node) {
    __privateAdd(this, _Node, void 0);
    this.Node = node;
  }
  get Node() {
    return __privateGet(this, _Node);
  }
  set Node(value) {
    __privateSet(this, _Node, value);
  }
  Clone() {
    return new _RedBlackTreeIterator(this.Node);
  }
  get IsValid() {
    return this.Node != null;
  }
  get Current() {
    if (this.Node != null)
      return this.Node.Value;
    throw new System.InvalidOperationException();
  }
  MoveNext() {
    if (this.Node == null)
      return false;
    if (this.Node.Right != null) {
      this.Node = this.Node.Right.LeftMost;
    } else {
      let oldNode;
      do {
        oldNode = this.Node;
        this.Node = this.Node.Parent;
      } while (this.Node != null && this.Node.Right == oldNode);
    }
    return this.Node != null;
  }
  MoveBack() {
    if (this.Node == null)
      return false;
    if (this.Node.Left != null) {
      this.Node = this.Node.Left.RightMost;
    } else {
      let oldNode;
      do {
        oldNode = this.Node;
        this.Node = this.Node.Parent;
      } while (this.Node != null && this.Node.Left == oldNode);
    }
    return this.Node != null;
  }
};
let RedBlackTreeIterator = _RedBlackTreeIterator;
_Node = new WeakMap();
const _TextUtils = class {
  static IsUtf16Surrogate(value) {
    return (value & 63488) == 55296;
  }
  static IsUnicodeDirectionality(value) {
    return value == 8207 || value == 8206;
  }
  static IsMultiCodeUnit(codeUnit) {
    return _TextUtils.IsUtf16Surrogate(codeUnit) || codeUnit == _TextUtils.ZwjUtf16 || _TextUtils.IsUnicodeDirectionality(codeUnit);
  }
};
let TextUtils = _TextUtils;
__publicField(TextUtils, "ZwjUtf16", Math.floor(8205) & 255);
class Node {
  toString() {
    throw new System.NotImplementedException();
  }
  SubSequence(start, end) {
    return this.SubNode(start, end);
  }
}
class LeafNode extends Node {
  constructor(data) {
    super();
    __publicField(this, "_data");
    this._data = data;
  }
  get Length() {
    return this._data.length;
  }
  GetCharAt(index) {
    return this._data[index];
  }
  CopyTo(srcOffset, dest, count) {
    let src = this._data.subarray(srcOffset, srcOffset + count);
    dest.set(src);
  }
  SubNode(start, end) {
    if (start == 0 && end == this.Length)
      return this;
    let subArray = new Uint16Array(end - start);
    subArray.set(this._data.subarray(start, end));
    return new LeafNode(subArray);
  }
  toString() {
    return String.fromCharCode.apply(null, this._data);
  }
}
class CompositeNode extends Node {
  constructor(head, tail) {
    super();
    __publicField(this, "_count");
    __publicField(this, "head");
    __publicField(this, "tail");
    this._count = head.Length + tail.Length;
    this.head = head;
    this.tail = tail;
  }
  get Length() {
    return this._count;
  }
  GetCharAt(index) {
    let headLength = this.head.Length;
    return index < headLength ? this.head.GetCharAt(index) : this.tail.GetCharAt(index - headLength);
  }
  RotateRight() {
    if (this.head instanceof CompositeNode) {
      const p = this.head;
      return new CompositeNode(p.head, new CompositeNode(p.tail, this.tail));
    }
    return this;
  }
  RotateLeft() {
    if (this.tail instanceof CompositeNode) {
      const q = this.tail;
      return new CompositeNode(new CompositeNode(this.head, q.head), q.tail);
    }
    return this;
  }
  CopyTo(srcOffset, dest, count) {
    let cesure = this.head.Length;
    if (srcOffset + count <= cesure) {
      this.head.CopyTo(srcOffset, dest, count);
    } else if (srcOffset >= cesure) {
      this.tail.CopyTo(srcOffset - cesure, dest, count);
    } else {
      let headChunkSize = cesure - srcOffset;
      this.head.CopyTo(srcOffset, dest, headChunkSize);
      this.tail.CopyTo(0, dest.subarray(headChunkSize), count - headChunkSize);
    }
  }
  SubNode(start, end) {
    let cesure = this.head.Length;
    if (end <= cesure)
      return this.head.SubNode(start, end);
    if (start >= cesure)
      return this.tail.SubNode(start - cesure, end - cesure);
    if (start == 0 && end == this._count)
      return this;
    return ImmutableText.ConcatNodes(this.head.SubNode(start, cesure), this.tail.SubNode(0, end - cesure));
  }
}
const _ImmutableText = class {
  constructor(node) {
    __publicField(this, "_root");
    __publicField(this, "_hash", 0);
    __publicField(this, "myLastLeaf");
    this._root = node;
  }
  get Length() {
    return this._root.Length;
  }
  GetCharAt(index) {
    if (this._root instanceof LeafNode)
      return this._root.GetCharAt(index);
    let leaf = this.myLastLeaf;
    if (leaf == null || index < leaf.Offset || index >= leaf.Offset + leaf.LeafNode.Length) {
      this.myLastLeaf = leaf = this.FindLeaf(index, 0);
    }
    return leaf.LeafNode.GetCharAt(index - leaf.Offset);
  }
  static FromString(str) {
    return new _ImmutableText(new LeafNode(System.StringToUint16Array(str)));
  }
  Concat(that) {
    return that.Length == 0 ? this : this.Length == 0 ? that : new _ImmutableText(_ImmutableText.ConcatNodes(this.EnsureChunked()._root, that.EnsureChunked()._root));
  }
  InsertText(index, txt) {
    return this.GetText(0, index).Concat(_ImmutableText.FromString(txt)).Concat(this.SubText(index));
  }
  RemoveText(start, count) {
    if (count == 0)
      return this;
    let end = start + count;
    if (end > this.Length)
      throw new System.IndexOutOfRangeException();
    return this.EnsureChunked().GetText(0, start).Concat(this.SubText(end));
  }
  GetText(start, count) {
    let end = start + count;
    if (start < 0 || start > end || end > this.Length) {
      throw new System.IndexOutOfRangeException(" start :" + start + " end :" + end + " needs to be between 0 <= " + this.Length);
    }
    if (start == 0 && end == this.Length) {
      return this;
    }
    if (start == end) {
      return _ImmutableText.Empty;
    }
    return new _ImmutableText(this._root.SubNode(start, end));
  }
  CopyTo(srcOffset, dest, count) {
    this.VerifyRange(srcOffset, count);
    this._root.CopyTo(srcOffset, dest, count);
  }
  VerifyRange(startIndex, length) {
    if (startIndex < 0 || startIndex > this.Length) {
      throw new System.ArgumentOutOfRangeException("startIndex", `0 <= startIndex <= ${this.Length}`);
    }
    if (length < 0 || startIndex + length > this.Length) {
      throw new System.ArgumentOutOfRangeException("length", `0 <= length, startIndex(${startIndex})+length(${length}) <= ${length} `);
    }
  }
  toString() {
    return this._root.toString();
  }
  GetString(offset, length) {
    let data = new Uint16Array(length);
    this.CopyTo(offset, data, length);
    return String.fromCharCode.apply(null, data);
  }
  SubText(start) {
    return this.GetText(start, this.Length - start);
  }
  EnsureChunked() {
    if (this.Length > _ImmutableText.BlockSize && this._root instanceof LeafNode) {
      return new _ImmutableText(_ImmutableText.NodeOf(this._root, 0, this.Length));
    }
    return this;
  }
  static NodeOf(node, offset, length) {
    if (length <= _ImmutableText.BlockSize) {
      return node.SubNode(offset, offset + length);
    }
    let half = length + _ImmutableText.BlockSize >> 1 & _ImmutableText.BlockMask;
    return new CompositeNode(_ImmutableText.NodeOf(node, offset, half), _ImmutableText.NodeOf(node, offset + half, length - half));
  }
  static ConcatNodes(node1, node2) {
    let length = node1.Length + node2.Length;
    if (length <= _ImmutableText.BlockSize) {
      let mergedArray = new Uint16Array(node1.Length + node2.Length);
      node1.CopyTo(0, mergedArray, node1.Length);
      node2.CopyTo(0, mergedArray.subarray(node1.Length), node2.Length);
      return new LeafNode(mergedArray);
    }
    let head = node1;
    let tail = node2;
    if (head.Length << 1 < tail.Length && tail instanceof CompositeNode) {
      let compositeTail = tail;
      if (compositeTail.head.Length > compositeTail.tail.Length) {
        tail = compositeTail.RotateRight();
      }
      head = _ImmutableText.ConcatNodes(head, compositeTail.head);
      tail = compositeTail.tail;
    } else {
      if (tail.Length << 1 < head.Length && head instanceof CompositeNode) {
        let compositeHead = head;
        if (compositeHead.tail.Length > compositeHead.head.Length) {
          head = compositeHead.RotateLeft();
        }
        tail = _ImmutableText.ConcatNodes(compositeHead.tail, tail);
        head = compositeHead.head;
      }
    }
    return new CompositeNode(head, tail);
  }
  FindLeaf(index, offset) {
    let node = this._root;
    while (true) {
      if (index >= node.Length)
        throw new System.IndexOutOfRangeException();
      if (node instanceof LeafNode) {
        const leafNode = node;
        return new InnerLeaf(leafNode, offset);
      }
      let composite = node;
      if (index < composite.head.Length) {
        node = composite.head;
      } else {
        offset += composite.head.Length;
        index -= composite.head.Length;
        node = composite.tail;
      }
    }
  }
};
let ImmutableText = _ImmutableText;
__publicField(ImmutableText, "BlockSize", 1 << 6);
__publicField(ImmutableText, "BlockMask", ~(_ImmutableText.BlockSize - 1));
__publicField(ImmutableText, "EmptyNode", new LeafNode(new Uint16Array(0)));
__publicField(ImmutableText, "Empty", new _ImmutableText(_ImmutableText.EmptyNode));
class InnerLeaf {
  constructor(leafNode, offset) {
    __publicField(this, "LeafNode");
    __publicField(this, "Offset");
    this.LeafNode = leafNode;
    this.Offset = offset;
  }
}
class ImmutableTextBuffer {
  constructor(buffer = null) {
    __publicField(this, "_buffer");
    this._buffer = buffer != null ? buffer : ImmutableText.Empty;
  }
  get ImmutableText() {
    return this._buffer;
  }
  get Length() {
    return this._buffer.Length;
  }
  GetCharAt(offset) {
    return this._buffer.GetText(offset, 1).GetCharAt(0);
  }
  GetText(offset, length) {
    return this._buffer.GetString(offset, length);
  }
  Insert(offset, text) {
    this._buffer = this._buffer.InsertText(offset, text);
  }
  Remove(offset, length) {
    this._buffer = this._buffer.RemoveText(offset, length);
  }
  Replace(offset, length, text) {
    this._buffer = this._buffer.RemoveText(offset, length);
    if (!System.IsNullOrEmpty(text))
      this._buffer = this._buffer.InsertText(offset, text);
  }
  SetContent(text) {
    this._buffer = ImmutableText.FromString(text);
  }
  CopyTo(dest, offset, count) {
    this._buffer.CopyTo(offset, dest, count);
  }
}
const _ColumnRange = class {
  constructor(startColumn, endColumn) {
    __publicField(this, "StartColumn");
    __publicField(this, "EndColumn");
    this.StartColumn = startColumn;
    this.EndColumn = endColumn;
  }
  Equals(other) {
    return this.StartColumn == other.StartColumn && this.EndColumn == other.EndColumn;
  }
  Clone() {
    return new _ColumnRange(this.StartColumn, this.EndColumn);
  }
};
let ColumnRange = _ColumnRange;
__publicField(ColumnRange, "$meta_System_IEquatable", true);
class Selection {
  constructor(document, startPosition, endPosition) {
    __publicField(this, "Document");
    __privateAdd(this, _StartPosition, TextLocation.Empty.Clone());
    __privateAdd(this, _EndPosition, TextLocation.Empty.Clone());
    if (TextLocation.op_GreaterThan(startPosition, endPosition))
      throw new System.ArgumentOutOfRangeException();
    this.Document = document;
    this.StartPosition = startPosition.Clone();
    this.EndPosition = endPosition.Clone();
  }
  get StartPosition() {
    return __privateGet(this, _StartPosition);
  }
  set StartPosition(value) {
    __privateSet(this, _StartPosition, value);
  }
  get EndPosition() {
    return __privateGet(this, _EndPosition);
  }
  set EndPosition(value) {
    __privateSet(this, _EndPosition, value);
  }
  get Offset() {
    return this.Document.PositionToOffset(this.StartPosition.Clone());
  }
  get EndOffset() {
    return this.Document.PositionToOffset(this.EndPosition.Clone());
  }
  get Length() {
    return this.EndOffset - this.Offset;
  }
  get IsEmpty() {
    return System.OpEquality(this.StartPosition, this.EndPosition);
  }
  get SelectedText() {
    return this.Length <= 0 ? "" : this.Document.GetText(this.Offset, this.Length);
  }
  ContainsOffset(offset) {
    return this.Offset <= offset && offset <= this.EndOffset;
  }
}
_StartPosition = new WeakMap();
_EndPosition = new WeakMap();
class SelectionManager {
  constructor(editor) {
    __publicField(this, "_textEditor");
    __publicField(this, "SelectionCollection");
    __publicField(this, "SelectFrom");
    __publicField(this, "SelectionStart", TextLocation.Empty.Clone());
    __publicField(this, "SelectionChanged", new System.Event());
    this._textEditor = editor;
    this.SelectionCollection = new System.List();
    this.SelectFrom = new SelectFrom();
    this.SelectionStart = TextLocation.Empty.Clone();
  }
  get HasSomethingSelected() {
    return this.SelectionCollection.length > 0;
  }
  get SelectionIsReadonly() {
    return false;
  }
  get SelectedText() {
    if (!this.HasSomethingSelected)
      return "";
    if (this.SelectionCollection.length == 1)
      return this.SelectionCollection[0].SelectedText;
    let res = "";
    for (const selection of this.SelectionCollection) {
      res += selection.SelectedText;
    }
    return res;
  }
  SetSelection(startPosition, endPosition) {
    if (this.SelectionCollection.length == 1 && System.OpEquality(this.SelectionCollection[0].StartPosition, startPosition) && System.OpEquality(this.SelectionCollection[0].EndPosition, endPosition))
      return;
    this.SelectionCollection.Clear();
    this.SelectionCollection.Add(new Selection(this._textEditor.Document, startPosition.Clone(), endPosition.Clone()));
    this.SelectionChanged.Invoke();
  }
  ClearSelection() {
    let mousePos = this._textEditor.PointerPos.Clone();
    this.SelectFrom.First = this.SelectFrom.Where;
    let newSelectionStart = this._textEditor.TextView.GetLogicalPosition(mousePos.X - this._textEditor.TextView.Bounds.Left, mousePos.Y - this._textEditor.TextView.Bounds.Top);
    if (this.SelectFrom.Where == WhereFrom.Gutter) {
      newSelectionStart.Column = 0;
    }
    if (newSelectionStart.Line >= this._textEditor.Document.TotalNumberOfLines) {
      newSelectionStart.Line = this._textEditor.Document.TotalNumberOfLines - 1;
      newSelectionStart.Column = this._textEditor.Document.GetLineSegment(this._textEditor.Document.TotalNumberOfLines - 1).Length;
    }
    this.SelectionStart = newSelectionStart.Clone();
    this.SelectionCollection.Clear();
    this.SelectionChanged.Invoke();
  }
  RemoveSelectedText() {
    if (this.SelectionIsReadonly) {
      this.ClearSelection();
      return;
    }
    let oneLine = true;
    for (const s of this.SelectionCollection) {
      if (oneLine) {
        let lineBegin = s.StartPosition.Line;
        if (lineBegin != s.EndPosition.Line)
          oneLine = false;
      }
      let offset = s.Offset;
      this._textEditor.Document.Remove(offset, s.Length);
    }
    this.ClearSelection();
  }
  ExtendSelection(oldPosition, newPosition) {
    if (System.OpEquality(oldPosition, newPosition))
      return;
    let min = TextLocation.Empty.Clone();
    let max = TextLocation.Empty.Clone();
    let oldnewX = newPosition.Column;
    let oldIsGreater = SelectionManager.GreaterEqPos(oldPosition.Clone(), newPosition.Clone());
    if (oldIsGreater) {
      min = newPosition.Clone();
      max = oldPosition.Clone();
    } else {
      min = oldPosition.Clone();
      max = newPosition.Clone();
    }
    if (System.OpEquality(min, max))
      return;
    if (!this.HasSomethingSelected) {
      this.SetSelection(min.Clone(), max.Clone());
      if (this.SelectFrom.Where == WhereFrom.None)
        this.SelectionStart = oldPosition.Clone();
      return;
    }
    let selection = this.SelectionCollection[0];
    if (this.SelectFrom.Where == WhereFrom.Gutter) {
      newPosition.Column = 0;
    }
    if (SelectionManager.GreaterEqPos(newPosition.Clone(), this.SelectionStart.Clone())) {
      selection.StartPosition = this.SelectionStart.Clone();
      if (this.SelectFrom.Where == WhereFrom.Gutter) {
        selection.EndPosition = new TextLocation(this._textEditor.Caret.Column, this._textEditor.Caret.Line);
      } else {
        newPosition.Column = oldnewX;
        selection.EndPosition = newPosition.Clone();
      }
    } else {
      if (this.SelectFrom.Where == WhereFrom.Gutter && this.SelectFrom.First == WhereFrom.Gutter) {
        selection.EndPosition = this.NextValidPosition(this.SelectionStart.Line);
      } else {
        selection.EndPosition = this.SelectionStart.Clone();
      }
      selection.StartPosition = newPosition.Clone();
    }
    this.SelectionChanged.Invoke();
  }
  NextValidPosition(line) {
    if (line < this._textEditor.Document.TotalNumberOfLines - 1)
      return new TextLocation(0, line + 1);
    return new TextLocation(this._textEditor.Document.GetLineSegment(this._textEditor.Document.TotalNumberOfLines - 1).Length + 1, line);
  }
  static GreaterEqPos(p1, p2) {
    return p1.Line > p2.Line || p1.Line == p2.Line && p1.Column >= p2.Column;
  }
}
var WhereFrom = /* @__PURE__ */ ((WhereFrom2) => {
  WhereFrom2[WhereFrom2["None"] = 0] = "None";
  WhereFrom2[WhereFrom2["Gutter"] = 1] = "Gutter";
  WhereFrom2[WhereFrom2["TextArea"] = 2] = "TextArea";
  return WhereFrom2;
})(WhereFrom || {});
class SelectFrom {
  constructor() {
    __publicField(this, "Where", 0);
    __publicField(this, "First", 0);
  }
}
class CutCommand {
  Execute(editor) {
    let selectedText = editor.SelectionManager.SelectedText;
    if (selectedText.length > 0) {
      PixUI.Clipboard.WriteText(selectedText);
      editor.Caret.Position = editor.SelectionManager.SelectionCollection[0].StartPosition.Clone();
      editor.SelectionManager.RemoveSelectedText();
    }
  }
}
class CopyCommand {
  Execute(editor) {
    let selectedText = editor.SelectionManager.SelectedText;
    if (selectedText.length > 0)
      PixUI.Clipboard.WriteText(selectedText);
  }
}
class PasteCommand {
  Execute(editor) {
    PasteCommand.ExecInternal(editor);
  }
  static async ExecInternal(editor) {
    let text = await PixUI.Clipboard.ReadText();
    if (System.IsNullOrEmpty(text))
      return;
    editor.Document.UndoStack.StartUndoGroup();
    if (editor.SelectionManager.HasSomethingSelected) {
      editor.Caret.Position = editor.SelectionManager.SelectionCollection[0].StartPosition.Clone();
      editor.SelectionManager.RemoveSelectedText();
    }
    editor.InsertOrReplaceString(text);
    editor.Document.UndoStack.EndUndoGroup();
  }
}
var FoldType = /* @__PURE__ */ ((FoldType2) => {
  FoldType2[FoldType2["Unspecified"] = 0] = "Unspecified";
  FoldType2[FoldType2["MemberBody"] = 1] = "MemberBody";
  FoldType2[FoldType2["Region"] = 2] = "Region";
  FoldType2[FoldType2["TypeBody"] = 3] = "TypeBody";
  return FoldType2;
})(FoldType || {});
class FoldMarker {
  constructor(document, startLine, startColumn, endLine, endColumn, foldType, foldText = null, isFolded = false) {
    __publicField(this, "_document");
    __publicField(this, "IsFolded", false);
    __publicField(this, "_foldType", 0);
    __privateAdd(this, _FoldText, "");
    __publicField(this, "_startLine", -1);
    __publicField(this, "_startColumn", 0);
    __publicField(this, "_endLine", -1);
    __publicField(this, "_endColumn", 0);
    __publicField(this, "_offset", 0);
    __publicField(this, "_length", 0);
    this._document = document;
    this.IsFolded = isFolded;
    this._foldType = foldType;
    this.FoldText = System.IsNullOrEmpty(foldText) ? "..." : foldText;
    startLine = Math.min(this._document.TotalNumberOfLines - 1, Math.max(startLine, 0));
    let startLineSegment = this._document.GetLineSegment(startLine);
    endLine = Math.min(document.TotalNumberOfLines - 1, Math.max(endLine, 0));
    let endLineSegment = this._document.GetLineSegment(endLine);
    this._offset = startLineSegment.Offset + Math.min(startColumn, startLineSegment.Length);
    this._length = endLineSegment.Offset + Math.min(endColumn, endLineSegment.Length) - this._offset;
  }
  get FoldText() {
    return __privateGet(this, _FoldText);
  }
  set FoldText(value) {
    __privateSet(this, _FoldText, value);
  }
  get Offset() {
    return this._offset;
  }
  set Offset(value) {
    this._offset = value;
    this._startLine = this._endLine = -1;
  }
  get Length() {
    return this._length;
  }
  set Length(value) {
    this._length = value;
    this._endLine = -1;
  }
  get StartLine() {
    if (this._startLine < 0)
      this.GetStartPointForOffset(this.Offset);
    return this._startLine;
  }
  get StartColumn() {
    if (this._startLine < 0)
      this.GetStartPointForOffset(this.Offset);
    return this._startColumn;
  }
  get EndLine() {
    if (this._endLine < 0)
      this.GetEndPointForOffset(this.Offset + this.Length);
    return this._endLine;
  }
  get EndColumn() {
    if (this._endLine < 0)
      this.GetEndPointForOffset(this.Offset + this.Length);
    return this._endColumn;
  }
  GetStartPointForOffset(offset) {
    if (offset > this._document.TextLength) {
      this._startLine = this._document.TotalNumberOfLines + 1;
      this._startColumn = 1;
    } else if (offset < 0) {
      this._startLine = this._startColumn = -1;
    } else {
      this._startLine = this._document.GetLineNumberForOffset(offset);
      this._startColumn = offset - this._document.GetLineSegment(this._startLine).Offset;
    }
  }
  GetEndPointForOffset(offset) {
    if (offset > this._document.TextLength) {
      this._endLine = this._document.TotalNumberOfLines + 1;
      this._endColumn = 1;
    } else if (offset < 0) {
      this._endLine = this._endColumn = -1;
    } else {
      this._endLine = this._document.GetLineNumberForOffset(offset);
      this._endColumn = offset - this._document.GetLineSegment(this._endLine).Offset;
    }
  }
  CompareTo(other) {
    return this.Offset != other.Offset ? this.Offset.CompareTo(other.Offset) : this.Length.CompareTo(other.Length);
  }
}
_FoldText = new WeakMap();
__publicField(FoldMarker, "$meta_System_IComparable", true);
class FoldingManager {
  constructor(document) {
    __publicField(this, "_document");
    __publicField(this, "_foldMarker", new System.List());
    __publicField(this, "_foldMarkerByEnd", new System.List());
    __publicField(this, "FoldingsChanged", new System.Event());
    this._document = document;
  }
  RaiseFoldingsChanged() {
    this.FoldingsChanged.Invoke();
  }
  IsLineVisible(lineNumber) {
    let contains = this.GetFoldingsContainsLineNumber(lineNumber);
    for (const fm of contains) {
      if (fm.IsFolded)
        return false;
    }
    return true;
  }
  GetTopLevelFoldedFoldings() {
    let foldings = new System.List();
    let end = new TextLocation(0, 0);
    for (const fm of this._foldMarker) {
      if (fm.IsFolded && (fm.StartLine > end.Line || fm.StartLine == end.Line && fm.StartColumn >= end.Column)) {
        foldings.Add(fm);
        end = new TextLocation(fm.EndColumn, fm.EndLine);
      }
    }
    return foldings;
  }
  GetFoldingsWithStart(lineNumber) {
    return this.GetFoldingsByStartAfterColumn(lineNumber, -1, false);
  }
  GetFoldingsContainsLineNumber(lineNumber) {
    let foldings = new System.List();
    for (const fm of this._foldMarker) {
      if (fm.StartLine < lineNumber && lineNumber < fm.EndLine)
        foldings.Add(fm);
    }
    return foldings;
  }
  GetFoldingsWithEnd(lineNumber) {
    return this.GetFoldingsByEndAfterColumn(lineNumber, 0, false);
  }
  GetFoldedFoldingsWithStartAfterColumn(lineNumber, column) {
    return this.GetFoldingsByStartAfterColumn(lineNumber, column, true);
  }
  GetFoldedFoldingsWithStart(lineNumber) {
    return this.GetFoldingsByStartAfterColumn(lineNumber, -1, true);
  }
  GetFoldedFoldingsWithEnd(lineNumber) {
    return this.GetFoldingsByEndAfterColumn(lineNumber, 0, true);
  }
  GetFoldingsByStartAfterColumn(lineNumber, column, forceFolded) {
    let foldings = new System.List();
    let pattern = new FoldMarker(this._document, lineNumber, column, lineNumber, column, FoldType.Unspecified, "", false);
    let index = this._foldMarker.BinarySearch(pattern, StartComparer.Instance);
    if (index < 0)
      index = ~index;
    for (; index < this._foldMarker.length; index++) {
      let fm = this._foldMarker[index];
      if (fm.StartLine < lineNumber || fm.StartLine > lineNumber)
        break;
      if (fm.StartColumn <= column)
        continue;
      if (!forceFolded || fm.IsFolded)
        foldings.Add(fm);
    }
    return foldings;
  }
  GetFoldingsByEndAfterColumn(lineNumber, column, forceFolded) {
    let foldings = new System.List();
    let pattern = new FoldMarker(this._document, lineNumber, column, lineNumber, column, FoldType.Unspecified, "", false);
    let index = this._foldMarkerByEnd.BinarySearch(pattern, EndComparer.Instance);
    if (index < 0)
      index = ~index;
    for (; index < this._foldMarkerByEnd.length; index++) {
      let fm = this._foldMarkerByEnd[index];
      if (fm.EndLine < lineNumber || fm.EndLine > lineNumber)
        break;
      if (fm.EndColumn <= column)
        continue;
      if (!forceFolded || fm.IsFolded)
        foldings.Add(fm);
    }
    return foldings;
  }
  UpdateFoldings(newFoldings) {
    if (newFoldings != null && newFoldings.length != 0) {
      newFoldings.Sort((a, b) => a.CompareTo(b));
      if (this._foldMarker.length == newFoldings.length) {
        for (let i = 0; i < this._foldMarker.length; ++i) {
          newFoldings[i].IsFolded = this._foldMarker[i].IsFolded;
        }
        this._foldMarker = newFoldings;
      } else {
        for (let i = 0, j = 0; i < this._foldMarker.length && j < newFoldings.length; ) {
          let n = newFoldings[j].CompareTo(this._foldMarker[i]);
          if (n > 0) {
            ++i;
          } else {
            if (n == 0) {
              newFoldings[j].IsFolded = this._foldMarker[i].IsFolded;
            }
            ++j;
          }
        }
      }
    }
    if (newFoldings != null) {
      this._foldMarker = newFoldings;
      this._foldMarkerByEnd = new System.List(newFoldings);
      this._foldMarkerByEnd.Sort((a, b) => EndComparer.Instance.Compare(a, b));
    } else {
      this._foldMarker.Clear();
      this._foldMarkerByEnd.Clear();
    }
    this.FoldingsChanged.Invoke();
  }
}
const _StartComparer = class {
  Compare(x, y) {
    if (x.StartLine < y.StartLine)
      return -1;
    return x.StartLine == y.StartLine ? x.StartColumn.CompareTo(y.StartColumn) : 1;
  }
};
let StartComparer = _StartComparer;
__publicField(StartComparer, "$meta_System_IComparer", true);
__publicField(StartComparer, "Instance", new _StartComparer());
const _EndComparer = class {
  Compare(x, y) {
    if (x.EndLine < y.EndLine)
      return -1;
    return x.EndLine == y.EndLine ? x.EndColumn.CompareTo(y.EndColumn) : 1;
  }
};
let EndComparer = _EndComparer;
__publicField(EndComparer, "$meta_System_IComparer", true);
__publicField(EndComparer, "Instance", new _EndComparer());
var TokenType = /* @__PURE__ */ ((TokenType2) => {
  TokenType2[TokenType2["Unknown"] = 0] = "Unknown";
  TokenType2[TokenType2["WhiteSpace"] = 1] = "WhiteSpace";
  TokenType2[TokenType2["Error"] = 2] = "Error";
  TokenType2[TokenType2["Module"] = 3] = "Module";
  TokenType2[TokenType2["Type"] = 4] = "Type";
  TokenType2[TokenType2["BuiltinType"] = 5] = "BuiltinType";
  TokenType2[TokenType2["LiteralNumber"] = 6] = "LiteralNumber";
  TokenType2[TokenType2["LiteralString"] = 7] = "LiteralString";
  TokenType2[TokenType2["Constant"] = 8] = "Constant";
  TokenType2[TokenType2["Keyword"] = 9] = "Keyword";
  TokenType2[TokenType2["Comment"] = 10] = "Comment";
  TokenType2[TokenType2["PunctuationDelimiter"] = 11] = "PunctuationDelimiter";
  TokenType2[TokenType2["PunctuationBracket"] = 12] = "PunctuationBracket";
  TokenType2[TokenType2["Operator"] = 13] = "Operator";
  TokenType2[TokenType2["Variable"] = 14] = "Variable";
  TokenType2[TokenType2["Function"] = 15] = "Function";
  return TokenType2;
})(TokenType || {});
class CodeToken {
  static Make(type, startColumn) {
    return (Math.floor(type) & 4294967295) << 24 | startColumn;
  }
  static GetTokenStartColumn(token) {
    return token & 16777215;
  }
  static GetTokenType(token) {
    return token >> 24;
  }
}
const _CSharpLanguage = class {
  constructor() {
    __publicField(this, "_foldQuery");
  }
  GetAutoColsingPairs(ch) {
    switch (ch) {
      case 123:
        return 125;
      case 91:
        return 93;
      case 40:
        return 41;
      case 34:
        return 34;
      default:
        return null;
    }
  }
  IsLeafNode(node) {
    let type = node.type;
    return type == "modifier" || type == "string_literal" || type == "character_literal";
  }
  GetTokenType(node) {
    let type = node.type;
    if (type == "Error")
      return TokenType.Unknown;
    if (!node.isNamed()) {
      let res;
      if (_CSharpLanguage.TokenMap.TryGetValue(type, new System.Out(() => res, ($v) => res = $v)))
        return res;
      return TokenType.Unknown;
    }
    switch (type) {
      case "identifier":
        return _CSharpLanguage.GetIdentifierTokenType(node);
      case "implicit_type":
      case "pointer_type":
      case "function_pointer_type":
      case "predefined_type":
        return TokenType.BuiltinType;
      case "real_literal":
      case "integer_literal":
        return TokenType.LiteralNumber;
      case "string_literal":
      case "character_literal":
        return TokenType.LiteralString;
      case "null_literal":
      case "boolean_literal":
        return TokenType.Constant;
      case "modifier":
      case "void_keyword":
        return TokenType.Keyword;
      case "comment":
        return TokenType.Comment;
      default:
        return TokenType.Unknown;
    }
  }
  static GetIdentifierTokenType(node) {
    let parentType = node.parent.type;
    if (parentType == "Error")
      return TokenType.Unknown;
    switch (parentType) {
      case "namespace_declaration":
      case "using_directive":
        return TokenType.Module;
      case "class_declaration":
      case "interface_declaration":
      case "enum_declaration":
      case "struct_declaration":
      case "record_declaration":
      case "object_creation_expression":
      case "constructor_declaration":
      case "generic_name":
      case "array_type":
      case "base_list":
        return TokenType.Type;
      case "argument":
      case "variable_declarator":
      case "property_declaration":
        return TokenType.Variable;
      case "method_declaration":
        return TokenType.Function;
      case "qualified_name":
        return _CSharpLanguage.GetIdentifierTypeFromQualifiedName(node);
      case "member_access_expression":
        return _CSharpLanguage.GetIdentifierTypeFromMemberAccess(node);
      default:
        return TokenType.Unknown;
    }
  }
  static GetIdentifierTypeFromQualifiedName(node) {
    var _a, _b;
    if (((_a = node.parent.parent) == null ? void 0 : _a.type) == "qualified_name")
      return TokenType.Module;
    if (((_b = node.parent.parent) == null ? void 0 : _b.type) == "assignment_expression")
      return TokenType.Variable;
    return node.nextNamedSibling == null ? TokenType.Type : TokenType.Module;
  }
  static GetIdentifierTypeFromMemberAccess(node) {
    if (node.parent.parent.type == "invocation_expression")
      return TokenType.Function;
    return node.nextNamedSibling == null ? TokenType.Variable : TokenType.Type;
  }
  GenerateFoldMarkers(document) {
    var _a;
    let syntaxParser = document.SyntaxParser;
    if (syntaxParser.RootNode == null)
      return null;
    (_a = this._foldQuery) != null ? _a : this._foldQuery = syntaxParser.CreateQuery(_CSharpLanguage.FoldQuery);
    let captures = this._foldQuery.captures(syntaxParser.RootNode);
    let lastNodeId = 0;
    let result = new System.List(captures.length);
    for (const capture of captures) {
      if (lastNodeId == capture.node.id)
        continue;
      lastNodeId = capture.node.id;
      let node = capture.node;
      if (node.startPosition.row == node.endPosition.row)
        continue;
      let startIndex = node.startIndex / SyntaxParser.ParserEncoding;
      let endIndex = node.endIndex / SyntaxParser.ParserEncoding;
      let mark = new FoldMarker(document, 0, 0, 0, 0, FoldType.TypeBody, "{...}");
      mark.Offset = startIndex;
      mark.Length = endIndex - startIndex;
      result.Add(mark);
    }
    return result;
  }
};
let CSharpLanguage = _CSharpLanguage;
__publicField(CSharpLanguage, "TokenMap", new System.Dictionary().Init([
  [";", TokenType.PunctuationDelimiter],
  [".", TokenType.PunctuationDelimiter],
  [",", TokenType.PunctuationDelimiter],
  ["--", TokenType.Operator],
  ["-", TokenType.Operator],
  ["-=", TokenType.Operator],
  ["&", TokenType.Operator],
  ["&&", TokenType.Operator],
  ["+", TokenType.Operator],
  ["++", TokenType.Operator],
  ["+=", TokenType.Operator],
  ["<", TokenType.Operator],
  ["<<", TokenType.Operator],
  ["=", TokenType.Operator],
  ["==", TokenType.Operator],
  ["!", TokenType.Operator],
  ["!=", TokenType.Operator],
  ["=>", TokenType.Operator],
  [">", TokenType.Operator],
  [">>", TokenType.Operator],
  ["|", TokenType.Operator],
  ["||", TokenType.Operator],
  ["?", TokenType.Operator],
  ["??", TokenType.Operator],
  ["^", TokenType.Operator],
  ["~", TokenType.Operator],
  ["*", TokenType.Operator],
  ["/", TokenType.Operator],
  ["%", TokenType.Operator],
  [":", TokenType.Operator],
  ["(", TokenType.PunctuationBracket],
  [")", TokenType.PunctuationBracket],
  ["[", TokenType.PunctuationBracket],
  ["]", TokenType.PunctuationBracket],
  ["{", TokenType.PunctuationBracket],
  ["}", TokenType.PunctuationBracket],
  ["as", TokenType.Keyword],
  ["base", TokenType.Keyword],
  ["break", TokenType.Keyword],
  ["case", TokenType.Keyword],
  ["catch", TokenType.Keyword],
  ["checked", TokenType.Keyword],
  ["class", TokenType.Keyword],
  ["continue", TokenType.Keyword],
  ["default", TokenType.Keyword],
  ["delegate", TokenType.Keyword],
  ["do", TokenType.Keyword],
  ["else", TokenType.Keyword],
  ["enum", TokenType.Keyword],
  ["event", TokenType.Keyword],
  ["explicit", TokenType.Keyword],
  ["finally", TokenType.Keyword],
  ["for", TokenType.Keyword],
  ["foreach", TokenType.Keyword],
  ["goto", TokenType.Keyword],
  ["if", TokenType.Keyword],
  ["implicit", TokenType.Keyword],
  ["interface", TokenType.Keyword],
  ["is", TokenType.Keyword],
  ["lock", TokenType.Keyword],
  ["namespace", TokenType.Keyword],
  ["operator", TokenType.Keyword],
  ["params", TokenType.Keyword],
  ["return", TokenType.Keyword],
  ["sizeof", TokenType.Keyword],
  ["stackalloc", TokenType.Keyword],
  ["struct", TokenType.Keyword],
  ["switch", TokenType.Keyword],
  ["throw", TokenType.Keyword],
  ["try", TokenType.Keyword],
  ["typeof", TokenType.Keyword],
  ["unchecked", TokenType.Keyword],
  ["using", TokenType.Keyword],
  ["while", TokenType.Keyword],
  ["new", TokenType.Keyword],
  ["await", TokenType.Keyword],
  ["in", TokenType.Keyword],
  ["yield", TokenType.Keyword],
  ["get", TokenType.Keyword],
  ["set", TokenType.Keyword],
  ["when", TokenType.Keyword],
  ["out", TokenType.Keyword],
  ["ref", TokenType.Keyword],
  ["from", TokenType.Keyword],
  ["where", TokenType.Keyword],
  ["select", TokenType.Keyword],
  ["record", TokenType.Keyword],
  ["init", TokenType.Keyword],
  ["with", TokenType.Keyword],
  ["let", TokenType.Keyword],
  ["var", TokenType.Keyword],
  ["this", TokenType.Keyword]
]));
__publicField(CSharpLanguage, "FoldQuery", `
body: [
  (declaration_list)
  (switch_body)
  (enum_member_declaration_list)
] @fold

accessors: [
  (accessor_list)
] @fold

initializer: [
  (initializer_expression)
] @fold

(block) @fold
`);
const _SyntaxParser = class {
  constructor(document) {
    __publicField(this, "_document");
    __publicField(this, "_parser");
    __privateAdd(this, _Language, void 0);
    __publicField(this, "_oldTree");
    __publicField(this, "_edit", new TSEdit());
    __publicField(this, "_startLineOfChanged", 0);
    __publicField(this, "_endLineOfChanged", 0);
    this._document = document;
    let language = TSCSharpLanguage.Get();
    this._parser = new window.TreeSitter();
    this._parser.setLanguage(language);
    this.Language = new CSharpLanguage();
  }
  get Language() {
    return __privateGet(this, _Language);
  }
  set Language(value) {
    __privateSet(this, _Language, value);
  }
  get RootNode() {
    var _a;
    return (_a = this._oldTree) == null ? void 0 : _a.rootNode;
  }
  BeginInsert(offset, length) {
    let startLocation = this._document.OffsetToPosition(offset);
    this._edit.startIndex = (Math.floor(offset) & 4294967295) * _SyntaxParser.ParserEncoding;
    this._edit.oldEndIndex = this._edit.startIndex;
    this._edit.newEndIndex = this._edit.startIndex + (Math.floor(length) & 4294967295) * _SyntaxParser.ParserEncoding;
    this._edit.startPosition = TSPoint.FromLocation(startLocation.Clone());
    this._edit.oldEndPosition = this._edit.startPosition;
  }
  EndInsert(offset, length) {
    let endLocation = this._document.OffsetToPosition(offset + length);
    this._edit.newEndPosition = TSPoint.FromLocation(endLocation.Clone());
    this._oldTree.edit(this._edit.Clone());
    this.Parse(false);
    this.Tokenize(this._startLineOfChanged, this._endLineOfChanged);
  }
  BeginRemove(offset, length) {
    let startLocation = this._document.OffsetToPosition(offset);
    let endLocation = this._document.OffsetToPosition(offset + length);
    this._edit.startIndex = (Math.floor(offset) & 4294967295) * _SyntaxParser.ParserEncoding;
    this._edit.oldEndIndex = this._edit.startIndex + (Math.floor(length) & 4294967295) * _SyntaxParser.ParserEncoding;
    this._edit.newEndIndex = this._edit.startIndex;
    this._edit.startPosition = TSPoint.FromLocation(startLocation.Clone());
    this._edit.oldEndPosition = TSPoint.FromLocation(endLocation.Clone());
    this._edit.newEndPosition = this._edit.startPosition;
  }
  EndRemove() {
    this._oldTree.edit(this._edit.Clone());
    this.Parse(false);
    this.Tokenize(this._startLineOfChanged, this._endLineOfChanged);
  }
  BeginReplace(offset, length, textLenght) {
    let startLocation = this._document.OffsetToPosition(offset);
    let endLocation = this._document.OffsetToPosition(offset + length);
    this._edit.startIndex = (Math.floor(offset) & 4294967295) * _SyntaxParser.ParserEncoding;
    this._edit.oldEndIndex = this._edit.startIndex + (Math.floor(length) & 4294967295) * _SyntaxParser.ParserEncoding;
    this._edit.newEndIndex = this._edit.startIndex + (Math.floor((textLenght - length) * _SyntaxParser.ParserEncoding) & 4294967295);
    this._edit.startPosition = TSPoint.FromLocation(startLocation.Clone());
    this._edit.oldEndPosition = TSPoint.FromLocation(endLocation.Clone());
  }
  EndReplace(offset, length, textLength) {
    let endLocation = this._document.OffsetToPosition(offset + (textLength - length));
    this._edit.newEndPosition = TSPoint.FromLocation(endLocation.Clone());
    this._oldTree.edit(this._edit.Clone());
    this.Parse(false);
    this.Tokenize(this._startLineOfChanged, this._endLineOfChanged);
  }
  Parse(reset) {
    let input = new ParserInput(this._document.TextBuffer);
    let newTree = this._parser.parse(input.Read.bind(input), reset === true ? null : this._oldTree);
    if (this._oldTree && !reset) {
      let changes = newTree.getChangedRanges(this._oldTree);
      this._oldTree.delete();
      this._startLineOfChanged = this._edit.startPosition.row;
      this._endLineOfChanged = this._startLineOfChanged + 1;
      for (const range of changes) {
        this._startLineOfChanged = Math.min(this._startLineOfChanged, range.startPosition.row);
        this._endLineOfChanged = Math.max(this._endLineOfChanged, range.endPosition.row);
      }
    }
    this._oldTree = newTree;
    let foldMarkers = this.Language.GenerateFoldMarkers(this._document);
    this._document.FoldingManager.UpdateFoldings(foldMarkers);
  }
  Tokenize(startLine, endLine) {
    for (let i = startLine; i < endLine; i++) {
      this.TokenizeLine(i);
    }
  }
  TokenizeLine(line) {
    let lineSegment = this._document.GetLineSegment(line);
    let lineLength = lineSegment.Length;
    if (lineLength == 0)
      return;
    let lineStartPoint = new TSPoint(line, 0);
    let lineEndPoint = new TSPoint(line, lineLength * _SyntaxParser.ParserEncoding);
    let lineNode = this._oldTree.rootNode.namedDescendantForPosition(lineStartPoint, lineEndPoint);
    lineSegment.BeginTokenize();
    if (_SyntaxParser.ContainsFullLine(lineNode, lineSegment)) {
      this.VisitNode(lineNode, lineSegment);
    } else {
      lineSegment.AddToken(TokenType.Unknown, lineSegment.Offset, lineSegment.Length);
    }
    lineSegment.EndTokenize();
  }
  VisitChildren(node, lineSegment) {
    for (const child of node.children) {
      if (_SyntaxParser.BeforeLine(child, lineSegment))
        continue;
      if (_SyntaxParser.AfterLine(child, lineSegment))
        break;
      this.VisitNode(child, lineSegment);
    }
  }
  VisitNode(node, lineSegment) {
    let childrenCount = node.childCount;
    if (!this.Language.IsLeafNode(node) && childrenCount > 0) {
      this.VisitChildren(node, lineSegment);
      return;
    }
    if (node.endIndex <= node.startIndex)
      return;
    let tokenType = this.Language.GetTokenType(node);
    let startOffset = Math.max(node.startIndex / _SyntaxParser.ParserEncoding, lineSegment.Offset);
    let length = Math.min((node.endIndex - node.startIndex) / _SyntaxParser.ParserEncoding, lineSegment.Length);
    lineSegment.AddToken(tokenType, startOffset, length);
  }
  static ContainsFullLine(node, lineSegment) {
    let nodeStartOffset = node.startIndex / _SyntaxParser.ParserEncoding;
    let nodeEndOffset = node.endIndex / _SyntaxParser.ParserEncoding;
    return nodeStartOffset <= lineSegment.Offset && lineSegment.Offset + lineSegment.Length <= nodeEndOffset;
  }
  static BeforeLine(node, lineSegment) {
    let nodeEndOffset = node.endIndex / _SyntaxParser.ParserEncoding;
    return nodeEndOffset < lineSegment.Offset;
  }
  static AfterLine(node, lineSegment) {
    let nodeStartOffset = node.startIndex / _SyntaxParser.ParserEncoding;
    return nodeStartOffset > lineSegment.Offset + lineSegment.Length;
  }
  CreateQuery(scm) {
    return this._parser.getLanguage().query(scm);
  }
  GetDirtyLines(controller) {
    return new DirtyLines(controller).Init({
      StartLine: this._startLineOfChanged,
      EndLine: this._endLineOfChanged
    });
  }
  DumpTree() {
    if (this._oldTree == null)
      console.log("No parsed tree.");
    console.log(this._oldTree.rootNode);
  }
  Dispose() {
    var _a;
    (_a = this._oldTree) == null ? void 0 : _a.delete();
    this._parser.delete();
  }
};
let SyntaxParser = _SyntaxParser;
_Language = new WeakMap();
__publicField(SyntaxParser, "$meta_System_IDisposable", true);
__publicField(SyntaxParser, "ParserEncoding", 1);
class DeferredEventList {
  constructor() {
    __publicField(this, "removedLines");
    __publicField(this, "textAnchor");
  }
  AddRemovedLine(line) {
    var _a;
    (_a = this.removedLines) != null ? _a : this.removedLines = new System.List();
    this.removedLines.Add(line);
  }
  AddDeletedAnchor(anchor) {
    var _a;
    (_a = this.textAnchor) != null ? _a : this.textAnchor = new System.List();
    this.textAnchor.Add(anchor);
  }
  RaiseEvents() {
    if (this.textAnchor == null)
      return;
    for (const a of this.textAnchor) {
      a.RaiseDeleted();
    }
  }
}
class LineSegment {
  constructor() {
    __publicField(this, "TreeEntry", LinesEnumerator.Invalid.Clone());
    __privateAdd(this, _TotalLength, 0);
    __privateAdd(this, _DelimiterLength, 0);
    __publicField(this, "_lineTokens");
    __publicField(this, "_tokenColumnIndex", 0);
    __publicField(this, "_cachedParagraph");
    __privateAdd(this, _CachedFolds, void 0);
  }
  get IsDeleted() {
    return !this.TreeEntry.IsValid;
  }
  get LineNumber() {
    return this.TreeEntry.CurrentIndex;
  }
  get Offset() {
    return this.TreeEntry.CurrentOffset;
  }
  set Offset(value) {
    throw new System.NotSupportedException();
  }
  get Length() {
    return this.TotalLength - this.DelimiterLength;
  }
  set Length(value) {
    throw new System.NotSupportedException();
  }
  get TotalLength() {
    return __privateGet(this, _TotalLength);
  }
  set TotalLength(value) {
    __privateSet(this, _TotalLength, value);
  }
  get DelimiterLength() {
    return __privateGet(this, _DelimiterLength);
  }
  set DelimiterLength(value) {
    __privateSet(this, _DelimiterLength, value);
  }
  get CachedFolds() {
    return __privateGet(this, _CachedFolds);
  }
  set CachedFolds(value) {
    __privateSet(this, _CachedFolds, value);
  }
  InsertedLinePart(manager, startColumn, length) {
    if (length == 0)
      return;
    this.ClearFoldedLineCache(manager);
  }
  RemovedLinePart(manager, deferredEventList, startColumn, length) {
    if (length == 0)
      return;
    this.ClearFoldedLineCache(manager);
  }
  Deleted(deferredEventList) {
    this.TreeEntry = LinesEnumerator.Invalid.Clone();
  }
  MergedWith(deletedLine, firstLineLength) {
  }
  SplitTo(followingLine) {
  }
  BeginTokenize() {
    this.ClearCachedParagraph();
    this._lineTokens = new System.List();
    this._tokenColumnIndex = 0;
  }
  AddToken(type, offset, length) {
    let column = offset - this.Offset;
    if (column > this._tokenColumnIndex) {
      this._lineTokens.Add(CodeToken.Make(TokenType.WhiteSpace, this._tokenColumnIndex));
      this._tokenColumnIndex = column;
    }
    this._lineTokens.Add(CodeToken.Make(type, column));
    this._tokenColumnIndex += length;
  }
  EndTokenize() {
    if (this._tokenColumnIndex < this.Length) {
      this._lineTokens.Add(CodeToken.Make(TokenType.WhiteSpace, this._tokenColumnIndex));
    }
  }
  GetTokenAt(column) {
    if (this._lineTokens == null)
      return null;
    let tokenEndColumn = this.Length;
    for (let i = this._lineTokens.length - 1; i >= 0; i--) {
      let token = this._lineTokens[i];
      let tokenStartColumn = CodeToken.GetTokenStartColumn(token);
      if (tokenStartColumn < column && column <= tokenEndColumn) {
        return token;
      }
      tokenEndColumn = tokenStartColumn;
    }
    return null;
  }
  GetLeadingWhiteSpaces() {
    if (this._lineTokens == null)
      return 0;
    let firstTokenType = CodeToken.GetTokenType(this._lineTokens[0]);
    if (firstTokenType != TokenType.WhiteSpace)
      return 0;
    return this._lineTokens.length > 1 ? CodeToken.GetTokenStartColumn(this._lineTokens[1]) : this.Length;
  }
  GetLineParagraph(editor) {
    if (this._cachedParagraph != null)
      return this._cachedParagraph;
    let ps = PixUI.MakeParagraphStyle({ maxLines: 1, heightMultiplier: 1 });
    let pb = PixUI.MakeParagraphBuilder(ps);
    if (this._lineTokens == null || this.Length == 0) {
      let lineText = editor.Document.GetText(this.Offset, this.Length);
      pb.pushStyle(editor.Theme.TextStyle);
      pb.addText(lineText);
    } else {
      if (editor.Document.TextEditorOptions.EnableFolding)
        this.BuildParagraphByFoldings(pb, editor);
      else
        this.BuildParagraphByTokens(pb, editor, 0, this.Length);
    }
    this._cachedParagraph = pb.build();
    this._cachedParagraph.layout(Number.POSITIVE_INFINITY);
    pb.delete();
    return this._cachedParagraph;
  }
  BuildParagraphByTokens(pb, editor, startIndex, endIndex) {
    let token = 0;
    let tokenStartColumn = 0;
    let tokenEndColumn = 0;
    let tokenOffset = 0;
    for (let i = 0; i < this._lineTokens.length; i++) {
      token = this._lineTokens[i];
      tokenStartColumn = CodeToken.GetTokenStartColumn(token);
      tokenEndColumn = i == this._lineTokens.length - 1 ? this.Length : CodeToken.GetTokenStartColumn(this._lineTokens[i + 1]);
      if (startIndex >= tokenEndColumn)
        continue;
      tokenOffset = editor.Document.PositionToOffset(new TextLocation(tokenStartColumn, this.LineNumber));
      let tokenText = editor.Document.GetText(tokenOffset, tokenEndColumn - tokenStartColumn);
      pb.pushStyle(editor.Theme.GetTokenStyle(CodeToken.GetTokenType(token)));
      pb.addText(tokenText);
      pb.pop();
      if (tokenEndColumn >= endIndex)
        break;
    }
  }
  BuildParagraphByFoldings(pb, editor) {
    var _a;
    let line = this.LineNumber;
    let column = -1;
    let lineChars = 0;
    let preFold = null;
    while (true) {
      let starts = editor.Document.FoldingManager.GetFoldedFoldingsWithStartAfterColumn(line, column);
      if (starts.length <= 0) {
        if (line == this.LineNumber) {
          this.BuildParagraphByTokens(pb, editor, 0, TextLocation.MaxColumn);
        } else {
          let endLine = editor.Document.GetLineSegment(preFold.EndLine);
          endLine.BuildParagraphByTokens(pb, editor, preFold.EndColumn, TextLocation.MaxColumn);
        }
        break;
      }
      let firstFolding = starts[0];
      for (const fm of starts) {
        if (fm.StartColumn < firstFolding.StartColumn)
          firstFolding = fm;
      }
      starts.Clear();
      if (line == this.LineNumber) {
        if (firstFolding.StartColumn > 0) {
          this.BuildParagraphByTokens(pb, editor, 0, firstFolding.StartColumn);
          lineChars += firstFolding.StartColumn;
        }
      } else {
        let endLine = editor.Document.GetLineSegment(preFold.EndLine);
        endLine.BuildParagraphByTokens(pb, editor, preFold.EndColumn, firstFolding.StartColumn);
        lineChars += firstFolding.StartColumn - preFold.EndColumn;
      }
      pb.pushStyle(editor.Theme.FoldedTextStyle);
      pb.addText(firstFolding.FoldText);
      pb.pop();
      (_a = this.CachedFolds) != null ? _a : this.CachedFolds = new System.List();
      this.CachedFolds.Add(new CachedFoldInfo(lineChars, firstFolding));
      lineChars += firstFolding.FoldText.length;
      column = firstFolding.EndColumn;
      line = firstFolding.EndLine;
      preFold = firstFolding;
      if (line >= editor.Document.TotalNumberOfLines) {
        break;
      }
    }
  }
  GetXPos(editor, line, column) {
    let para = this.GetLineParagraph(editor);
    if (line == this.LineNumber) {
      if (column == 0)
        return 0;
      let columnStart = column - 1;
      if (column > 1 && TextUtils.IsMultiCodeUnit(editor.Document.GetCharAt(this.Offset + column - 2))) {
        columnStart -= 1;
      }
      let box1 = PixUI.GetRectForPosition(para, columnStart, CanvasKit.RectHeightStyle.Tight, CanvasKit.RectWidthStyle.Tight);
      return box1.Rect.Right;
    }
    let offsetInLine = -1;
    for (const fold of this.CachedFolds) {
      if (line == fold.FoldMarker.EndLine) {
        offsetInLine = fold.LineEnd + column - fold.FoldMarker.EndColumn;
        break;
      }
    }
    let box2 = PixUI.GetRectForPosition(para, offsetInLine - 1, CanvasKit.RectHeightStyle.Tight, CanvasKit.RectWidthStyle.Tight);
    return box2.Rect.Right;
  }
  ClearCachedParagraph() {
    var _a;
    (_a = this._cachedParagraph) == null ? void 0 : _a.delete();
    this._cachedParagraph = null;
    this.CachedFolds = null;
  }
  ClearFoldedLineCache(manager) {
    let thisLine = this.LineNumber;
    let visibleLine = manager.GetVisibleLine(thisLine);
    let logicalLine = manager.GetFirstLogicalLine(visibleLine);
    if (logicalLine != thisLine) {
      manager.GetLineSegment(logicalLine).ClearCachedParagraph();
    }
  }
  toString() {
    if (this.IsDeleted)
      return "[LineSegment: (deleted) Length = " + this.Length + ", TotalLength = " + this.TotalLength + ", DelimiterLength = " + this.DelimiterLength + "]";
    return "[LineSegment: LineNumber=" + this.LineNumber + ", Offset = " + this.Offset + ", Length = " + this.Length + ", TotalLength = " + this.TotalLength + ", DelimiterLength = " + this.DelimiterLength + "]";
  }
}
_TotalLength = new WeakMap();
_DelimiterLength = new WeakMap();
_CachedFolds = new WeakMap();
class CachedFoldInfo {
  constructor(lineStart, foldMarker) {
    __publicField(this, "LineStart");
    __publicField(this, "FoldMarker");
    this.LineStart = lineStart;
    this.FoldMarker = foldMarker;
  }
  get LineEnd() {
    return this.LineStart + this.FoldMarker.FoldText.length;
  }
}
class RBNode {
  constructor(lineSegment) {
    __publicField(this, "LineSegment");
    __publicField(this, "Count", 0);
    __publicField(this, "TotalLength", 0);
    this.LineSegment = lineSegment;
    this.Count = 1;
    this.TotalLength = lineSegment.TotalLength;
  }
  toString() {
    return "[RBNode count=" + this.Count + " totalLength=" + this.TotalLength + " lineSegment.LineNumber=" + this.LineSegment.LineNumber + " lineSegment.Offset=" + this.LineSegment.Offset + " lineSegment.TotalLength=" + this.LineSegment.TotalLength + " lineSegment.DelimiterLength=" + this.LineSegment.DelimiterLength + "]";
  }
}
class RBHost {
  Compare(x, y) {
    throw new System.NotImplementedException();
  }
  Equals(a, b) {
    throw new System.NotImplementedException();
  }
  UpdateAfterChildrenChange(node) {
    let count = 1;
    let totalLength = node.Value.LineSegment.TotalLength;
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
      if (node.Parent != null)
        this.UpdateAfterChildrenChange(node.Parent);
    }
  }
  UpdateAfterRotateLeft(node) {
    this.UpdateAfterChildrenChange(node);
    this.UpdateAfterChildrenChange(node.Parent);
  }
  UpdateAfterRotateRight(node) {
    this.UpdateAfterChildrenChange(node);
    this.UpdateAfterChildrenChange(node.Parent);
  }
}
const _LinesEnumerator = class {
  constructor(it) {
    __publicField(this, "Iterator");
    this.Iterator = it.Clone();
  }
  Clone() {
    return new _LinesEnumerator(this.Iterator.Clone());
  }
  get Current() {
    return this.Iterator.Current.LineSegment;
  }
  get IsValid() {
    return this.Iterator.IsValid;
  }
  get CurrentIndex() {
    if (this.Iterator.Node == null)
      throw new System.InvalidOperationException();
    return _LinesEnumerator.GetIndexFromNode(this.Iterator.Node);
  }
  get CurrentOffset() {
    if (this.Iterator.Node == null)
      throw new System.InvalidOperationException();
    return _LinesEnumerator.GetOffsetFromNode(this.Iterator.Node);
  }
  MoveNext() {
    return this.Iterator.MoveNext();
  }
  MoveBack() {
    return this.Iterator.MoveBack();
  }
  static GetIndexFromNode(node) {
    let index = node.Left != null ? node.Left.Value.Count : 0;
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
  static GetOffsetFromNode(node) {
    let offset = node.Left != null ? node.Left.Value.TotalLength : 0;
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
};
let LinesEnumerator = _LinesEnumerator;
__publicField(LinesEnumerator, "Invalid", new _LinesEnumerator(new RedBlackTreeIterator(null)));
class LineSegmentTree {
  constructor() {
    __publicField(this, "_tree", new RedBlackTree(new RBHost()));
    this.Clear();
  }
  GetNode(index) {
    if (index < 0 || index >= this._tree.Count)
      throw new System.ArgumentOutOfRangeException("index", "index should be between 0 and " + (this._tree.Count - 1));
    let node = this._tree.Root;
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
  GetNodeByOffset(offset) {
    if (offset < 0 || offset > this.TotalLength)
      throw new System.ArgumentOutOfRangeException("offset", "offset should be between 0 and " + this.TotalLength);
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
  GetByOffset(offset) {
    return this.GetNodeByOffset(offset).Value.LineSegment;
  }
  get TotalLength() {
    return this._tree.Root == null ? 0 : this._tree.Root.Value.TotalLength;
  }
  SetSegmentLength(segment, newTotalLength) {
    if (segment == null)
      throw new System.ArgumentNullException("segment");
    let node = segment.TreeEntry.Iterator.Node;
    segment.TotalLength = newTotalLength;
    new RBHost().UpdateAfterChildrenChange(node);
  }
  RemoveSegment(segment) {
    this._tree.RemoveAt(segment.TreeEntry.Iterator.Clone());
  }
  InsertSegmentAfter(segment, length) {
    let newSegment = new LineSegment();
    newSegment.TotalLength = length;
    newSegment.DelimiterLength = segment.DelimiterLength;
    newSegment.TreeEntry = this.InsertAfter(segment.TreeEntry.Iterator.Node, newSegment);
    return newSegment;
  }
  InsertAfter(node, newSegment) {
    let newNode = new RedBlackTreeNode(new RBNode(newSegment));
    if (node.Right == null) {
      this._tree.InsertAsRight(node, newNode);
    } else {
      this._tree.InsertAsLeft(node.Right.LeftMost, newNode);
    }
    return new LinesEnumerator(new RedBlackTreeIterator(newNode));
  }
  get Count() {
    return this._tree.Count;
  }
  GetAt(index) {
    return this.GetNode(index).Value.LineSegment;
  }
  IndexOf(item) {
    let index = item.LineNumber;
    if (index < 0 || index >= this.Count)
      return -1;
    if (item != this.GetAt(index))
      return -1;
    return index;
  }
  Clear() {
    this._tree.Clear();
    let emptySegment = new LineSegment();
    emptySegment.TotalLength = 0;
    emptySegment.DelimiterLength = 0;
    this._tree.Add(new RBNode(emptySegment));
    emptySegment.TreeEntry = this.GetEnumeratorForIndex(0);
  }
  Contains(item) {
    return this.IndexOf(item) >= 0;
  }
  GetEnumeratorForIndex(index) {
    return new LinesEnumerator(new RedBlackTreeIterator(this.GetNode(index)));
  }
  GetEnumeratorForOffset(offset) {
    return new LinesEnumerator(new RedBlackTreeIterator(this.GetNodeByOffset(offset)));
  }
}
class LineCountChangeEventArgs {
  constructor(document, start, moved) {
    __publicField(this, "Document");
    __publicField(this, "Start");
    __publicField(this, "Moved");
    this.Document = document;
    this.Start = start;
    this.Moved = moved;
  }
}
class LineEventArgs {
  constructor(document, lineSegment) {
    __publicField(this, "Document");
    __publicField(this, "LineSegment");
    this.Document = document;
    this.LineSegment = lineSegment;
  }
}
class LineLengthChangeEventArgs {
  constructor(document, lineSegment, lengthDelta) {
    __publicField(this, "Document");
    __publicField(this, "LineSegment");
    __publicField(this, "LengthDelta");
    this.Document = document;
    this.LineSegment = lineSegment;
    this.LengthDelta = lengthDelta;
  }
}
class LineManager {
  constructor(document) {
    __publicField(this, "_document");
    __publicField(this, "_lineCollection");
    __publicField(this, "LineLengthChanged", new System.Event());
    __publicField(this, "LineCountChanged", new System.Event());
    __publicField(this, "LineDeleted", new System.Event());
    this._document = document;
    this._lineCollection = new LineSegmentTree();
  }
  get TotalNumberOfLines() {
    return this._lineCollection.Count;
  }
  GetLineNumberForOffset(offset) {
    return this.GetLineSegmentForOffset(offset).LineNumber;
  }
  GetLineSegmentForOffset(offset) {
    return this._lineCollection.GetByOffset(offset);
  }
  GetLineSegment(lineNumber) {
    return this._lineCollection.GetNode(lineNumber).Value.LineSegment;
  }
  GetFirstLogicalLine(visibleLineNumber) {
    if (!this._document.TextEditorOptions.EnableFolding)
      return visibleLineNumber;
    let v = 0;
    let foldEnd = 0;
    let foldings = this._document.FoldingManager.GetTopLevelFoldedFoldings();
    for (const fm of foldings) {
      if (fm.StartLine >= foldEnd) {
        if (v + fm.StartLine - foldEnd >= visibleLineNumber)
          break;
        v += fm.StartLine - foldEnd;
        foldEnd = fm.EndLine;
      }
    }
    foldings.Clear();
    return foldEnd + visibleLineNumber - v;
  }
  GetVisibleLine(logicalLineNumber) {
    if (!this._document.TextEditorOptions.EnableFolding)
      return logicalLineNumber;
    let visibleLine = 0;
    let foldEnd = 0;
    let foldings = this._document.FoldingManager.GetTopLevelFoldedFoldings();
    for (const fm of foldings) {
      if (fm.StartLine >= logicalLineNumber)
        break;
      if (fm.StartLine >= foldEnd) {
        visibleLine += fm.StartLine - foldEnd;
        if (fm.EndLine > logicalLineNumber)
          return visibleLine;
        foldEnd = fm.EndLine;
      }
    }
    foldings.Clear();
    visibleLine += logicalLineNumber - foldEnd;
    return visibleLine;
  }
  SetContent(text) {
    this._lineCollection.Clear();
    if (!System.IsNullOrEmpty(text)) {
      this.Replace(0, 0, text);
    }
  }
  Insert(offset, text) {
    this.Replace(offset, 0, text);
  }
  Remove(offset, length) {
    this.Replace(offset, length, "");
  }
  Replace(offset, length, text) {
    let lineStart = this.GetLineNumberForOffset(offset);
    let oldNumberOfLines = this.TotalNumberOfLines;
    let deferredEventList = new DeferredEventList();
    this.RemoveInternal(deferredEventList, offset, length);
    if (!System.IsNullOrEmpty(text)) {
      this.InsertInternal(offset, text);
    }
    if (this.TotalNumberOfLines != oldNumberOfLines) {
      this.LineCountChanged.Invoke(new LineCountChangeEventArgs(this._document, lineStart, this.TotalNumberOfLines - oldNumberOfLines));
    }
  }
  InsertInternal(offset, text) {
    let segment = this._lineCollection.GetByOffset(offset);
    let ds = LineManager.NextDelimiter(text, 0);
    if (ds == null) {
      segment.InsertedLinePart(this, offset - segment.Offset, text.length);
      this.SetSegmentLength(segment, segment.TotalLength + text.length);
      return;
    }
    let firstLine = segment;
    firstLine.InsertedLinePart(this, offset - firstLine.Offset, ds.Offset);
    let lastDelimiterEnd = 0;
    while (ds != null) {
      let lineBreakOffset = offset + ds.Offset + ds.Length;
      let segmentOffset = segment.Offset;
      let lengthAfterInsertionPos = segmentOffset + segment.TotalLength - (offset + lastDelimiterEnd);
      this._lineCollection.SetSegmentLength(segment, lineBreakOffset - segmentOffset);
      let newSegment = this._lineCollection.InsertSegmentAfter(segment, lengthAfterInsertionPos);
      segment.DelimiterLength = ds.Length;
      segment = newSegment;
      lastDelimiterEnd = ds.Offset + ds.Length;
      ds = LineManager.NextDelimiter(text, lastDelimiterEnd);
    }
    firstLine.SplitTo(segment);
    if (lastDelimiterEnd != text.length) {
      segment.InsertedLinePart(this, 0, text.length - lastDelimiterEnd);
      this.SetSegmentLength(segment, segment.TotalLength + text.length - lastDelimiterEnd);
    }
  }
  RemoveInternal(deferredEventList, offset, length) {
    if (length == 0)
      return;
    let it = this._lineCollection.GetEnumeratorForOffset(offset);
    let startSegment = it.Current;
    let startSegmentOffset = startSegment.Offset;
    if (offset + length < startSegmentOffset + startSegment.TotalLength) {
      startSegment.RemovedLinePart(this, deferredEventList, offset - startSegmentOffset, length);
      this.SetSegmentLength(startSegment, startSegment.TotalLength - length);
      return;
    }
    let charactersRemovedInStartLine = startSegmentOffset + startSegment.TotalLength - offset;
    startSegment.RemovedLinePart(this, deferredEventList, offset - startSegmentOffset, charactersRemovedInStartLine);
    let endSegment = this._lineCollection.GetByOffset(offset + length);
    if (endSegment == startSegment) {
      this.SetSegmentLength(startSegment, startSegment.TotalLength - length);
      return;
    }
    let endSegmentOffset = endSegment.Offset;
    let charactersLeftInEndLine = endSegmentOffset + endSegment.TotalLength - (offset + length);
    endSegment.RemovedLinePart(this, deferredEventList, 0, endSegment.TotalLength - charactersLeftInEndLine);
    startSegment.MergedWith(endSegment, offset - startSegmentOffset);
    this.SetSegmentLength(startSegment, startSegment.TotalLength - charactersRemovedInStartLine + charactersLeftInEndLine);
    startSegment.DelimiterLength = endSegment.DelimiterLength;
    it.MoveNext();
    let segmentToRemove;
    do {
      segmentToRemove = it.Current;
      it.MoveNext();
      this._lineCollection.RemoveSegment(segmentToRemove);
      segmentToRemove.Deleted(deferredEventList);
    } while (segmentToRemove != endSegment);
  }
  SetSegmentLength(segment, newTotalLength) {
    let delta = newTotalLength - segment.TotalLength;
    if (delta == 0)
      return;
    this._lineCollection.SetSegmentLength(segment, newTotalLength);
    this.LineLengthChanged.Invoke(new LineLengthChangeEventArgs(this._document, segment, delta));
  }
  static NextDelimiter(text, offset) {
    for (let i = offset; i < text.length; i++) {
      switch (text.charCodeAt(i)) {
        case 13:
          if (i + 1 < text.length && text.charCodeAt(i + 1) == 10)
            return new DelimiterSegment(i, 2);
          else
            return new DelimiterSegment(i, 1);
        case 10:
          return new DelimiterSegment(i, 1);
      }
    }
    return null;
  }
}
class DelimiterSegment {
  constructor(offset, length) {
    __publicField(this, "Offset");
    __publicField(this, "Length");
    this.Offset = offset;
    this.Length = length;
  }
}
class UndoStack {
  constructor() {
    __publicField(this, "_undostack", new System.Stack());
    __publicField(this, "_redostack", new System.Stack());
    __publicField(this, "TextEditor");
    __publicField(this, "_undoGroupDepth", 0);
    __publicField(this, "_actionCountInUndoGroup", 0);
    __publicField(this, "AcceptChanges", true);
  }
  get CanUndo() {
    return this._undostack.length > 0;
  }
  get CanRedo() {
    return this._redostack.length > 0;
  }
  get UndoItemCount() {
    return this._undostack.length;
  }
  get RedoItemCount() {
    return this._redostack.length;
  }
  StartUndoGroup() {
    if (this._undoGroupDepth == 0) {
      this._actionCountInUndoGroup = 0;
    }
    this._undoGroupDepth++;
  }
  EndUndoGroup() {
    if (this._undoGroupDepth == 0)
      throw new System.InvalidOperationException("There are no open undo groups");
    this._undoGroupDepth--;
    if (this._undoGroupDepth == 0 && this._actionCountInUndoGroup > 1) {
      let op = new UndoQueue(this._undostack, this._actionCountInUndoGroup);
      this._undostack.Push(op);
    }
  }
  AssertNoUndoGroupOpen() {
    if (this._undoGroupDepth != 0) {
      this._undoGroupDepth = 0;
      throw new System.InvalidOperationException("No undo group should be open at this point");
    }
  }
  Undo() {
    this.AssertNoUndoGroupOpen();
    if (this._undostack.length > 0) {
      let uedit = this._undostack.Pop();
      this._redostack.Push(uedit);
      uedit.Undo();
    }
  }
  Redo() {
    this.AssertNoUndoGroupOpen();
    if (this._redostack.length > 0) {
      let uedit = this._redostack.Pop();
      this._undostack.Push(uedit);
      uedit.Redo();
    }
  }
  Push(operation) {
    if (operation == null)
      throw new System.ArgumentNullException("operation");
    if (this.AcceptChanges) {
      this.StartUndoGroup();
      this._undostack.Push(operation);
      this._actionCountInUndoGroup++;
      if (this.TextEditor != null) {
        this._undostack.Push(new UndoableSetCaretPosition(this, this.TextEditor.Caret.Position.Clone()));
        this._actionCountInUndoGroup++;
      }
      this.EndUndoGroup();
      this.ClearRedoStack();
    }
  }
  ClearRedoStack() {
    this._redostack.Clear();
  }
  ClearAll() {
    this.AssertNoUndoGroupOpen();
    this._undostack.Clear();
    this._redostack.Clear();
    this._actionCountInUndoGroup = 0;
  }
}
class UndoQueue {
  constructor(stack, numops) {
    __publicField(this, "_undoList");
    numops = Math.min(numops, stack.length);
    this._undoList = new Array(numops);
    for (let i = 0; i < numops; ++i) {
      this._undoList[i] = stack.Pop();
    }
  }
  Undo() {
    for (let i = 0; i < this._undoList.length; ++i) {
      this._undoList[i].Undo();
    }
  }
  Redo() {
    for (let i = this._undoList.length - 1; i >= 0; --i) {
      this._undoList[i].Redo();
    }
  }
}
class UndoableDelete {
  constructor(document, offset, text) {
    __publicField(this, "_document");
    __publicField(this, "_offset");
    __publicField(this, "_text");
    this._document = document;
    this._offset = offset;
    this._text = text;
  }
  Undo() {
    var _a;
    (_a = this._document.UndoStack.TextEditor) == null ? void 0 : _a.SelectionManager.ClearSelection();
    this._document.UndoStack.AcceptChanges = false;
    this._document.Insert(this._offset, this._text);
    this._document.UndoStack.AcceptChanges = true;
  }
  Redo() {
    var _a;
    (_a = this._document.UndoStack.TextEditor) == null ? void 0 : _a.SelectionManager.ClearSelection();
    this._document.UndoStack.AcceptChanges = false;
    this._document.Remove(this._offset, this._text.length);
    this._document.UndoStack.AcceptChanges = true;
  }
}
class UndoableInsert {
  constructor(document, offset, text) {
    __publicField(this, "_document");
    __publicField(this, "_offset");
    __publicField(this, "_text");
    this._document = document;
    this._offset = offset;
    this._text = text;
  }
  Undo() {
    var _a;
    (_a = this._document.UndoStack.TextEditor) == null ? void 0 : _a.SelectionManager.ClearSelection();
    this._document.UndoStack.AcceptChanges = false;
    this._document.Remove(this._offset, this._text.length);
    this._document.UndoStack.AcceptChanges = true;
  }
  Redo() {
    var _a;
    (_a = this._document.UndoStack.TextEditor) == null ? void 0 : _a.SelectionManager.ClearSelection();
    this._document.UndoStack.AcceptChanges = false;
    this._document.Insert(this._offset, this._text);
    this._document.UndoStack.AcceptChanges = true;
  }
}
class UndoableReplace {
  constructor(document, offset, origText, text) {
    __publicField(this, "_document");
    __publicField(this, "_offset");
    __publicField(this, "_text");
    __publicField(this, "_origText");
    this._document = document;
    this._offset = offset;
    this._text = text;
    this._origText = origText;
  }
  Undo() {
    var _a;
    (_a = this._document.UndoStack.TextEditor) == null ? void 0 : _a.SelectionManager.ClearSelection();
    this._document.UndoStack.AcceptChanges = false;
    this._document.Replace(this._offset, this._text.length, this._origText);
    this._document.UndoStack.AcceptChanges = true;
  }
  Redo() {
    var _a;
    (_a = this._document.UndoStack.TextEditor) == null ? void 0 : _a.SelectionManager.ClearSelection();
    this._document.UndoStack.AcceptChanges = false;
    this._document.Replace(this._offset, this._origText.length, this._text);
    this._document.UndoStack.AcceptChanges = true;
  }
}
class UndoableSetCaretPosition {
  constructor(stack, pos) {
    __publicField(this, "_stack");
    __publicField(this, "_pos");
    __publicField(this, "_redoPos", TextLocation.Empty.Clone());
    this._stack = stack;
    this._pos = pos.Clone();
  }
  Undo() {
    this._redoPos = this._stack.TextEditor.Caret.Position.Clone();
    this._stack.TextEditor.Caret.Position = this._pos.Clone();
    this._stack.TextEditor.SelectionManager.ClearSelection();
  }
  Redo() {
    this._stack.TextEditor.Caret.Position = this._redoPos.Clone();
    this._stack.TextEditor.SelectionManager.ClearSelection();
  }
}
var BracketMatchingStyle = /* @__PURE__ */ ((BracketMatchingStyle2) => {
  BracketMatchingStyle2[BracketMatchingStyle2["Before"] = 0] = "Before";
  BracketMatchingStyle2[BracketMatchingStyle2["After"] = 1] = "After";
  return BracketMatchingStyle2;
})(BracketMatchingStyle || {});
var LineViewerStyle = /* @__PURE__ */ ((LineViewerStyle2) => {
  LineViewerStyle2[LineViewerStyle2["None"] = 0] = "None";
  LineViewerStyle2[LineViewerStyle2["FullRow"] = 1] = "FullRow";
  return LineViewerStyle2;
})(LineViewerStyle || {});
var IndentStyle = /* @__PURE__ */ ((IndentStyle2) => {
  IndentStyle2[IndentStyle2["None"] = 0] = "None";
  IndentStyle2[IndentStyle2["Auto"] = 1] = "Auto";
  IndentStyle2[IndentStyle2["Smart"] = 2] = "Smart";
  return IndentStyle2;
})(IndentStyle || {});
var BracketHighlightingStyle = /* @__PURE__ */ ((BracketHighlightingStyle2) => {
  BracketHighlightingStyle2[BracketHighlightingStyle2["None"] = 0] = "None";
  BracketHighlightingStyle2[BracketHighlightingStyle2["OnBracket"] = 1] = "OnBracket";
  BracketHighlightingStyle2[BracketHighlightingStyle2["AfterBracket"] = 2] = "AfterBracket";
  return BracketHighlightingStyle2;
})(BracketHighlightingStyle || {});
var DocumentSelectionMode = /* @__PURE__ */ ((DocumentSelectionMode2) => {
  DocumentSelectionMode2[DocumentSelectionMode2["Normal"] = 0] = "Normal";
  DocumentSelectionMode2[DocumentSelectionMode2["Additive"] = 1] = "Additive";
  return DocumentSelectionMode2;
})(DocumentSelectionMode || {});
const _TextLocation = class {
  constructor(column, line) {
    __publicField(this, "Line", 0);
    __publicField(this, "Column", 0);
    this.Line = line;
    this.Column = column;
  }
  get IsEmpty() {
    return this.Column <= 0 && this.Line <= 0;
  }
  toString() {
    return `(Line ${this.Line}, Col ${this.Column})`;
  }
  Equals(other) {
    return System.OpEquality(this, other);
  }
  static op_Equality(a, b) {
    return a.Column == b.Column && a.Line == b.Line;
  }
  static op_Inequality(a, b) {
    return a.Column != b.Column || a.Line != b.Line;
  }
  static op_LessThan(a, b) {
    if (a.Line < b.Line)
      return true;
    if (a.Line == b.Line)
      return a.Column < b.Column;
    return false;
  }
  static op_GreaterThan(a, b) {
    if (a.Line > b.Line)
      return true;
    if (a.Line == b.Line)
      return a.Column > b.Column;
    return false;
  }
  Clone() {
    return new _TextLocation(this.Column, this.Line);
  }
  CompareTo(other) {
    if (System.OpEquality(this, other))
      return 0;
    if (_TextLocation.op_LessThan(this, other))
      return -1;
    return 1;
  }
};
let TextLocation = _TextLocation;
__publicField(TextLocation, "$meta_System_IComparable", true);
__publicField(TextLocation, "$meta_System_IEquatable", true);
__publicField(TextLocation, "MaxColumn", 16777215);
__publicField(TextLocation, "Empty", new _TextLocation(-1, -1));
var AnchorMovementType = /* @__PURE__ */ ((AnchorMovementType2) => {
  AnchorMovementType2[AnchorMovementType2["BeforeInsertion"] = 0] = "BeforeInsertion";
  AnchorMovementType2[AnchorMovementType2["AfterInsertion"] = 1] = "AfterInsertion";
  return AnchorMovementType2;
})(AnchorMovementType || {});
class TextAnchor {
  constructor(lineSegment, columnNumber) {
    __publicField(this, "lineSegment");
    __publicField(this, "columnNumber", 0);
    __publicField(this, "MovementType", 0);
    __publicField(this, "Deleted", new System.Event());
    this.lineSegment = lineSegment;
    this.columnNumber = columnNumber;
  }
  static AnchorDeletedError() {
    return new System.InvalidOperationException("The text containing the anchor was deleted");
  }
  get Line() {
    if (this.lineSegment == null)
      throw TextAnchor.AnchorDeletedError();
    return this.lineSegment;
  }
  set Line(value) {
    this.lineSegment = value;
  }
  get IsDeleted() {
    return this.lineSegment == null;
  }
  get LineNumber() {
    return this.Line.LineNumber;
  }
  get ColumnNumber() {
    if (this.lineSegment == null)
      throw TextAnchor.AnchorDeletedError();
    return this.columnNumber;
  }
  set ColumnNumber(value) {
    this.columnNumber = value;
  }
  get Location() {
    return new TextLocation(this.ColumnNumber, this.LineNumber);
  }
  get Offset() {
    return this.Line.Offset + this.columnNumber;
  }
  Delete(deferredEventList) {
    this.lineSegment = null;
    deferredEventList.Value.AddDeletedAnchor(this);
  }
  RaiseDeleted() {
    this.Deleted.Invoke();
  }
  toString() {
    return this.IsDeleted ? "[TextAnchor (deleted)]" : `[TextAnchor ${this.Location}]`;
  }
}
class TextEditorOptions {
  constructor() {
    __publicField(this, "TabIndent", 4);
    __publicField(this, "IndentationSize", 4);
    __publicField(this, "IndentStyle", IndentStyle.Smart);
    __publicField(this, "DocumentSelectionMode", DocumentSelectionMode.Normal);
    __publicField(this, "BracketMatchingStyle", BracketMatchingStyle.After);
    __publicField(this, "AllowCaretBeyondEOL", false);
    __publicField(this, "CaretLine", false);
    __publicField(this, "ShowMatchingBracket", true);
    __publicField(this, "ShowLineNumbers", true);
    __publicField(this, "ShowSpaces", false);
    __publicField(this, "ShowTabs", false);
    __publicField(this, "ShowEOLMarker", false);
    __publicField(this, "ShowInvalidLines", false);
    __publicField(this, "IsIconBarVisible", false);
    __publicField(this, "EnableFolding", true);
    __publicField(this, "ShowHorizontalRuler", false);
    __publicField(this, "ShowVerticalRuler", false);
    __publicField(this, "ConvertTabsToSpaces", false);
    __publicField(this, "MouseWheelScrollDown", true);
    __publicField(this, "MouseWheelTextZoom", true);
    __publicField(this, "HideMouseCursor", false);
    __publicField(this, "CutCopyWholeLine", true);
    __publicField(this, "VerticalRulerRow", 80);
    __publicField(this, "LineViewerStyle", LineViewerStyle.None);
    __publicField(this, "LineTerminator", "\n");
    __publicField(this, "AutoInsertCurlyBracket", true);
    __publicField(this, "SupportReadOnlySegments", false);
  }
}
class DocumentEventArgs {
  constructor(document, offset, length, text) {
    __publicField(this, "Document");
    __publicField(this, "Offset");
    __publicField(this, "Length");
    __publicField(this, "Text");
    this.Document = document;
    this.Offset = offset;
    this.Length = length;
    this.Text = text;
  }
}
class Document {
  constructor(fileName, tag = null) {
    __publicField(this, "_fileName", "");
    __publicField(this, "Tag");
    __publicField(this, "_lineManager");
    __publicField(this, "TextBuffer");
    __publicField(this, "SyntaxParser");
    __publicField(this, "FoldingManager");
    __publicField(this, "TextEditorOptions");
    __publicField(this, "UndoStack");
    __publicField(this, "Readonly", false);
    __publicField(this, "DocumentChanged", new System.Event());
    this._fileName = fileName;
    this.Tag = tag;
    this.TextBuffer = new ImmutableTextBuffer();
    this._lineManager = new LineManager(this);
    this.SyntaxParser = new SyntaxParser(this);
    this.FoldingManager = new FoldingManager(this);
    this.TextEditorOptions = new TextEditorOptions();
    this.UndoStack = new UndoStack();
  }
  get HasSyntaxError() {
    var _a, _b;
    return (_b = (_a = this.SyntaxParser.RootNode) == null ? void 0 : _a.hasError()) != null ? _b : false;
  }
  get TextLength() {
    return this.TextBuffer.Length;
  }
  get TotalNumberOfLines() {
    return this._lineManager.TotalNumberOfLines;
  }
  get TextContent() {
    return this.GetText(0, this.TextBuffer.Length);
  }
  set TextContent(value) {
    this.TextBuffer.SetContent(value);
    this._lineManager.SetContent(value);
    this.UndoStack.ClearAll();
    this.SyntaxParser.Parse(true);
    this.SyntaxParser.Tokenize(0, this.TotalNumberOfLines);
    this.DocumentChanged.Invoke(new DocumentEventArgs(this, 0, 0, value));
  }
  GetCharAt(offset) {
    return this.TextBuffer.GetCharAt(offset);
  }
  GetText(offset, length) {
    return this.TextBuffer.GetText(offset, length);
  }
  Insert(offset, text) {
    if (this.Readonly)
      return;
    this.SyntaxParser.BeginInsert(offset, text.length);
    this.TextBuffer.Insert(offset, text);
    this._lineManager.Insert(offset, text);
    this.UndoStack.Push(new UndoableInsert(this, offset, text));
    this.SyntaxParser.EndInsert(offset, text.length);
    this.DocumentChanged.Invoke(new DocumentEventArgs(this, offset, 0, text));
  }
  Remove(offset, length) {
    if (this.Readonly)
      return;
    this.SyntaxParser.BeginRemove(offset, length);
    this.UndoStack.Push(new UndoableDelete(this, offset, this.GetText(offset, length)));
    this.TextBuffer.Remove(offset, length);
    this._lineManager.Remove(offset, length);
    this.SyntaxParser.EndRemove();
    this.DocumentChanged.Invoke(new DocumentEventArgs(this, offset, length, ""));
  }
  Replace(offset, length, text) {
    if (this.Readonly)
      return;
    this.SyntaxParser.BeginReplace(offset, length, text.length);
    this.UndoStack.Push(new UndoableReplace(this, offset, this.GetText(offset, length), text));
    this.TextBuffer.Replace(offset, length, text);
    this._lineManager.Replace(offset, length, text);
    this.SyntaxParser.EndReplace(offset, length, text.length);
    this.DocumentChanged.Invoke(new DocumentEventArgs(this, offset, length, text));
  }
  StartUndoGroup() {
    this.UndoStack.StartUndoGroup();
  }
  EndUndoGroup() {
    this.UndoStack.EndUndoGroup();
  }
  GetLineNumberForOffset(offset) {
    return this._lineManager.GetLineNumberForOffset(offset);
  }
  GetLineSegmentForOffset(offset) {
    return this._lineManager.GetLineSegmentForOffset(offset);
  }
  GetLineSegment(lineNumber) {
    return this._lineManager.GetLineSegment(lineNumber);
  }
  GetFirstLogicalLine(lineNumber) {
    return this._lineManager.GetFirstLogicalLine(lineNumber);
  }
  GetVisibleLine(lineNumber) {
    return this._lineManager.GetVisibleLine(lineNumber);
  }
  OffsetToPosition(offset) {
    let lineNumber = this.GetLineNumberForOffset(offset);
    let line = this.GetLineSegment(lineNumber);
    return new TextLocation(offset - line.Offset, lineNumber);
  }
  PositionToOffset(position) {
    if (position.Line >= this.TotalNumberOfLines)
      return 0;
    let line = this.GetLineSegment(position.Line);
    return Math.min(this.TextLength, line.Offset + Math.min(line.Length, position.Column));
  }
  UpdateSegmentsOnDocumentChanged(list, e) {
    let removedCharacters = e.Length > 0 ? e.Length : 0;
    let insertedCharacters = System.IsNullOrEmpty(e.Text) ? 0 : e.Text.length;
    for (let i = 0; i < list.length; ++i) {
      let s = list[i];
      let segmentStart = s.Offset;
      let segmentEnd = s.Offset + s.Length;
      if (e.Offset <= segmentStart) {
        segmentStart -= removedCharacters;
        if (segmentStart < e.Offset)
          segmentStart = e.Offset;
      }
      if (e.Offset < segmentEnd) {
        segmentEnd -= removedCharacters;
        if (segmentEnd < e.Offset)
          segmentEnd = e.Offset;
      }
      if (segmentStart == segmentEnd) {
        list.RemoveAt(i);
        --i;
        continue;
      }
      if (e.Offset <= segmentStart)
        segmentStart += insertedCharacters;
      if (e.Offset < segmentEnd)
        segmentEnd += insertedCharacters;
      s.Offset = segmentStart;
      s.Length = segmentEnd - segmentStart;
    }
  }
  Dispose() {
    this.SyntaxParser.Dispose();
  }
}
__publicField(Document, "$meta_System_IDisposable", true);
class CustomEditCommand {
  constructor(command) {
    __publicField(this, "_command");
    this._command = command;
  }
  Execute(editor) {
    this._command(editor);
  }
}
class CaretLeft {
  Execute(editor) {
    let position = editor.Caret.Position.Clone();
    let foldings = editor.Document.FoldingManager.GetFoldedFoldingsWithEnd(position.Line);
    let justBeforeCaret = null;
    for (const fm of foldings) {
      if (fm.EndColumn == position.Column) {
        justBeforeCaret = fm;
        break;
      }
    }
    if (justBeforeCaret != null) {
      position.Line = justBeforeCaret.StartLine;
      position.Column = justBeforeCaret.StartColumn;
    } else {
      if (position.Column > 0) {
        position.Column -= 1;
      } else if (position.Line > 0) {
        let lineAbove = editor.Document.GetLineSegment(position.Line - 1);
        position.Column = lineAbove.Length;
        position.Line = position.Line - 1;
      }
    }
    editor.Caret.Position = position.Clone();
  }
}
class CaretRight {
  Execute(editor) {
    let curLine = editor.Document.GetLineSegment(editor.Caret.Line);
    let position = editor.Caret.Position.Clone();
    let foldings = editor.Document.FoldingManager.GetFoldedFoldingsWithStart(position.Line);
    let justBehindCaret = null;
    for (const fm of foldings) {
      if (fm.StartColumn == position.Column) {
        justBehindCaret = fm;
        break;
      }
    }
    if (justBehindCaret != null) {
      position.Line = justBehindCaret.EndLine;
      position.Column = justBehindCaret.EndColumn;
    } else {
      if (position.Column < curLine.Length || editor.Document.TextEditorOptions.AllowCaretBeyondEOL) {
        position.Column += 1;
      } else if (position.Column + 1 < editor.Document.TotalNumberOfLines) {
        position.Line += 1;
        position.Column = 0;
      }
    }
    editor.Caret.Position = position.Clone();
  }
}
class CaretUp {
  Execute(editor) {
    let position = editor.Caret.Position.Clone();
    let visualLine = editor.Document.GetVisibleLine(position.Line);
    if (visualLine > 0) {
      let vx = editor.TextView.GetDrawingXPos(position.Line, position.Column) + editor.VirtualTop.X;
      let vy = editor.TextView.Bounds.Top + (visualLine - 1) * editor.TextView.FontHeight - editor.VirtualTop.Y;
      let logicalLine = editor.TextView.GetLogicalLine(vy);
      let logicalColumn = editor.TextView.GetLogicalColumn(logicalLine, vx);
      editor.Caret.Position = logicalColumn.Location.Clone();
    }
  }
}
class CaretDown {
  Execute(editor) {
    let position = editor.Caret.Position.Clone();
    let visualLine = editor.Document.GetVisibleLine(position.Line);
    if (visualLine < editor.Document.GetVisibleLine(editor.Document.TotalNumberOfLines)) {
      let vx = editor.TextView.GetDrawingXPos(position.Line, position.Column) + editor.VirtualTop.X;
      let vy = editor.TextView.Bounds.Top + (visualLine + 1) * editor.TextView.FontHeight - editor.VirtualTop.Y;
      let logicalLine = editor.TextView.GetLogicalLine(vy);
      let logicalColumn = editor.TextView.GetLogicalColumn(logicalLine, vx);
      editor.Caret.Position = logicalColumn.Location.Clone();
    }
  }
}
class BackspaceCommand {
  Execute(editor) {
    if (editor.SelectionManager.HasSomethingSelected) {
      editor.DeleteSelection();
      return;
    }
    let caretOffset = editor.Caret.Offset;
    if (caretOffset <= 0)
      return;
    let curLineNr = editor.Document.GetLineNumberForOffset(caretOffset);
    let curLine = editor.Document.GetLineSegment(curLineNr);
    let curLineOffset = curLine.Offset;
    if (curLineOffset == caretOffset) {
      let preLine = editor.Document.GetLineSegment(curLineNr - 1);
      let preLineEndOffset = preLine.Offset + preLine.Length;
      editor.Document.Remove(preLineEndOffset, curLineOffset - preLineEndOffset);
      editor.Caret.Position = new TextLocation(preLine.Length, curLineNr - 1);
    } else {
      let ch = editor.Document.GetCharAt(caretOffset - 1);
      let closingPair = editor.Document.SyntaxParser.Language.GetAutoColsingPairs(ch);
      let len = closingPair != null && closingPair == editor.Document.GetCharAt(caretOffset) ? 2 : 1;
      editor.Document.Remove(caretOffset - 1, len);
      editor.Caret.Position = editor.Document.OffsetToPosition(caretOffset - 1);
    }
  }
}
class TabCommand {
  Execute(editor) {
    let tabIndent = editor.Document.TextEditorOptions.TabIndent;
    let convertToWhitespaces = " ".repeat(tabIndent);
    editor.InsertOrReplaceString(convertToWhitespaces);
  }
}
class ReturnCommand {
  Execute(editor) {
    editor.Document.UndoStack.StartUndoGroup();
    let curLine = editor.Caret.Line;
    let curLineSegment = editor.Document.GetLineSegment(curLine);
    let leadingWhiteSpaces = curLineSegment.GetLeadingWhiteSpaces();
    if (leadingWhiteSpaces == 0)
      editor.InsertOrReplaceString("\n");
    else
      editor.InsertOrReplaceString("\n" + " ".repeat(leadingWhiteSpaces));
    editor.Document.UndoStack.EndUndoGroup();
  }
}
class UndoCommand {
  Execute(editor) {
    editor.Document.UndoStack.Undo();
  }
}
class RedoCommand {
  Execute(editor) {
    editor.Document.UndoStack.Redo();
  }
}
class EditorArea {
  constructor(textEditor) {
    __publicField(this, "TextEditor");
    __publicField(this, "Bounds", PixUI.Rect.Empty);
    this.TextEditor = textEditor;
  }
  get Theme() {
    return this.TextEditor.Theme;
  }
  get Document() {
    return this.TextEditor.Document;
  }
  get IsVisible() {
    return true;
  }
  get Size() {
    return new PixUI.Size(-1, -1);
  }
  HandlePointerDown(x, y, buttons) {
  }
}
class TextView extends EditorArea {
  constructor(textEditor) {
    super(textEditor);
    __publicField(this, "_spaceWidth", 10);
    __privateAdd(this, _FontHeight, 0);
    this.FontHeight = textEditor.Theme.FontSize + textEditor.Theme.LineSpace * 2;
  }
  get FontHeight() {
    return __privateGet(this, _FontHeight);
  }
  set FontHeight(value) {
    __privateSet(this, _FontHeight, value);
  }
  get VisibleLineCount() {
    return 1 + (Math.floor(Math.round(this.Bounds.Height / this.FontHeight)) & 4294967295);
  }
  get VisibleLineDrawingRemainder() {
    return Math.floor(Math.round(this.TextEditor.VirtualTop.Y % this.FontHeight)) & 4294967295;
  }
  get FirstVisibleLine() {
    return this.Document.GetFirstLogicalLine(Math.floor(this.TextEditor.VirtualTop.Y / this.FontHeight) & 4294967295);
  }
  set FirstVisibleLine(value) {
    if (this.FirstVisibleLine != value) {
      this.TextEditor.VirtualTop = new PixUI.Point(this.TextEditor.VirtualTop.X, this.Document.GetVisibleLine(value) * this.FontHeight);
    }
  }
  get FirstPhysicalLine() {
    return Math.floor(this.TextEditor.VirtualTop.Y / this.FontHeight) & 4294967295;
  }
  GetLogicalPosition(visualPosX, visualPosY) {
    return this.GetLogicalColumn(this.GetLogicalLine(visualPosY), visualPosX).Location;
  }
  GetLogicalColumn(lineNumber, visualPosX) {
    visualPosX += this.TextEditor.VirtualTop.X;
    if (lineNumber >= this.Document.TotalNumberOfLines) {
      return new LogicalColumnInfo(new TextLocation(Math.floor(visualPosX / this._spaceWidth) & 4294967295, lineNumber), null);
    }
    if (visualPosX <= 0) {
      return new LogicalColumnInfo(new TextLocation(0, lineNumber), null);
    }
    let line = this.Document.GetLineSegment(lineNumber);
    let inFoldMarker = null;
    let para = line.GetLineParagraph(this.TextEditor);
    let columnInLine = para.getGlyphPositionAtCoordinate(visualPosX, 1).pos;
    let column = columnInLine;
    if (line.CachedFolds != null && column > line.CachedFolds[0].LineStart) {
      for (const fold of line.CachedFolds) {
        if (columnInLine < fold.LineStart)
          break;
        if (columnInLine >= fold.LineStart && columnInLine < fold.LineEnd) {
          inFoldMarker = fold.FoldMarker;
          lineNumber = fold.FoldMarker.EndLine;
          column = fold.FoldMarker.EndColumn;
          break;
        } else if (columnInLine >= fold.LineEnd) {
          lineNumber = fold.FoldMarker.EndLine;
          column = fold.FoldMarker.EndColumn + (columnInLine - fold.LineEnd);
        }
      }
    }
    return new LogicalColumnInfo(new TextLocation(column, lineNumber), inFoldMarker);
  }
  GetLogicalLine(visualPosY) {
    let clickedVisualLine = Math.max(0, Math.floor((visualPosY + this.TextEditor.VirtualTop.Y) / this.FontHeight) & 4294967295);
    return this.Document.GetFirstLogicalLine(clickedVisualLine);
  }
  GetDrawingXPos(logicalLine, logicalColumn) {
    let foldings = this.Document.FoldingManager.GetTopLevelFoldedFoldings();
    let foldedLineNumber = -1;
    for (let i = foldings.length - 1; i >= 0; i--) {
      let f = foldings[i];
      if (foldedLineNumber >= 0) {
        if (f.EndLine == foldedLineNumber)
          foldedLineNumber = f.StartLine;
        else
          break;
      } else if (f.StartLine == logicalLine || f.EndLine == logicalLine) {
        foldedLineNumber = f.StartLine;
      }
    }
    let visualLine = foldedLineNumber < 0 ? this.Document.GetLineSegment(logicalLine) : this.Document.GetLineSegment(foldedLineNumber);
    let drawingPos = visualLine.GetXPos(this.TextEditor, logicalLine, logicalColumn);
    return drawingPos - this.TextEditor.VirtualTop.X;
  }
  HandlePointerDown(x, y, buttons) {
    let vx = x - this.Bounds.Left;
    let vy = y - this.Bounds.Top;
    if (buttons == PixUI.PointerButtons.Left) {
      let logicalLine = this.GetLogicalLine(vy);
      let logicalColumn = this.GetLogicalColumn(logicalLine, vx);
      this.TextEditor.SelectionManager.ClearSelection();
      this.TextEditor.Caret.Position = logicalColumn.Location.Clone();
    } else if (buttons == PixUI.PointerButtons.Right) {
      let contextMenuBuilder = this.TextEditor.Controller.ContextMenuBuilder;
      if (contextMenuBuilder != null) {
        let contextMenus = contextMenuBuilder(this.TextEditor);
        if (contextMenus.length > 0)
          PixUI.ContextMenu.Show(contextMenus);
      }
    }
  }
  Paint(canvas, rect) {
    if (rect.Width <= 0 || rect.Height <= 0)
      return;
    let horizontalDelta = this.TextEditor.VirtualTop.X;
    if (horizontalDelta > 0) {
      canvas.save();
      canvas.clipRect(this.Bounds, CanvasKit.ClipOp.Intersect, false);
    }
    let paint = PixUI.PaintUtils.Shared(this.Theme.TextBgColor);
    canvas.drawRect(rect, paint);
    let maxLines = Math.floor((this.Bounds.Height + this.VisibleLineDrawingRemainder) / this.FontHeight + 1) & 4294967295;
    this.PaintLines(canvas, maxLines);
    if (horizontalDelta > 0)
      canvas.restore();
  }
  PaintLines(canvas, maxLines) {
    let horizontalDelta = this.TextEditor.VirtualTop.X;
    for (let y = 0; y < maxLines; y++) {
      let lineRect = PixUI.Rect.FromLTWH(this.Bounds.Left - horizontalDelta, this.Bounds.Top + y * this.FontHeight - this.VisibleLineDrawingRemainder, this.Bounds.Width + horizontalDelta, this.FontHeight);
      let currentLine = this.Document.GetFirstLogicalLine(this.Document.GetVisibleLine(this.FirstVisibleLine) + y);
      if (currentLine >= this.Document.TotalNumberOfLines)
        return;
      let lineSegment = this.Document.GetLineSegment(currentLine);
      if (lineSegment.Length == 0)
        continue;
      let lineParagraph = lineSegment.GetLineParagraph(this.TextEditor);
      canvas.drawParagraph(lineParagraph, lineRect.Left, lineRect.Top + this.Theme.LineSpace);
    }
  }
}
_FontHeight = new WeakMap();
class LogicalColumnInfo {
  constructor(location, inFoldMarker) {
    __publicField(this, "Location");
    __publicField(this, "InFoldMarker");
    this.Location = location.Clone();
    this.InFoldMarker = inFoldMarker;
  }
}
class FoldArea extends EditorArea {
  constructor(textEditor) {
    super(textEditor);
    __publicField(this, "_selectedFoldLine", -1);
  }
  GetNormalPaint() {
    return PixUI.PaintUtils.Shared(new PixUI.Color(200, 200, 200, 255), CanvasKit.PaintStyle.Stroke, 1);
  }
  GetSelectedPaint() {
    return PixUI.PaintUtils.Shared(new PixUI.Color(200, 200, 200, 255), CanvasKit.PaintStyle.Stroke, 1.5);
  }
  SelectedFoldingFrom(list) {
    for (const fm of list) {
      if (this._selectedFoldLine == fm.StartLine)
        return true;
    }
    return false;
  }
  get Size() {
    return new PixUI.Size(this.TextEditor.TextView.FontHeight, -1);
  }
  get IsVisible() {
    return this.TextEditor.Document.TextEditorOptions.EnableFolding;
  }
  HandlePointerDown(x, y, buttons) {
    let physicalLine = Math.floor((y + this.TextEditor.VirtualTop.Y) / this.TextEditor.TextView.FontHeight) & 4294967295;
    let realLine = this.Document.GetFirstLogicalLine(physicalLine);
    if (realLine < 0 || realLine + 1 >= this.Document.TotalNumberOfLines)
      return;
    let foldings = this.Document.FoldingManager.GetFoldingsWithStart(realLine);
    for (const fm of foldings) {
      fm.IsFolded = !fm.IsFolded;
    }
    let line = this.Document.GetLineSegment(realLine);
    line.ClearCachedParagraph();
    this.TextEditor.Caret.UpdateCaretPosition();
    if (foldings.length > 0) {
      this.Document.FoldingManager.RaiseFoldingsChanged();
      this.TextEditor.Controller.Widget.RequestInvalidate(true, null);
    }
  }
  Paint(canvas, rect) {
    if (rect.Width <= 0 || rect.Height <= 0)
      return;
    let paint = PixUI.PaintUtils.Shared(this.TextEditor.Theme.TextBgColor);
    canvas.drawRect(rect, paint);
    let fontHeight = this.TextEditor.TextView.FontHeight;
    let visibleLineRemainder = this.TextEditor.TextView.VisibleLineDrawingRemainder;
    let maxHeight = Math.floor((this.Bounds.Height + visibleLineRemainder) / fontHeight + 1) & 4294967295;
    for (let y = 0; y < maxHeight; ++y) {
      let markerRect = PixUI.Rect.FromLTWH(this.Bounds.Left, this.Bounds.Top + y * fontHeight - visibleLineRemainder, this.Bounds.Width, fontHeight);
      if (rect.IntersectsWith(markerRect.Left, markerRect.Top, markerRect.Width, markerRect.Height)) {
        let currentLine = this.Document.GetFirstLogicalLine(this.TextEditor.TextView.FirstPhysicalLine + y);
        if (currentLine < this.Document.TotalNumberOfLines) {
          this.PaintFoldMarker(canvas, currentLine, markerRect.Clone());
        }
      }
    }
  }
  PaintFoldMarker(canvas, lineNumber, rect) {
    let foldingManager = this.Document.FoldingManager;
    let foldingsWithStart = foldingManager.GetFoldingsWithStart(lineNumber);
    let foldingsBetween = foldingManager.GetFoldingsContainsLineNumber(lineNumber);
    let foldingsWithEnd = foldingManager.GetFoldingsWithEnd(lineNumber);
    let isFoldStart = foldingsWithStart.length > 0;
    let isBetween = foldingsBetween.length > 0;
    let isFoldEnd = foldingsWithEnd.length > 0;
    let isStartSelected = this.SelectedFoldingFrom(foldingsWithStart);
    let isBetweenSelected = this.SelectedFoldingFrom(foldingsBetween);
    let isEndSelected = this.SelectedFoldingFrom(foldingsWithEnd);
    let foldMarkerSize = this.TextEditor.TextView.FontHeight * 0.57;
    foldMarkerSize -= foldMarkerSize % 2;
    let foldMarkerYPos = rect.Top + (rect.Height - foldMarkerSize) / 2;
    let xPos = rect.Left + (rect.Width - foldMarkerSize) / 2 + foldMarkerSize / 2;
    if (isFoldStart) {
      let isVisible = true;
      let moreLinedOpenFold = false;
      for (const fm of foldingsWithStart) {
        if (fm.IsFolded)
          isVisible = false;
        else
          moreLinedOpenFold = fm.EndLine > fm.StartLine;
      }
      let isFoldEndFromUpperFold = false;
      for (const fm of foldingsWithEnd) {
        if (fm.EndLine > fm.StartLine && !fm.IsFolded)
          isFoldEndFromUpperFold = true;
      }
      this.PaintMarker(canvas, PixUI.Rect.FromLTWH(rect.Left + (rect.Width - foldMarkerSize) / 2, foldMarkerYPos, foldMarkerSize, foldMarkerSize), isVisible, isStartSelected);
      if (isBetween || isFoldEndFromUpperFold) {
        canvas.drawLine(xPos, rect.Top, xPos, foldMarkerYPos - 1, isBetweenSelected ? this.GetSelectedPaint() : this.GetNormalPaint());
      }
      if (isBetween || moreLinedOpenFold) {
        canvas.drawLine(xPos, foldMarkerYPos + foldMarkerSize + 1, xPos, rect.Bottom, isEndSelected || isStartSelected && isVisible || isBetweenSelected ? this.GetSelectedPaint() : this.GetNormalPaint());
      }
    } else {
      if (isFoldEnd) {
        let midY = rect.Top + rect.Height / 2;
        canvas.drawLine(xPos, midY, xPos + foldMarkerSize / 2, midY, isEndSelected ? this.GetSelectedPaint() : this.GetNormalPaint());
        canvas.drawLine(xPos, rect.Top, xPos, midY, isBetweenSelected || isEndSelected ? this.GetSelectedPaint() : this.GetNormalPaint());
        if (isBetween) {
          canvas.drawLine(xPos, midY + 1, xPos, rect.Bottom, isBetweenSelected ? this.GetSelectedPaint() : this.GetNormalPaint());
        }
      } else if (isBetween) {
        canvas.drawLine(xPos, rect.Top, xPos, rect.Bottom, isBetweenSelected ? this.GetSelectedPaint() : this.GetNormalPaint());
      }
    }
  }
  PaintMarker(canvas, rect, isOpened, isSelected) {
    canvas.drawRect(PixUI.Rect.FromLTWH(rect.Left, rect.Top, rect.Width, rect.Height), isSelected ? this.GetSelectedPaint() : this.GetNormalPaint());
    let space = rect.Height / 8 + 1;
    let mid = rect.Height / 2 + rect.Height % 2;
    canvas.drawLine(rect.Left + space, rect.Top + mid, rect.Left + rect.Width - space, rect.Top + mid, this.GetNormalPaint());
    if (!isOpened) {
      canvas.drawLine(rect.Left + mid, rect.Top + space, rect.Left + mid, rect.Top + rect.Height - space, this.GetNormalPaint());
    }
  }
}
class GutterArea extends EditorArea {
  constructor(textEditor) {
    super(textEditor);
    __publicField(this, "_numberCache");
    __publicField(this, "_numberWidth");
    this._numberCache = this.GenerateNumberCache();
    this._numberWidth = this._numberCache[7].getLongestLine();
  }
  GenerateNumberCache() {
    let cache = new Array(10);
    let ts = PixUI.MakeTextStyle({ color: this.Theme.LineNumberColor });
    for (let i = 0; i < 10; i++) {
      let ps = PixUI.MakeParagraphStyle({ maxLines: 1 });
      let pb = PixUI.MakeParagraphBuilder(ps);
      pb.pushStyle(ts);
      pb.addText(i.toString());
      let ph = pb.build();
      ph.layout(Number.MAX_VALUE);
      cache[i] = ph;
      pb.delete();
    }
    return cache;
  }
  get Size() {
    return new PixUI.Size(this._numberWidth * 5, -1);
  }
  Paint(canvas, rect) {
    if (rect.Width <= 0 || rect.Height <= 0)
      return;
    let paint = PixUI.PaintUtils.Shared(this.Theme.LineBgColor);
    canvas.drawRect(rect, paint);
    let lineHeight = this.TextEditor.TextView.FontHeight;
    let visibleLineRemainder = this.TextEditor.TextView.VisibleLineDrawingRemainder;
    let maxHeight = (Math.floor((this.Bounds.Height + visibleLineRemainder) / lineHeight) & 4294967295) + 1;
    for (let y = 0; y < maxHeight; y++) {
      let yPos = this.Bounds.Top + lineHeight * y - visibleLineRemainder + this.Theme.LineSpace;
      if (rect.IntersectsWith(this.Bounds.Left, yPos, this.Bounds.Width, lineHeight)) {
        let curLine = this.Document.GetFirstLogicalLine(this.Document.GetVisibleLine(this.TextEditor.TextView.FirstVisibleLine) + y);
        if (curLine < this.Document.TotalNumberOfLines)
          this.DrawLineNumber(canvas, curLine + 1, yPos);
      }
    }
  }
  DrawLineNumber(canvas, lineNumber, yPos) {
    let unitPlace = lineNumber % 10;
    let tenPlace = (Math.floor(lineNumber / 10) & 4294967295) % 10;
    let hundredPlace = (Math.floor(lineNumber / 100) & 4294967295) % 10;
    let thousandPlace = (Math.floor(lineNumber / 1e3) & 4294967295) % 10;
    canvas.drawParagraph(this._numberCache[unitPlace], 2 + this._numberWidth * 3, yPos);
    if (lineNumber >= 10)
      canvas.drawParagraph(this._numberCache[tenPlace], 2 + this._numberWidth * 2, yPos);
    if (lineNumber >= 100)
      canvas.drawParagraph(this._numberCache[hundredPlace], 2 + this._numberWidth, yPos);
    if (lineNumber >= 1e3)
      canvas.drawParagraph(this._numberCache[thousandPlace], 2, yPos);
  }
}
var CompletionItemKind = /* @__PURE__ */ ((CompletionItemKind2) => {
  CompletionItemKind2[CompletionItemKind2["Method"] = 0] = "Method";
  CompletionItemKind2[CompletionItemKind2["Function"] = 1] = "Function";
  CompletionItemKind2[CompletionItemKind2["Constructor"] = 2] = "Constructor";
  CompletionItemKind2[CompletionItemKind2["Field"] = 3] = "Field";
  CompletionItemKind2[CompletionItemKind2["Variable"] = 4] = "Variable";
  CompletionItemKind2[CompletionItemKind2["Class"] = 5] = "Class";
  CompletionItemKind2[CompletionItemKind2["Struct"] = 6] = "Struct";
  CompletionItemKind2[CompletionItemKind2["Interface"] = 7] = "Interface";
  CompletionItemKind2[CompletionItemKind2["Module"] = 8] = "Module";
  CompletionItemKind2[CompletionItemKind2["Property"] = 9] = "Property";
  CompletionItemKind2[CompletionItemKind2["Event"] = 10] = "Event";
  CompletionItemKind2[CompletionItemKind2["Operator"] = 11] = "Operator";
  CompletionItemKind2[CompletionItemKind2["Unit"] = 12] = "Unit";
  CompletionItemKind2[CompletionItemKind2["Value"] = 13] = "Value";
  CompletionItemKind2[CompletionItemKind2["Constant"] = 14] = "Constant";
  CompletionItemKind2[CompletionItemKind2["Enum"] = 15] = "Enum";
  CompletionItemKind2[CompletionItemKind2["EnumMember"] = 16] = "EnumMember";
  CompletionItemKind2[CompletionItemKind2["Keyword"] = 17] = "Keyword";
  CompletionItemKind2[CompletionItemKind2["Text"] = 18] = "Text";
  CompletionItemKind2[CompletionItemKind2["Color"] = 19] = "Color";
  CompletionItemKind2[CompletionItemKind2["File"] = 20] = "File";
  CompletionItemKind2[CompletionItemKind2["Reference"] = 21] = "Reference";
  CompletionItemKind2[CompletionItemKind2["CustomColor"] = 22] = "CustomColor";
  CompletionItemKind2[CompletionItemKind2["Folder"] = 23] = "Folder";
  CompletionItemKind2[CompletionItemKind2["TypeParameter"] = 24] = "TypeParameter";
  CompletionItemKind2[CompletionItemKind2["User"] = 25] = "User";
  CompletionItemKind2[CompletionItemKind2["Issue"] = 26] = "Issue";
  CompletionItemKind2[CompletionItemKind2["Snippet"] = 27] = "Snippet";
  return CompletionItemKind2;
})(CompletionItemKind || {});
class CompletionWord {
  constructor(offset, word) {
    __publicField(this, "Offset");
    __publicField(this, "Word");
    this.Offset = offset;
    this.Word = word;
  }
}
class CompletionItemWidget extends PixUI.Widget {
  constructor(item, isSelected) {
    super();
    __publicField(this, "_item");
    __publicField(this, "_isSelected");
    __publicField(this, "_iconPainter");
    __publicField(this, "_paragraph");
    this._item = item;
    this._isSelected = isSelected;
    this._iconPainter = new PixUI.IconPainter(() => this.Invalidate(PixUI.InvalidAction.Repaint));
  }
  Layout(availableWidth, availableHeight) {
    this.SetSize(availableWidth, availableHeight);
  }
  Paint(canvas, area = null) {
    var _a;
    let fontSize = 13;
    let x = 2;
    let y = 3;
    this._iconPainter.Paint(canvas, fontSize, PixUI.Colors.Gray, CompletionItemWidget.GetIcon(this._item.Kind), x, y);
    (_a = this._paragraph) != null ? _a : this._paragraph = PixUI.TextPainter.BuildParagraph(this._item.Label, Number.POSITIVE_INFINITY, fontSize, PixUI.Colors.Black, null, 1, true);
    canvas.drawParagraph(this._paragraph, x + 20, y);
  }
  static GetIcon(kind) {
    switch (kind) {
      case CompletionItemKind.Function:
      case CompletionItemKind.Method:
        return PixUI.Icons.Filled.Functions;
      case CompletionItemKind.Event:
        return PixUI.Icons.Filled.Bolt;
      default:
        return PixUI.Icons.Filled.Title;
    }
  }
}
const _CompletionContext = class {
  constructor(controller, provider) {
    __publicField(this, "_controller");
    __publicField(this, "_provider");
    __publicField(this, "_completionStartOffset", -1);
    __publicField(this, "_startByTriggerChar", false);
    __publicField(this, "_completionWindow");
    __publicField(this, "_state", _CompletionContext.StateIdle);
    this._controller = controller;
    this._provider = provider;
  }
  RunCompletion(value) {
    if (this._provider == null)
      return;
    let word = this.GetWordAtPosition(this._controller.TextEditor.Caret.Position);
    if (this._state == _CompletionContext.StateShow) {
      if (word == null) {
        this.HideCompletionWindow();
      } else {
        this.UpdateFilter();
        return;
      }
    }
    if (word != null) {
      this._completionStartOffset = word.Offset;
      this._startByTriggerChar = false;
      this._state = _CompletionContext.StateShow;
      this.RunInternal(word.Word);
    } else {
      let triggerChar = value.charCodeAt(value.length - 1);
      if (this._provider.TriggerCharacters.Contains(triggerChar)) {
        this._completionStartOffset = this._controller.TextEditor.Caret.Offset;
        this._startByTriggerChar = true;
        this._state = _CompletionContext.StateShow;
        this.RunInternal("");
      }
    }
  }
  async RunInternal(filter) {
    let items = await this._provider.ProvideCompletionItems(this._controller.Document, this._controller.TextEditor.Caret.Offset, filter);
    this.ShowCompletionWindow(items, "");
  }
  GetWordAtPosition(pos) {
    let lineSegment = this._controller.Document.GetLineSegment(pos.Line);
    let token = lineSegment.GetTokenAt(pos.Column);
    if (token == null)
      return null;
    let tokenType = CodeToken.GetTokenType(token);
    if (tokenType == TokenType.Comment || tokenType == TokenType.Constant || tokenType == TokenType.LiteralNumber || tokenType == TokenType.LiteralString || tokenType == TokenType.PunctuationBracket || tokenType == TokenType.PunctuationDelimiter || tokenType == TokenType.WhiteSpace || tokenType == TokenType.Operator)
      return null;
    let tokenStartColumn = CodeToken.GetTokenStartColumn(token);
    let len = pos.Column - tokenStartColumn;
    if (len <= 0)
      return null;
    let offset = lineSegment.Offset + tokenStartColumn;
    let tokenWord = this._controller.Document.GetText(offset, len);
    return new CompletionWord(offset, tokenWord);
  }
  ShowCompletionWindow(list, filter) {
    if (list == null || list.length == 0) {
      this._state = _CompletionContext.StateIdle;
      return;
    }
    if (this._completionWindow == null) {
      this._completionWindow = new PixUI.ListPopup(this._controller.Widget.Overlay, _CompletionContext.BuildPopupItem, 250, 18, 8);
      this._completionWindow.OnSelectionChanged = this.OnCompletionDone.bind(this);
    }
    this._completionWindow.DataSource = list;
    this._completionWindow.TrySelectFirst();
    let caret = this._controller.TextEditor.Caret;
    let lineHeight = this._controller.TextEditor.TextView.FontHeight;
    let pt2Win = this._controller.Widget.LocalToWindow(0, 0);
    this._completionWindow.UpdatePosition(caret.CanvasPosX + pt2Win.X - 8, caret.CanvasPosY + lineHeight + pt2Win.Y);
    this._completionWindow.Show();
  }
  HideCompletionWindow() {
    var _a;
    (_a = this._completionWindow) == null ? void 0 : _a.Hide();
    this._state = _CompletionContext.StateIdle;
  }
  UpdateFilter() {
    var _a, _b;
    let filter = this._controller.Document.GetText(this._completionStartOffset, this._controller.TextEditor.Caret.Offset - this._completionStartOffset);
    (_a = this._completionWindow) == null ? void 0 : _a.UpdateFilter((t) => t.Label.startsWith(filter));
    (_b = this._completionWindow) == null ? void 0 : _b.TrySelectFirst();
  }
  ClearFilter() {
    var _a, _b;
    (_a = this._completionWindow) == null ? void 0 : _a.ClearFilter();
    (_b = this._completionWindow) == null ? void 0 : _b.TrySelectFirst();
  }
  OnCaretChangedByNoneTextInput() {
    if (this._state != _CompletionContext.StateSuspendHide) {
      this.HideCompletionWindow();
      return;
    }
    let caret = this._controller.TextEditor.Caret;
    if (caret.Offset <= this._completionStartOffset) {
      if (caret.Offset == this._completionStartOffset && this._startByTriggerChar) {
        this._state = _CompletionContext.StateShow;
        this.ClearFilter();
      } else {
        this.HideCompletionWindow();
      }
    } else {
      this._state = _CompletionContext.StateShow;
      this.UpdateFilter();
    }
  }
  PreProcessKeyDown(e) {
    if (this._state == _CompletionContext.StateShow) {
      if (e.KeyCode == PixUI.Keys.Back)
        this._state = _CompletionContext.StateSuspendHide;
    }
  }
  OnCompletionDone(item) {
    var _a;
    this.HideCompletionWindow();
    if (item == null)
      return;
    this._controller.TextEditor.InsertOrReplaceString((_a = item.InsertText) != null ? _a : item.Label, this._controller.TextEditor.Caret.Offset - this._completionStartOffset);
  }
  static BuildPopupItem(item, index, isHover, isSelected) {
    return new CompletionItemWidget(item, isSelected);
  }
};
let CompletionContext = _CompletionContext;
__publicField(CompletionContext, "StateIdle", 0);
__publicField(CompletionContext, "StateShow", 1);
__publicField(CompletionContext, "StateSuspendHide", 2);
var CaretMode = /* @__PURE__ */ ((CaretMode2) => {
  CaretMode2[CaretMode2["InsertMode"] = 0] = "InsertMode";
  CaretMode2[CaretMode2["OverwriteMode"] = 1] = "OverwriteMode";
  return CaretMode2;
})(CaretMode || {});
class Caret {
  constructor(editor) {
    __publicField(this, "_textEditor");
    __publicField(this, "_line", 0);
    __publicField(this, "_column", 0);
    __publicField(this, "_caretPosX", 0);
    __publicField(this, "_caretPosY", 0);
    __publicField(this, "_currentPos", new TextLocation(-1, -1));
    __publicField(this, "_desiredXPos", 0);
    __publicField(this, "Mode", 0);
    __publicField(this, "PositionChanged", new System.Event());
    this._textEditor = editor;
  }
  get Line() {
    return this._line;
  }
  set Line(value) {
    if (this._line != value) {
      this._line = value;
      this.ValidateCaretPos();
      this.UpdateCaretPosition();
      this.OnPositionChanged();
    }
  }
  get Column() {
    return this._column;
  }
  set Column(value) {
    if (this._column != value) {
      this._column = value;
      this.ValidateCaretPos();
      this.UpdateCaretPosition();
      this.OnPositionChanged();
    }
  }
  get CanvasPosX() {
    return this._textEditor.TextView.Bounds.Left + this._caretPosX - this._textEditor.VirtualTop.X - 0.5;
  }
  get CanvasPosY() {
    return this._textEditor.TextView.Bounds.Top + this._caretPosY - this._textEditor.VirtualTop.Y;
  }
  get Position() {
    return new TextLocation(this._column, this._line);
  }
  set Position(value) {
    if (this._line != value.Line || this._column != value.Column) {
      this._line = value.Line;
      this._column = value.Column;
      this.UpdateCaretPosition();
      this.OnPositionChanged();
    }
  }
  get Offset() {
    return this._textEditor.Document.PositionToOffset(this.Position.Clone());
  }
  ValidatePosition(pos) {
    let line = Math.max(0, Math.min(this._textEditor.Document.TotalNumberOfLines - 1, pos.Line));
    let column = Math.max(0, pos.Column);
    if (column >= TextLocation.MaxColumn || !this._textEditor.Document.TextEditorOptions.AllowCaretBeyondEOL) {
      let lineSegment = this._textEditor.Document.GetLineSegment(line);
      column = Math.min(column, lineSegment.Length);
    }
    return new TextLocation(column, line);
  }
  ValidateCaretPos() {
    this._line = Math.max(0, Math.min(this._textEditor.Document.TotalNumberOfLines - 1, this._line));
    this._column = Math.max(0, this._column);
    if (this._column >= TextLocation.MaxColumn || !this._textEditor.Document.TextEditorOptions.AllowCaretBeyondEOL) {
      let lineSegment = this._textEditor.Document.GetLineSegment(this._line);
      this._column = Math.min(this._column, lineSegment.Length);
    }
  }
  UpdateCaretPosition() {
    this.ValidateCaretPos();
    this._caretPosX = this._textEditor.TextView.GetDrawingXPos(this._line, this._column) + this._textEditor.VirtualTop.X;
    this._caretPosY = this._textEditor.Document.GetVisibleLine(this._line) * this._textEditor.TextView.FontHeight;
  }
  OnPositionChanged() {
    this.PositionChanged.Invoke();
  }
  Paint(canvas) {
    let fontHeight = this._textEditor.TextView.FontHeight;
    let textViewArea = this._textEditor.TextView.Bounds.Clone();
    let cx = this.CanvasPosX;
    let cy = this.CanvasPosY;
    if (cx >= textViewArea.Left - 0.5) {
      let paint = PixUI.PaintUtils.Shared(this._textEditor.Theme.CaretColor);
      canvas.drawRect(PixUI.Rect.FromLTWH(cx, cy, 2, fontHeight), paint);
    }
    let bgPaint = PixUI.PaintUtils.Shared(this._textEditor.Theme.LineHighlightColor);
    canvas.drawRect(PixUI.Rect.FromLTWH(textViewArea.Left, cy, textViewArea.Width, fontHeight), bgPaint);
  }
}
class DirtyLines {
  constructor(controller) {
    __publicField(this, "_controller");
    __publicField(this, "StartLine", 0);
    __publicField(this, "EndLine", 0);
    this._controller = controller;
  }
  Merge(newArea) {
  }
  GetRect() {
    return PixUI.Rect.Empty;
  }
  IntersectsWith(child) {
    throw new System.NotSupportedException();
  }
  ToChild(child) {
    throw new System.NotSupportedException();
  }
}
class TextEditorTheme {
  constructor() {
    __publicField(this, "FontSize", 15);
    __publicField(this, "LineSpace", 2);
    __publicField(this, "CaretColor", PixUI.Colors.Red);
    __publicField(this, "LineHighlightColor", new PixUI.Color(150, 150, 150, 20));
    __publicField(this, "SelectionColor", new PixUI.Color(167, 209, 255, 50));
    __publicField(this, "TextBgColor", new PixUI.Color(4281019179));
    __publicField(this, "LineBgColor", new PixUI.Color(4281414453));
    __publicField(this, "BracketHighlightPaint", new CanvasKit.Paint());
    __publicField(this, "LineNumberColor", new PixUI.Color(4284506982));
    __publicField(this, "TextStyle", PixUI.MakeTextStyle({ color: new PixUI.Color(4289312711), heightMultiplier: 1 }));
    __publicField(this, "FoldedTextStyle", PixUI.MakeTextStyle({
      color: new PixUI.Color(4289312711),
      heightMultiplier: 1
    }));
    __publicField(this, "_tokenErrorStyle", PixUI.MakeTextStyle({ color: PixUI.Colors.Red, heightMultiplier: 1 }));
    __publicField(this, "_tokenTypeStyle", PixUI.MakeTextStyle({
      color: new PixUI.Color(4284996593),
      heightMultiplier: 1
    }));
    __publicField(this, "_tokenNumberStyle", PixUI.MakeTextStyle({
      color: new PixUI.Color(4285109949),
      heightMultiplier: 1
    }));
    __publicField(this, "_tokenStringStyle", PixUI.MakeTextStyle({
      color: new PixUI.Color(4288201593),
      heightMultiplier: 1
    }));
    __publicField(this, "_tokenKeywordStyle", PixUI.MakeTextStyle({
      color: new PixUI.Color(4291590439),
      heightMultiplier: 1
    }));
    __publicField(this, "_tokenCommentStyle", PixUI.MakeTextStyle({
      color: new PixUI.Color(4284454991),
      heightMultiplier: 1
    }));
    __publicField(this, "_tokenVariableStyle", PixUI.MakeTextStyle({
      color: new PixUI.Color(4292897909),
      heightMultiplier: 1
    }));
    __publicField(this, "_tokenFunctionStyle", PixUI.MakeTextStyle({
      color: new PixUI.Color(4294952803),
      heightMultiplier: 1
    }));
  }
  GetTokenStyle(tokenType) {
    switch (tokenType) {
      case TokenType.Error:
        return this._tokenErrorStyle;
      case TokenType.Type:
        return this._tokenTypeStyle;
      case TokenType.BuiltinType:
        return this._tokenTypeStyle;
      case TokenType.LiteralNumber:
        return this._tokenNumberStyle;
      case TokenType.LiteralString:
        return this._tokenStringStyle;
      case TokenType.Constant:
      case TokenType.Keyword:
        return this._tokenKeywordStyle;
      case TokenType.Comment:
        return this._tokenCommentStyle;
      case TokenType.Variable:
        return this._tokenVariableStyle;
      case TokenType.Function:
        return this._tokenFunctionStyle;
      default:
        return this.TextStyle;
    }
  }
}
class TextEditor {
  constructor(controller) {
    __publicField(this, "Controller");
    __publicField(this, "Caret");
    __publicField(this, "SelectionManager");
    __publicField(this, "TextView");
    __publicField(this, "LeftAreas");
    __publicField(this, "_virtualTop", PixUI.Point.Empty.Clone());
    __publicField(this, "PointerPos", PixUI.Point.Empty.Clone());
    this.Controller = controller;
    this.Controller.Document.UndoStack.TextEditor = this;
    this.Caret = new Caret(this);
    this.SelectionManager = new SelectionManager(this);
    this.TextView = new TextView(this);
    this.LeftAreas = [new GutterArea(this), new FoldArea(this)];
  }
  get Theme() {
    return this.Controller.Theme;
  }
  get Document() {
    return this.Controller.Document;
  }
  get VirtualTop() {
    return this._virtualTop;
  }
  set VirtualTop(value) {
    let newVirtualTop = new PixUI.Point(Math.max(0, value.X), Math.min(this.MaxVScrollValue, Math.max(0, value.Y)));
    if (System.OpInequality(this._virtualTop, newVirtualTop))
      this._virtualTop = newVirtualTop.Clone();
  }
  get MaxVScrollValue() {
    return (this.Document.GetVisibleLine(this.Document.TotalNumberOfLines - 1) + 1 + this.TextView.VisibleLineCount * 2 / 3) * this.TextView.FontHeight;
  }
  InsertOrReplaceString(text, replaceOffset = 0) {
    this.Document.UndoStack.StartUndoGroup();
    if (this.Document.TextEditorOptions.DocumentSelectionMode == DocumentSelectionMode.Normal && this.SelectionManager.HasSomethingSelected) {
      this.Caret.Position = this.SelectionManager.SelectionCollection[0].StartPosition.Clone();
      this.SelectionManager.RemoveSelectedText();
    }
    let caretLine = this.Document.GetLineSegment(this.Caret.Line);
    if (caretLine.Length < this.Caret.Column) {
      let whiteSpaceLength = this.Caret.Column - caretLine.Length;
      text = " ".repeat(whiteSpaceLength) + text;
    }
    if (replaceOffset == 0) {
      this.Document.Insert(this.Caret.Offset, text);
      this.Caret.Position = this.Document.OffsetToPosition(this.Caret.Offset + text.length);
    } else {
      this.Document.Replace(this.Caret.Offset - replaceOffset, replaceOffset, text);
      if (replaceOffset == text.length) {
        this.Caret.UpdateCaretPosition();
      } else {
        this.Caret.Position = new TextLocation(this.Caret.Position.Column - replaceOffset + text.length, this.Caret.Position.Line);
      }
    }
    this.Document.UndoStack.EndUndoGroup();
  }
  DeleteSelection() {
    if (this.SelectionManager.SelectionIsReadonly)
      return;
    this.Caret.Position = this.SelectionManager.SelectionCollection[0].StartPosition.Clone();
    this.SelectionManager.RemoveSelectedText();
  }
  Paint(canvas, size, dirtyArea) {
    let currentXPos = 0;
    let currentYPos = 0;
    for (const area of this.LeftAreas) {
      if (!area.IsVisible)
        continue;
      let areaRect = PixUI.Rect.FromLTWH(currentXPos, currentYPos, area.Size.Width, size.Height - currentYPos);
      if (System.OpInequality(areaRect, area.Bounds)) {
        area.Bounds = areaRect.Clone();
      }
      currentXPos += area.Bounds.Width;
      area.Paint(canvas, areaRect.Clone());
    }
    let textRect = PixUI.Rect.FromLTWH(currentXPos, currentYPos, size.Width - currentXPos, size.Height - currentYPos);
    if (System.OpInequality(textRect, this.TextView.Bounds)) {
      this.TextView.Bounds = textRect.Clone();
    }
    this.TextView.Paint(canvas, textRect.Clone());
  }
}
class EditorDecorator extends PixUI.Widget {
  constructor(codeEditor) {
    super();
    __publicField(this, "_codeEditor");
    this._codeEditor = codeEditor;
  }
  Layout(availableWidth, availableHeight) {
    this.SetSize(0, 0);
  }
  Paint(canvas, area = null) {
    let textEditor = this._codeEditor.Controller.TextEditor;
    canvas.save();
    let pt2Win = this._codeEditor.LocalToWindow(0, 0);
    canvas.translate(pt2Win.X, pt2Win.Y);
    canvas.clipRect(textEditor.TextView.Bounds, CanvasKit.ClipOp.Intersect, false);
    textEditor.Caret.Paint(canvas);
    let textView = textEditor.TextView;
    let paint = PixUI.PaintUtils.Shared(textEditor.Theme.SelectionColor);
    for (const selection of textEditor.SelectionManager.SelectionCollection) {
      let startLine = selection.StartPosition.Line;
      let endLine = selection.EndPosition.Line;
      for (let i = startLine; i <= endLine; i++) {
        if (!textEditor.Document.FoldingManager.IsLineVisible(i))
          continue;
        let startXPos = 0;
        let endXPos = 0;
        if (i == startLine) {
          startXPos = textView.GetDrawingXPos(i, selection.StartPosition.Column);
          if (i == endLine)
            endXPos = textView.GetDrawingXPos(i, selection.EndPosition.Column);
          else
            endXPos = textView.Bounds.Width;
        } else if (i == endLine) {
          endXPos = textView.GetDrawingXPos(i, selection.EndPosition.Column);
        } else {
          endXPos = textView.Bounds.Width;
        }
        let yPos = textView.Bounds.Top + textEditor.Document.GetVisibleLine(i) * textView.FontHeight - textEditor.VirtualTop.Y;
        canvas.drawRect(PixUI.Rect.FromLTWH(startXPos + textView.Bounds.Left, yPos, endXPos - startXPos, textView.FontHeight), paint);
      }
    }
    canvas.restore();
  }
}
class CodeEditorController extends PixUI.WidgetController {
  constructor(fileName, content, completionProvider = null, tag = null) {
    super();
    __publicField(this, "Document");
    __publicField(this, "TextEditor");
    __publicField(this, "Theme");
    __publicField(this, "_completionContext");
    __publicField(this, "ContextMenuBuilder");
    __publicField(this, "_editActions", new System.Dictionary().Init([
      [PixUI.Keys.Left, new CaretLeft()],
      [PixUI.Keys.Right, new CaretRight()],
      [PixUI.Keys.Up, new CaretUp()],
      [PixUI.Keys.Down, new CaretDown()],
      [PixUI.Keys.Back, new BackspaceCommand()],
      [PixUI.Keys.Return, new ReturnCommand()],
      [PixUI.Keys.Tab, new TabCommand()],
      [PixUI.Keys.Control | PixUI.Keys.C, new CopyCommand()],
      [PixUI.Keys.Control | PixUI.Keys.X, new CutCommand()],
      [PixUI.Keys.Control | PixUI.Keys.V, new PasteCommand()],
      [PixUI.Keys.Control | PixUI.Keys.Z, new UndoCommand()],
      [PixUI.Keys.Control | PixUI.Keys.Y, new RedoCommand()]
    ]));
    __publicField(this, "_mouseDownPos", PixUI.Point.Empty.Clone());
    __publicField(this, "_gotMouseDown", false);
    __publicField(this, "_doDragDrop", false);
    __publicField(this, "_minSelection", TextLocation.Empty.Clone());
    __publicField(this, "_maxSelection", TextLocation.Empty.Clone());
    __publicField(this, "_caretChangedByTextInput", false);
    this.Theme = new TextEditorTheme();
    this.Document = new Document(fileName, tag);
    this.TextEditor = new TextEditor(this);
    this._completionContext = new CompletionContext(this, completionProvider);
    this.Document.TextContent = content;
    this.Document.DocumentChanged.Add(this._OnDocumentChanged, this);
    this.TextEditor.Caret.PositionChanged.Add(this._OnCaretPositionChanged, this);
  }
  OnPointerDown(e) {
    this.TextEditor.PointerPos.X = e.X;
    this.TextEditor.PointerPos.Y = e.Y;
    for (const area of this.TextEditor.LeftAreas) {
      if (area.Bounds.ContainsPoint(e.X, e.Y))
        area.HandlePointerDown(e.X, e.Y, e.Buttons);
    }
    if (this.TextEditor.TextView.Bounds.ContainsPoint(e.X, e.Y)) {
      this._gotMouseDown = true;
      this.TextEditor.SelectionManager.SelectFrom.Where = WhereFrom.TextArea;
      this._mouseDownPos = new PixUI.Point(e.X, e.Y);
      this._minSelection = TextLocation.Empty.Clone();
      this._maxSelection = TextLocation.Empty.Clone();
      this.TextEditor.TextView.HandlePointerDown(e.X, e.Y, e.Buttons);
    }
  }
  OnPointerUp(e) {
    this.TextEditor.SelectionManager.SelectFrom.Where = WhereFrom.None;
    this._gotMouseDown = false;
    this._mouseDownPos = new PixUI.Point(-1, -1);
  }
  OnPointerMove(e) {
    this.TextEditor.PointerPos.X = e.X;
    this.TextEditor.PointerPos.Y = e.Y;
    if (e.Buttons == PixUI.PointerButtons.Left) {
      if (this._gotMouseDown && this.TextEditor.SelectionManager.SelectFrom.Where == WhereFrom.TextArea) {
        this.ExtendSelectionToPointer();
      }
    }
  }
  OnScroll(dx, dy) {
    let oldX = this.TextEditor.VirtualTop.X;
    let oldY = this.TextEditor.VirtualTop.Y;
    this.TextEditor.VirtualTop = new PixUI.Point(oldX + dx, oldY + dy);
    let offset = new PixUI.Offset(this.TextEditor.VirtualTop.X - oldX, this.TextEditor.VirtualTop.Y - oldY);
    if (offset.Dx != 0 || offset.Dy != 0)
      this.Widget.RequestInvalidate(true, null);
    return offset;
  }
  OnKeyDown(e) {
    let cmd;
    this._completionContext.PreProcessKeyDown(e);
    if (this._editActions.TryGetValue(Math.floor(e.KeyData) & 4294967295, new System.Out(() => cmd, ($v) => cmd = $v))) {
      cmd.Execute(this.TextEditor);
      e.StopPropagate();
    }
  }
  OnTextInput(text) {
    this._caretChangedByTextInput = true;
    let closingPair = text.length == 1 ? this.Document.SyntaxParser.Language.GetAutoColsingPairs(text.charCodeAt(0)) : null;
    if (closingPair == null) {
      this.TextEditor.InsertOrReplaceString(text, 0);
    } else {
      this.TextEditor.InsertOrReplaceString(text + String.fromCharCode(closingPair).repeat(1), 0);
      let oldPosition = this.TextEditor.Caret.Position.Clone();
      this.TextEditor.Caret.Position = new TextLocation(oldPosition.Column - 1, oldPosition.Line);
    }
    this._caretChangedByTextInput = false;
    this._completionContext.RunCompletion(text);
  }
  ExtendSelectionToPointer() {
    let mousePos = this.TextEditor.PointerPos.Clone();
    let realMousePos = this.TextEditor.TextView.GetLogicalPosition(Math.max(0, mousePos.X - this.TextEditor.TextView.Bounds.Left), mousePos.Y - this.TextEditor.TextView.Bounds.Top);
    realMousePos.Line;
    let oldPos = this.TextEditor.Caret.Position.Clone();
    if (System.OpEquality(oldPos, realMousePos) && this.TextEditor.SelectionManager.SelectFrom.Where != WhereFrom.Gutter)
      return;
    if (this.TextEditor.SelectionManager.SelectFrom.Where == WhereFrom.Gutter) {
      if (realMousePos.Line < this.TextEditor.SelectionManager.SelectionStart.Line) {
        this.TextEditor.Caret.Position = new TextLocation(0, realMousePos.Line);
      } else {
        this.TextEditor.Caret.Position = this.TextEditor.SelectionManager.NextValidPosition(realMousePos.Line);
      }
    } else {
      this.TextEditor.Caret.Position = realMousePos.Clone();
    }
    if (!this._minSelection.IsEmpty && this.TextEditor.SelectionManager.HasSomethingSelected && this.TextEditor.SelectionManager.SelectFrom.Where == WhereFrom.TextArea) {
      this.TextEditor.SelectionManager.SelectionCollection[0];
      let min = (SelectionManager.GreaterEqPos(this._minSelection.Clone(), this._maxSelection.Clone()) ? this._maxSelection : this._minSelection).Clone();
      let max = (SelectionManager.GreaterEqPos(this._minSelection.Clone(), this._maxSelection.Clone()) ? this._minSelection : this._maxSelection).Clone();
      if (SelectionManager.GreaterEqPos(max.Clone(), realMousePos.Clone()) && SelectionManager.GreaterEqPos(realMousePos.Clone(), min.Clone())) {
        this.TextEditor.SelectionManager.SetSelection(min.Clone(), max.Clone());
      } else if (SelectionManager.GreaterEqPos(max.Clone(), realMousePos.Clone())) {
        let moff = this.TextEditor.Document.PositionToOffset(realMousePos.Clone());
        min = this.TextEditor.Document.OffsetToPosition(CodeEditorController.FindWordStart(this.TextEditor.Document, moff));
        this.TextEditor.SelectionManager.SetSelection(min.Clone(), max.Clone());
      } else {
        let moff = this.TextEditor.Document.PositionToOffset(realMousePos.Clone());
        max = this.TextEditor.Document.OffsetToPosition(CodeEditorController.FindWordEnd(this.TextEditor.Document, moff));
        this.TextEditor.SelectionManager.SetSelection(min.Clone(), max.Clone());
      }
    } else {
      this.TextEditor.SelectionManager.ExtendSelection(oldPos.Clone(), this.TextEditor.Caret.Position.Clone());
    }
  }
  _OnDocumentChanged(e) {
    this.Widget.RequestInvalidate(true, null);
  }
  _OnCaretPositionChanged() {
    if (!this._caretChangedByTextInput) {
      this._completionContext.OnCaretChangedByNoneTextInput();
    }
    this.Widget.RequestInvalidate(false, null);
  }
  SetCaret(line, column) {
    this.TextEditor.Caret.Position = new TextLocation(column, line);
  }
  SetSelection(start, end) {
    this.TextEditor.SelectionManager.SetSelection(start.Clone(), end.Clone());
  }
  static IsSelectableChar(c) {
    return !CodeEditorController.IsWhiteSpace(c);
  }
  static IsWhiteSpace(c) {
    return c == 32;
  }
  static FindWordStart(document, offset) {
    let line = document.GetLineSegmentForOffset(offset);
    if (offset > 0 && CodeEditorController.IsWhiteSpace(document.GetCharAt(offset - 1)) && CodeEditorController.IsWhiteSpace(document.GetCharAt(offset))) {
      while (offset > line.Offset && CodeEditorController.IsWhiteSpace(document.GetCharAt(offset - 1))) {
        --offset;
      }
    } else if (CodeEditorController.IsSelectableChar(document.GetCharAt(offset)) || offset > 0 && CodeEditorController.IsWhiteSpace(document.GetCharAt(offset)) && CodeEditorController.IsSelectableChar(document.GetCharAt(offset - 1))) {
      while (offset > line.Offset && CodeEditorController.IsSelectableChar(document.GetCharAt(offset - 1))) {
        --offset;
      }
    } else {
      if (offset > 0 && !CodeEditorController.IsWhiteSpace(document.GetCharAt(offset - 1)) && !CodeEditorController.IsSelectableChar(document.GetCharAt(offset - 1))) {
        return Math.max(0, offset - 1);
      }
    }
    return offset;
  }
  static FindWordEnd(document, offset) {
    let line = document.GetLineSegmentForOffset(offset);
    if (line.Length == 0)
      return offset;
    let endPos = line.Offset + line.Length;
    offset = Math.min(offset, endPos - 1);
    if (CodeEditorController.IsSelectableChar(document.GetCharAt(offset))) {
      while (offset < endPos && CodeEditorController.IsSelectableChar(document.GetCharAt(offset))) {
        ++offset;
      }
    } else if (CodeEditorController.IsWhiteSpace(document.GetCharAt(offset))) {
      if (offset > 0 && CodeEditorController.IsWhiteSpace(document.GetCharAt(offset - 1))) {
        while (offset < endPos && CodeEditorController.IsWhiteSpace(document.GetCharAt(offset))) {
          ++offset;
        }
      }
    } else {
      return Math.max(0, offset + 1);
    }
    return offset;
  }
}
class CodeEditorWidget extends PixUI.Widget {
  constructor(controller) {
    super();
    __publicField(this, "Controller");
    __publicField(this, "_decoration");
    __privateAdd(this, _MouseRegion, void 0);
    __privateAdd(this, _FocusNode, void 0);
    this.MouseRegion = new PixUI.MouseRegion();
    this.FocusNode = new PixUI.FocusNode();
    this.Controller = controller;
    this.Controller.AttachWidget(this);
    this._decoration = new EditorDecorator(this);
    this.MouseRegion.PointerDown.Add(this.Controller.OnPointerDown, this.Controller);
    this.MouseRegion.PointerUp.Add(this.Controller.OnPointerUp, this.Controller);
    this.MouseRegion.PointerMove.Add(this.Controller.OnPointerMove, this.Controller);
    this.FocusNode.FocusChanged.Add(this._OnFocusChanged, this);
    this.FocusNode.KeyDown.Add(this.Controller.OnKeyDown, this.Controller);
    this.FocusNode.TextInput.Add(this.Controller.OnTextInput, this.Controller);
  }
  get MouseRegion() {
    return __privateGet(this, _MouseRegion);
  }
  set MouseRegion(value) {
    __privateSet(this, _MouseRegion, value);
  }
  get FocusNode() {
    return __privateGet(this, _FocusNode);
  }
  set FocusNode(value) {
    __privateSet(this, _FocusNode, value);
  }
  get ScrollOffsetX() {
    return this.Controller.TextEditor.VirtualTop.X;
  }
  get ScrollOffsetY() {
    return this.Controller.TextEditor.VirtualTop.Y;
  }
  RequestInvalidate(all, dirtyArea) {
    if (all)
      this.Invalidate(PixUI.InvalidAction.Repaint, dirtyArea);
    else
      this._decoration.Invalidate(PixUI.InvalidAction.Repaint);
  }
  _OnFocusChanged(focused) {
    if (focused)
      this.Root.Window.StartTextInput();
    else
      this.Root.Window.StopTextInput();
  }
  OnScroll(dx, dy) {
    return this.Controller.OnScroll(dx, dy);
  }
  OnMounted() {
    this.Overlay.Show(this._decoration);
    super.OnMounted();
  }
  OnUnmounted() {
    if (this._decoration.Parent != null)
      this._decoration.Parent.Remove(this._decoration);
    super.OnUnmounted();
  }
  get IsOpaque() {
    return true;
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    this.SetSize(width, height);
  }
  Paint(canvas, area = null) {
    let clipRect = PixUI.Rect.FromLTWH(0, 0, this.W, this.H);
    canvas.save();
    canvas.clipRect(clipRect, CanvasKit.ClipOp.Intersect, false);
    this.Controller.TextEditor.Paint(canvas, new PixUI.Size(this.W, this.H), area);
    canvas.restore();
  }
}
_MouseRegion = new WeakMap();
_FocusNode = new WeakMap();
__publicField(CodeEditorWidget, "$meta_PixUI_IMouseRegion", true);
__publicField(CodeEditorWidget, "$meta_PixUI_IFocusable", true);
__publicField(CodeEditorWidget, "$meta_PixUI_IScrollable", true);
class TSCSharpLanguage {
  static Init(csharp) {
    this._csharp = csharp;
  }
  static Get() {
    return this._csharp;
  }
}
__publicField(TSCSharpLanguage, "_csharp");
export { AnchorMovementType, BackspaceCommand, BracketHighlightingStyle, BracketMatchingStyle, CSharpLanguage, CachedFoldInfo, Caret, CaretDown, CaretLeft, CaretMode, CaretRight, CaretUp, CodeEditorController, CodeEditorWidget, CodeToken, ColumnRange, CompletionContext, CompletionItemKind, CompletionItemWidget, CompletionWord, CompositeNode, CopyCommand, CustomEditCommand, CutCommand, DeferredEventList, DelimiterSegment, DirtyLines, Document, DocumentEventArgs, DocumentSelectionMode, EditorArea, EditorDecorator, EndComparer, FoldArea, FoldMarker, FoldType, FoldingManager, GutterArea, ImmutableText, ImmutableTextBuffer, IndentStyle, InnerLeaf, LeafNode, LineCountChangeEventArgs, LineEventArgs, LineLengthChangeEventArgs, LineManager, LineSegment, LineSegmentTree, LineViewerStyle, LinesEnumerator, LogicalColumnInfo, Node, ParserInput, PasteCommand, RBHost, RBNode, RedBlackTree, RedBlackTreeIterator, RedBlackTreeNode, RedoCommand, ReturnCommand, SelectFrom, Selection, SelectionManager, StartComparer, SyntaxParser, TSCSharpLanguage, TSEdit, TSPoint, TabCommand, TextAnchor, TextEditor, TextEditorOptions, TextEditorTheme, TextLocation, TextUtils, TextView, TokenType, UndoCommand, UndoQueue, UndoStack, UndoableDelete, UndoableInsert, UndoableReplace, UndoableSetCaretPosition, WhereFrom };
