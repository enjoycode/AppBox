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
var _Loading, _Image, _IsHandled, _FocusedWidget, _LastHitWidget, _KeyData, _Buttons, _X, _Y, _DeltaX, _DeltaY, _X2, _Y2, _Dx, _Dy, _Tolerance2, _LastElapsedDuration, _BorderSide2, _BorderRadius2, _GapPadding, _Widget2, _X3, _Y3, _W, _H, _Window, _Flex, _Route, _Navigator, _Text, _MouseRegion, _FocusNode, _MouseRegion2, _FocusNode2, _MouseRegion3, _Window2, _MouseRegion4, _MouseRegion5, _FocusNode3, _MouseRegion6, _Type, _Children, _MouseRegion7, _MouseRegion8, _SelectedIndex, _Scrollable, _MouseRegion9, _TreeView2, _LoadingPainter, _MouseRegion10, _HeaderRows, _HeaderRowHeight, _HasFrozen, _Type2, _Value, _MinValue, _Current, _Window3, _Canvas, _Current2, _LastMouseX, _LastMouseY;
import * as System from "/System.js";
import { List } from "/System.js";
const _Color = class extends Float32Array {
  constructor(a1, a2, a3, a4) {
    super([0, 0, 0, 0]);
    if (a2 !== void 0 && a3 !== void 0) {
      this[0] = _Color.clamp(a1) / 255;
      this[1] = _Color.clamp(a2) / 255;
      this[2] = _Color.clamp(a3) / 255;
      this[3] = a4 === void 0 ? 1 : _Color.clamp(a4) / 255;
    } else {
      this[0] = (a1 >> 16 & 255) / 255;
      this[1] = (a1 >> 8 & 255) / 255;
      this[2] = (a1 & 255) / 255;
      this[3] = (a1 >> 24 & 255) / 255;
    }
  }
  static clamp(c) {
    return Math.round(Math.max(0, Math.min(c || 0, 255)));
  }
  get obs() {
    return new Rx(this);
  }
  get Red() {
    return this[0] * 255;
  }
  get Green() {
    return this[1] * 255;
  }
  get Blue() {
    return this[2] * 255;
  }
  get Alpha() {
    return this[3] * 255;
  }
  get IsOpaque() {
    return Math.floor(this.Alpha) == 255;
  }
  WithAlpha(alpha) {
    return new _Color(this.Red, this.Green, this.Blue, alpha);
  }
  Clone() {
    return new _Color(this.Red, this.Green, this.Blue, this.Alpha);
  }
  static Lerp(a, b, t) {
    return ColorUtils.Lerp(a, b, t);
  }
};
let Color = _Color;
__publicField(Color, "Empty", new _Color(0));
const _Point = class extends Float32Array {
  constructor(x, y) {
    super([0, 0]);
    if (x !== void 0 && y !== void 0) {
      this[0] = x;
      this[1] = y;
    }
  }
  get X() {
    return this[0];
  }
  set X(value) {
    this[0] = value;
  }
  get Y() {
    return this[1];
  }
  set Y(value) {
    this[1] = value;
  }
  Offset(dx, dy) {
    this[0] += dx;
    this[1] += dy;
  }
  Clone() {
    return new _Point(this.X, this.Y);
  }
  static op_Equality(a, b) {
    return a.X === b.X && a.Y === b.Y;
  }
};
let Point = _Point;
__publicField(Point, "Empty", new _Point());
class Size {
  constructor(width, height) {
    __publicField(this, "Width");
    __publicField(this, "Height");
    this.Width = width;
    this.Height = height;
  }
  Clone() {
    return new Size(this.Width, this.Height);
  }
}
const _Rect = class extends Float32Array {
  constructor(left, top, right, bottom) {
    super([0, 0, 0, 0]);
    if (left !== void 0 && top !== void 0 && right !== void 0 && bottom !== void 0) {
      this[0] = left;
      this[1] = top;
      this[2] = right;
      this[3] = bottom;
    }
  }
  static FromLTWH(left, top, width, height) {
    return new _Rect(left, top, width + left, height + top);
  }
  get Left() {
    return this[0];
  }
  get Top() {
    return this[1];
  }
  get Right() {
    return this[2];
  }
  get Bottom() {
    return this[3];
  }
  get Width() {
    return this[2] - this[0];
  }
  get Height() {
    return this[3] - this[1];
  }
  get IsEmpty() {
    return _Rect.op_Equality(this, _Rect.Empty);
  }
  ContainsPoint(x, y) {
    return x >= this.Left && x < this.Right && y >= this.Top && y < this.Bottom;
  }
  Offset(x, y) {
    this[0] += x;
    this[1] += y;
    this[2] += x;
    this[3] += y;
  }
  IntersectTo(other) {
    if (!this.IntersectsWith(other.Left, other.Top, other.Width, other.Height)) {
      this[0] = 0;
      this[1] = 0;
      this[2] = 0;
      this[3] = 0;
      return;
    }
    this[0] = Math.max(this.Left, other.Left);
    this[1] = Math.max(this.Top, other.Top);
    this[2] = Math.min(this.Right, other.Right);
    this[3] = Math.min(this.Bottom, other.Bottom);
  }
  IntersectsWith(x, y, w, h) {
    return this.Left < x + w && this.Right > x && this.Top < y + h && this.Bottom > y;
  }
  Clone() {
    return new _Rect(this.Left, this.Top, this.Right, this.Bottom);
  }
  static op_Equality(a, b) {
    return a.Left === b.Left && a.Top === b.Top && a.Right === b.Right && a.Bottom === b.Bottom;
  }
};
let Rect = _Rect;
__publicField(Rect, "Empty", new _Rect());
class RRect extends Float32Array {
  static FromRectAndCorner(rect, topLeft = null, topRight = null, bottomLeft = null, bottomRight = null) {
    let res = new RRect();
    res[0] = rect.Left;
    res[1] = rect.Top;
    res[2] = rect.Right;
    res[3] = rect.Bottom;
    res.SetRadius(4, topLeft);
    res.SetRadius(6, topRight);
    res.SetRadius(8, bottomRight);
    res.SetRadius(10, bottomLeft);
    return res;
  }
  static FromRectAndRadius(rect, radiusX, radiusY) {
    let res = new RRect();
    res[0] = rect.Left;
    res[1] = rect.Top;
    res[2] = rect.Right;
    res[3] = rect.Bottom;
    res[4] = radiusX;
    res[5] = radiusY;
    res[6] = radiusX;
    res[7] = radiusY;
    res[8] = radiusX;
    res[9] = radiusY;
    res[10] = radiusX;
    res[11] = radiusY;
    return res;
  }
  static FromCopy(from) {
    let res = new RRect();
    for (let i = 0; i < 12; i++) {
      res[i] = from[i];
    }
    return res;
  }
  constructor() {
    super([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  SetRadius(index, radius) {
    if (radius != null) {
      this[index] = radius.X;
      this[index + 1] = radius.Y;
    }
  }
  Inflate(dx, dy) {
    this[0] -= dx;
    this[1] -= dy;
    this[2] += dx;
    this[3] += dy;
    this[4] += dx;
    this[5] += dy;
    this[6] += dx;
    this[7] += dy;
    this[8] += dx;
    this[9] += dy;
    this[10] += dx;
    this[11] += dy;
  }
  Deflate(dx, dy) {
    this.Inflate(-dx, -dy);
  }
  Shift(dx, dy) {
    this[0] += dx;
    this[1] += dy;
    this[2] += dx;
    this[3] += dy;
  }
}
class Vector4 extends Float32Array {
  constructor(v1, v2, v3, v4) {
    super([v1, v2, v3, v4]);
  }
  Clone() {
    return new Vector4(this[0], this[1], this[2], this[3]);
  }
}
const _Matrix4 = class extends Float32Array {
  constructor(m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15) {
    super([m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15]);
  }
  static CreateEmpty() {
    return new _Matrix4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
  static CreateIdentity() {
    return new _Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  static CreateTranslation(x, y, z) {
    return new _Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1);
  }
  static CreateScale(x, y, z) {
    return new _Matrix4(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
  }
  static TryInvert(other) {
    let res = _Matrix4.CreateEmpty();
    let determinant = res.CopyInverse(other);
    return determinant == 0 ? null : res;
  }
  Translate(x, y = 0, z = 0) {
    this[12] = this[0] * x + this[4] * y + this[8] * z + this[12];
    this[13] = this[1] * x + this[5] * y + this[9] * z + this[13];
    this[14] = this[2] * x + this[6] * y + this[10] * z + this[14];
    this[15] = this[3] * x + this[7] * y + this[11] * z + this[15];
  }
  Scale(x, y = 1, z = 1) {
    this[0] *= x;
    this[1] *= x;
    this[2] *= x;
    this[3] *= x;
    this[4] *= y;
    this[5] *= y;
    this[6] *= y;
    this[7] *= y;
    this[8] *= z;
    this[9] *= z;
    this[10] *= z;
    this[11] *= z;
  }
  RotateZ(angle) {
    let cosAngle = Math.cos(angle);
    let sinAngle = Math.sin(angle);
    let t1 = this[0] * cosAngle + this[4] * sinAngle;
    let t2 = this[1] * cosAngle + this[5] * sinAngle;
    let t3 = this[2] * cosAngle + this[6] * sinAngle;
    let t4 = this[3] * cosAngle + this[7] * sinAngle;
    let t5 = this[0] * -sinAngle + this[4] * cosAngle;
    let t6 = this[1] * -sinAngle + this[5] * cosAngle;
    let t7 = this[2] * -sinAngle + this[6] * cosAngle;
    let t8 = this[3] * -sinAngle + this[7] * cosAngle;
    this[0] = t1;
    this[1] = t2;
    this[2] = t3;
    this[3] = t4;
    this[4] = t5;
    this[5] = t6;
    this[6] = t7;
    this[7] = t8;
  }
  Multiply(other) {
    let aM0 = this[0];
    let aM4 = this[4];
    let aM8 = this[8];
    let aM12 = this[12];
    let aM1 = this[1];
    let aM5 = this[5];
    let aM9 = this[9];
    let aM13 = this[13];
    let aM2 = this[2];
    let aM6 = this[6];
    let aM10 = this[10];
    let aM14 = this[14];
    let aM3 = this[3];
    let aM7 = this[7];
    let aM11 = this[11];
    let aM15 = this[15];
    let bM0 = other[0];
    let bM4 = other[4];
    let bM8 = other[8];
    let bM12 = other[12];
    let bM1 = other[1];
    let bM5 = other[5];
    let bM9 = other[9];
    let bM13 = other[13];
    let bM2 = other[2];
    let bM6 = other[6];
    let bM10 = other[10];
    let bM14 = other[14];
    let bM3 = other[3];
    let bM7 = other[7];
    let bM11 = other[11];
    let bM15 = other[15];
    this[0] = aM0 * bM0 + aM4 * bM1 + aM8 * bM2 + aM12 * bM3;
    this[4] = aM0 * bM4 + aM4 * bM5 + aM8 * bM6 + aM12 * bM7;
    this[8] = aM0 * bM8 + aM4 * bM9 + aM8 * bM10 + aM12 * bM11;
    this[12] = aM0 * bM12 + aM4 * bM13 + aM8 * bM14 + aM12 * bM15;
    this[1] = aM1 * bM0 + aM5 * bM1 + aM9 * bM2 + aM13 * bM3;
    this[5] = aM1 * bM4 + aM5 * bM5 + aM9 * bM6 + aM13 * bM7;
    this[9] = aM1 * bM8 + aM5 * bM9 + aM9 * bM10 + aM13 * bM11;
    this[13] = aM1 * bM12 + aM5 * bM13 + aM9 * bM14 + aM13 * bM15;
    this[2] = aM2 * bM0 + aM6 * bM1 + aM10 * bM2 + aM14 * bM3;
    this[6] = aM2 * bM4 + aM6 * bM5 + aM10 * bM6 + aM14 * bM7;
    this[10] = aM2 * bM8 + aM6 * bM9 + aM10 * bM10 + aM14 * bM11;
    this[14] = aM2 * bM12 + aM6 * bM13 + aM10 * bM14 + aM14 * bM15;
    this[3] = aM3 * bM0 + aM7 * bM1 + aM11 * bM2 + aM15 * bM3;
    this[7] = aM3 * bM4 + aM7 * bM5 + aM11 * bM6 + aM15 * bM7;
    this[11] = aM3 * bM8 + aM7 * bM9 + aM11 * bM10 + aM15 * bM11;
    this[15] = aM3 * bM12 + aM7 * bM13 + aM11 * bM14 + aM15 * bM15;
  }
  PreConcat(other) {
    let res = other.Clone();
    res.Multiply(this);
    this.CopyFrom(res);
  }
  CopyInverse(other) {
    let a00 = other[0];
    let a01 = other[1];
    let a02 = other[2];
    let a03 = other[3];
    let a10 = other[4];
    let a11 = other[5];
    let a12 = other[6];
    let a13 = other[7];
    let a20 = other[8];
    let a21 = other[9];
    let a22 = other[10];
    let a23 = other[11];
    let a30 = other[12];
    let a31 = other[13];
    let a32 = other[14];
    let a33 = other[15];
    let b00 = a00 * a11 - a01 * a10;
    let b01 = a00 * a12 - a02 * a10;
    let b02 = a00 * a13 - a03 * a10;
    let b03 = a01 * a12 - a02 * a11;
    let b04 = a01 * a13 - a03 * a11;
    let b05 = a02 * a13 - a03 * a12;
    let b06 = a20 * a31 - a21 * a30;
    let b07 = a20 * a32 - a22 * a30;
    let b08 = a20 * a33 - a23 * a30;
    let b09 = a21 * a32 - a22 * a31;
    let b10 = a21 * a33 - a23 * a31;
    let b11 = a22 * a33 - a23 * a32;
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (det == 0) {
      this.CopyFrom(other);
      return 0;
    }
    let invDet = 1 / det;
    this[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
    this[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
    this[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
    this[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
    this[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
    this[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
    this[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
    this[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
    this[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
    this[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
    this[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
    this[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
    this[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
    this[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
    this[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
    this[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;
    return det;
  }
  CopyFrom(other) {
    for (let i = 0; i < 16; i++) {
      this[i] = other[i];
    }
  }
  Clone() {
    let clone = _Matrix4.CreateEmpty();
    clone.CopyFrom(this);
    return clone;
  }
  static GetIndex(row, col) {
    return col * 4 + row;
  }
  SetRow(row, arg) {
    this[_Matrix4.GetIndex(row, 0)] = arg[0];
    this[_Matrix4.GetIndex(row, 1)] = arg[1];
    this[_Matrix4.GetIndex(row, 2)] = arg[2];
    this[_Matrix4.GetIndex(row, 3)] = arg[3];
  }
  SetColumn(column, arg) {
    let entry = column * 4;
    this[entry + 3] = arg[3];
    this[entry + 2] = arg[2];
    this[entry + 1] = arg[1];
    this[entry] = arg[0];
  }
  TransponseTo() {
    return new _Matrix4(this[0], this[4], this[8], this[12], this[1], this[5], this[9], this[13], this[2], this[6], this[10], this[14], this[3], this[7], this[11], this[15]);
  }
  static op_Equality(a, b) {
    for (let i = 0; i < 16; i++) {
      if (a[i] != b[i])
        return false;
    }
    return true;
  }
};
let Matrix4 = _Matrix4;
__publicField(Matrix4, "Empty", _Matrix4.CreateEmpty());
class MatrixUtils {
  static GetAsTranslation(transform) {
    if (transform[0] == 1 && transform[1] == 0 && transform[2] == 0 && transform[3] == 0 && transform[4] == 0 && transform[5] == 1 && transform[6] == 0 && transform[7] == 0 && transform[8] == 0 && transform[9] == 0 && transform[10] == 1 && transform[11] == 0 && transform[14] == 0 && transform[15] == 1) {
      return new Offset(transform[12], transform[13]);
    }
    return null;
  }
  static TransformPoint(transform, x, y) {
    let rx = transform[0] * x + transform[4] * y + transform[12];
    let ry = transform[1] * x + transform[5] * y + transform[13];
    let rw = transform[3] * x + transform[7] * y + transform[15];
    return rw == 1 ? new Offset(rx, ry) : new Offset(rx / rw, ry / rw);
  }
}
class TextBox {
  constructor() {
    __publicField(this, "Rect");
    __publicField(this, "Direction");
  }
  Clone() {
    let clone = new TextBox();
    clone.Rect = this.Rect;
    clone.Direction = this.Direction;
    return clone;
  }
}
const ckDefaultShadowFlags = 4;
const ckTransparentOccluderShadowFlags = 4 | 1;
const ckShadowAmbientAlpha = 0.039;
const ckShadowSpotAlpha = 0.25;
const ckShadowLightRadius = 1.1;
const ckShadowLightHeight = 600;
const ckShadowLightXOffset = 0;
const ckShadowLightYOffset = -450;
function GetRectForPosition(ph, pos, heightStyle, widthStyle) {
  let list = ph.getRectsForRange(pos, pos + 1, heightStyle, widthStyle);
  let res = new TextBox();
  res.Rect = new Rect(list[0][0], list[0][1], list[0][2], list[0][3]);
  res.Direction = list[0].direction === 1 ? CanvasKit.TextDirection.LTR : CanvasKit.TextDirection.RTL;
  return res;
}
function DrawShadow(canvas, path, color, elevation, transparentOccluder, devicePixelRatio) {
  let flags = transparentOccluder ? ckTransparentOccluderShadowFlags : ckDefaultShadowFlags;
  let inAmbient = color.WithAlpha(Math.round(color.Alpha * ckShadowAmbientAlpha));
  let inSpot = color.WithAlpha(Math.round(color.Alpha * ckShadowSpotAlpha));
  let tonalColors = CanvasKit.computeTonalColors({ ambient: inAmbient, spot: inSpot });
  canvas.drawShadow(path, [0, 0, devicePixelRatio * elevation], [ckShadowLightXOffset, ckShadowLightYOffset, devicePixelRatio * ckShadowLightHeight], devicePixelRatio * ckShadowLightRadius, tonalColors.ambient, tonalColors.spot, flags);
}
function MakeTextStyle(ts) {
  if (ts.fontFamilies == null || ts.fontFamilies.length === 0) {
    ts.fontFamilies = [FontCollection.DefaultFontFamily];
  }
  return new CanvasKit.TextStyle(ts);
}
function MakeParagraphStyle(ps) {
  if (ps.textStyle == null)
    ps.textStyle = {};
  return new CanvasKit.ParagraphStyle(ps);
}
function MakeParagraphBuilder(ps) {
  return CanvasKit.ParagraphBuilder.MakeFromFontProvider(ps, FontCollection.Instance.FontProvider);
}
function ConvertRadiusToSigma(radius) {
  return radius > 0 ? 0.57735 * radius + 0.5 : 0;
}
class FontStyle {
  constructor(weight, slant) {
    __publicField(this, "weight");
    __publicField(this, "slant");
    this.weight = weight;
    this.slant = slant;
  }
}
const _FontCollection = class {
  constructor(fontProvider) {
    __publicField(this, "FontChanged", new System.Event());
    __publicField(this, "_fontProvider");
    __publicField(this, "_loading", /* @__PURE__ */ new Set());
    __publicField(this, "_loaded", /* @__PURE__ */ new Map());
    this._fontProvider = fontProvider;
  }
  static get Instance() {
    return _FontCollection._instance;
  }
  static Init(defaultFontData) {
    let fontProvider = CanvasKit.TypefaceFontProvider.Make();
    _FontCollection._instance = new _FontCollection(fontProvider);
    _FontCollection._instance.RegisterTypeface(defaultFontData, _FontCollection.DefaultFontFamily);
  }
  get FontProvider() {
    return this._fontProvider;
  }
  RegisterTypeface(data, familyName) {
    let typeface = CanvasKit.Typeface.MakeFreeTypeFaceFromData(data);
    if (!typeface) {
      console.log("Can't decode font data");
      return null;
    }
    let utf8Data = new TextEncoder().encode(familyName);
    let memObj = CanvasKit.Malloc(Uint8Array, utf8Data.length + 1);
    memObj.toTypedArray().set(utf8Data);
    this._fontProvider._registerFont(typeface, memObj.byteOffset);
    CanvasKit.Free(memObj);
    this._loaded.set(familyName, typeface);
    this.FontChanged.Invoke();
  }
  TryMatchFamilyFromAsset(fontFamily) {
    return this._loaded.get(fontFamily);
  }
  StartLoadFontFromAsset(assemblyName, assetPath, fontFamily) {
    if (this._loading.has(fontFamily))
      return;
    this._loading.add(fontFamily);
    console.log(`Start load font: ${assemblyName} ${assetPath} ${fontFamily}`);
    if (assemblyName != "PixUI")
      return;
    fetch("/" + assetPath).then((response) => {
      return response.arrayBuffer();
    }).then((data) => {
      this.RegisterTypeface(data, fontFamily);
      this._loading.delete(fontFamily);
    });
  }
};
let FontCollection = _FontCollection;
__publicField(FontCollection, "DefaultFontFamily", "MiSans");
__publicField(FontCollection, "_instance");
class DelayTask {
  constructor(millisecondsDelay, action) {
    __publicField(this, "_flag", 0);
    __publicField(this, "_millisecondsDelay", 0);
    __publicField(this, "_action");
    this._millisecondsDelay = millisecondsDelay;
    this._action = action;
  }
  Run() {
    this._flag++;
    if (this._flag !== 1)
      return;
    this.RunInternal();
  }
  RunInternal() {
    setTimeout(() => {
      if (this._flag === 1) {
        this._flag = 0;
        this._action();
      } else {
        this._flag = 1;
        this.RunInternal();
      }
    }, this._millisecondsDelay);
  }
}
class WidgetList extends List {
  constructor(parent) {
    super();
    __publicField(this, "_parent");
    this._parent = parent;
  }
  Add(item) {
    item.Parent = this._parent;
    this.push(item);
  }
  Remove(item) {
    let index = this.indexOf(item);
    if (index >= 0) {
      item.Parent = null;
      this.splice(index, 1);
    }
    return index >= 0;
  }
  RemoveAll(pred) {
    for (let i = this.length - 1; i >= 0; i--) {
      if (pred(this[i])) {
        this[i].Parent = null;
        this.splice(i, 1);
      }
    }
  }
  IndexOf(item) {
    return this.indexOf(item);
  }
  Insert(index, item) {
    item.Parent = this._parent;
    this.splice(index, 0, item);
  }
  RemoveAt(index) {
    this[index].Parent = null;
    this.splice(index, 1);
  }
  Clear() {
    for (const item of this) {
      item.Parent = null;
    }
    this.splice(0);
  }
}
class EdgeInsets {
  constructor(left, top, right, bottom) {
    __publicField(this, "Left");
    __publicField(this, "Top");
    __publicField(this, "Right");
    __publicField(this, "Bottom");
    this.Left = Math.max(0, left);
    this.Top = Math.max(0, top);
    this.Right = Math.max(0, right);
    this.Bottom = Math.max(0, bottom);
  }
  get Horizontal() {
    return this.Left + this.Right;
  }
  get Vertical() {
    return this.Top + this.Bottom;
  }
  static All(value) {
    return new EdgeInsets(value, value, value, value);
  }
  static Only(left, top, right, bottom) {
    return new EdgeInsets(left, top, right, bottom);
  }
  Clone() {
    return new EdgeInsets(this.Left, this.Top, this.Right, this.Bottom);
  }
  static op_Equality(left, right) {
    return left.Equals(right);
  }
  static op_Inequality(left, right) {
    return !left.Equals(right);
  }
  Equals(other) {
    return this.Left == other.Left && this.Top == other.Top && this.Right == other.Right && this.Bottom == other.Bottom;
  }
}
var Axis = /* @__PURE__ */ ((Axis2) => {
  Axis2[Axis2["Horizontal"] = 0] = "Horizontal";
  Axis2[Axis2["Vertical"] = 1] = "Vertical";
  return Axis2;
})(Axis || {});
var HorizontalAlignment = /* @__PURE__ */ ((HorizontalAlignment2) => {
  HorizontalAlignment2[HorizontalAlignment2["Left"] = 0] = "Left";
  HorizontalAlignment2[HorizontalAlignment2["Center"] = 1] = "Center";
  HorizontalAlignment2[HorizontalAlignment2["Right"] = 2] = "Right";
  return HorizontalAlignment2;
})(HorizontalAlignment || {});
var VerticalAlignment = /* @__PURE__ */ ((VerticalAlignment2) => {
  VerticalAlignment2[VerticalAlignment2["Top"] = 0] = "Top";
  VerticalAlignment2[VerticalAlignment2["Middle"] = 1] = "Middle";
  VerticalAlignment2[VerticalAlignment2["Bottom"] = 2] = "Bottom";
  return VerticalAlignment2;
})(VerticalAlignment || {});
const _Colors = class {
  static Random(alpha = 255) {
    var _a;
    (_a = _Colors._random) != null ? _a : _Colors._random = new System.Random();
    let randomValue = Math.floor(_Colors._random.Next(0, 1 << 24) | alpha << 24) & 4294967295;
    return new Color(randomValue);
  }
};
let Colors = _Colors;
__publicField(Colors, "White", new Color(255, 255, 255));
__publicField(Colors, "Black", new Color(0, 0, 0));
__publicField(Colors, "Red", new Color(255, 0, 0));
__publicField(Colors, "Blue", new Color(0, 0, 255));
__publicField(Colors, "Green", new Color(0, 255, 0));
__publicField(Colors, "Gray", new Color(4284441448));
__publicField(Colors, "_random");
const _ImageSource = class {
  constructor() {
    __privateAdd(this, _Loading, true);
    __privateAdd(this, _Image, void 0);
  }
  get Loading() {
    return __privateGet(this, _Loading);
  }
  set Loading(value) {
    __privateSet(this, _Loading, value);
  }
  get Image() {
    return __privateGet(this, _Image);
  }
  set Image(value) {
    __privateSet(this, _Image, value);
  }
  static FromEncodedData(data) {
    let imgSrc = new _ImageSource().Init({
      Loading: false,
      Image: CanvasKit.MakeImageFromEncoded(data)
    });
    return imgSrc;
  }
  static FromNetwork(url) {
    throw new System.NotImplementedException();
  }
};
let ImageSource = _ImageSource;
_Loading = new WeakMap();
_Image = new WeakMap();
const _Offset = class {
  constructor(dx, dy) {
    __publicField(this, "Dx");
    __publicField(this, "Dy");
    this.Dx = dx;
    this.Dy = dy;
  }
  get IsEmpty() {
    return this.Dx == 0 && this.Dy == 0;
  }
  static Lerp(a, b, t) {
    if (b == null) {
      if (a == null)
        return null;
      return new _Offset(a.Dx * (1 - t), a.Dy * (1 - t));
    }
    if (a == null)
      return new _Offset(b.Dx * t, b.Dy * t);
    return new _Offset(FloatUtils.Lerp(a.Dx, b.Dx, t), FloatUtils.Lerp(a.Dy, b.Dy, t));
  }
  Equals(other) {
    return this.Dx == other.Dx && this.Dy == other.Dy;
  }
  static op_Equality(left, right) {
    return left.Equals(right);
  }
  static op_Inequality(left, right) {
    return !left.Equals(right);
  }
  Clone() {
    return new _Offset(this.Dx, this.Dy);
  }
  toString() {
    return `{{Dx=${this.Dx}, Dy=${this.Dy}}}`;
  }
};
let Offset = _Offset;
__publicField(Offset, "Empty", new _Offset(0, 0));
const _PaintUtils = class {
  static Shared(color = null, style = CanvasKit.PaintStyle.Fill, strokeWidth = 1) {
    var _a;
    (_a = _PaintUtils._shared) != null ? _a : _PaintUtils._shared = new CanvasKit.Paint();
    _PaintUtils._shared.setStyle(style);
    _PaintUtils._shared.setColor(color != null ? color : Colors.Black);
    _PaintUtils._shared.setStrokeWidth(strokeWidth);
    _PaintUtils._shared.setStrokeCap(CanvasKit.StrokeCap.Butt);
    _PaintUtils._shared.setStrokeJoin(CanvasKit.StrokeJoin.Miter);
    _PaintUtils._shared.setMaskFilter(null);
    _PaintUtils._shared.setAntiAlias(false);
    return _PaintUtils._shared;
  }
};
let PaintUtils = _PaintUtils;
__publicField(PaintUtils, "_shared");
var Keys = ((Keys2) => {
  Keys2[Keys2["None"] = 0] = "None";
  Keys2[Keys2["LButton"] = 1] = "LButton";
  Keys2[Keys2["RButton"] = 2] = "RButton";
  Keys2[Keys2["Cancel"] = 3] = "Cancel";
  Keys2[Keys2["MButton"] = 4] = "MButton";
  Keys2[Keys2["XButton1"] = 5] = "XButton1";
  Keys2[Keys2["XButton2"] = 6] = "XButton2";
  Keys2[Keys2["Back"] = 8] = "Back";
  Keys2[Keys2["Tab"] = 9] = "Tab";
  Keys2[Keys2["LineFeed"] = 10] = "LineFeed";
  Keys2[Keys2["Clear"] = 12] = "Clear";
  Keys2[Keys2["Return"] = 13] = "Return";
  Keys2[Keys2["Enter"] = 13] = "Enter";
  Keys2[Keys2["ShiftKey"] = 16] = "ShiftKey";
  Keys2[Keys2["ControlKey"] = 17] = "ControlKey";
  Keys2[Keys2["Menu"] = 18] = "Menu";
  Keys2[Keys2["Pause"] = 19] = "Pause";
  Keys2[Keys2["CapsLock"] = 20] = "CapsLock";
  Keys2[Keys2["Capital"] = 20] = "Capital";
  Keys2[Keys2["KanaMode"] = 21] = "KanaMode";
  Keys2[Keys2["HanguelMode"] = 21] = "HanguelMode";
  Keys2[Keys2["HangulMode"] = 21] = "HangulMode";
  Keys2[Keys2["JunjaMode"] = 23] = "JunjaMode";
  Keys2[Keys2["FinalMode"] = 24] = "FinalMode";
  Keys2[Keys2["KanjiMode"] = 25] = "KanjiMode";
  Keys2[Keys2["HanjaMode"] = 25] = "HanjaMode";
  Keys2[Keys2["Escape"] = 27] = "Escape";
  Keys2[Keys2["IMEConvert"] = 28] = "IMEConvert";
  Keys2[Keys2["IMENonconvert"] = 29] = "IMENonconvert";
  Keys2[Keys2["IMEAceept"] = 30] = "IMEAceept";
  Keys2[Keys2["IMEModeChange"] = 31] = "IMEModeChange";
  Keys2[Keys2["Space"] = 32] = "Space";
  Keys2[Keys2["PageUp"] = 33] = "PageUp";
  Keys2[Keys2["Prior"] = 33] = "Prior";
  Keys2[Keys2["PageDown"] = 34] = "PageDown";
  Keys2[Keys2["Next"] = 34] = "Next";
  Keys2[Keys2["End"] = 35] = "End";
  Keys2[Keys2["Home"] = 36] = "Home";
  Keys2[Keys2["Left"] = 37] = "Left";
  Keys2[Keys2["Up"] = 38] = "Up";
  Keys2[Keys2["Right"] = 39] = "Right";
  Keys2[Keys2["Down"] = 40] = "Down";
  Keys2[Keys2["Select"] = 41] = "Select";
  Keys2[Keys2["Print"] = 42] = "Print";
  Keys2[Keys2["Execute"] = 43] = "Execute";
  Keys2[Keys2["PrintScreen"] = 44] = "PrintScreen";
  Keys2[Keys2["Snapshot"] = 44] = "Snapshot";
  Keys2[Keys2["Insert"] = 45] = "Insert";
  Keys2[Keys2["Delete"] = 46] = "Delete";
  Keys2[Keys2["Help"] = 47] = "Help";
  Keys2[Keys2["D0"] = 48] = "D0";
  Keys2[Keys2["D1"] = 49] = "D1";
  Keys2[Keys2["D2"] = 50] = "D2";
  Keys2[Keys2["D3"] = 51] = "D3";
  Keys2[Keys2["D4"] = 52] = "D4";
  Keys2[Keys2["D5"] = 53] = "D5";
  Keys2[Keys2["D6"] = 54] = "D6";
  Keys2[Keys2["D7"] = 55] = "D7";
  Keys2[Keys2["D8"] = 56] = "D8";
  Keys2[Keys2["D9"] = 57] = "D9";
  Keys2[Keys2["A"] = 65] = "A";
  Keys2[Keys2["B"] = 66] = "B";
  Keys2[Keys2["C"] = 67] = "C";
  Keys2[Keys2["D"] = 68] = "D";
  Keys2[Keys2["E"] = 69] = "E";
  Keys2[Keys2["F"] = 70] = "F";
  Keys2[Keys2["G"] = 71] = "G";
  Keys2[Keys2["H"] = 72] = "H";
  Keys2[Keys2["I"] = 73] = "I";
  Keys2[Keys2["J"] = 74] = "J";
  Keys2[Keys2["K"] = 75] = "K";
  Keys2[Keys2["L"] = 76] = "L";
  Keys2[Keys2["M"] = 77] = "M";
  Keys2[Keys2["N"] = 78] = "N";
  Keys2[Keys2["O"] = 79] = "O";
  Keys2[Keys2["P"] = 80] = "P";
  Keys2[Keys2["Q"] = 81] = "Q";
  Keys2[Keys2["R"] = 82] = "R";
  Keys2[Keys2["S"] = 83] = "S";
  Keys2[Keys2["T"] = 84] = "T";
  Keys2[Keys2["U"] = 85] = "U";
  Keys2[Keys2["V"] = 86] = "V";
  Keys2[Keys2["W"] = 87] = "W";
  Keys2[Keys2["X"] = 88] = "X";
  Keys2[Keys2["Y"] = 89] = "Y";
  Keys2[Keys2["Z"] = 90] = "Z";
  Keys2[Keys2["LWin"] = 91] = "LWin";
  Keys2[Keys2["RWin"] = 92] = "RWin";
  Keys2[Keys2["Apps"] = 93] = "Apps";
  Keys2[Keys2["NumPad0"] = 96] = "NumPad0";
  Keys2[Keys2["NumPad1"] = 97] = "NumPad1";
  Keys2[Keys2["NumPad2"] = 98] = "NumPad2";
  Keys2[Keys2["NumPad3"] = 99] = "NumPad3";
  Keys2[Keys2["NumPad4"] = 100] = "NumPad4";
  Keys2[Keys2["NumPad5"] = 101] = "NumPad5";
  Keys2[Keys2["NumPad6"] = 102] = "NumPad6";
  Keys2[Keys2["NumPad7"] = 103] = "NumPad7";
  Keys2[Keys2["NumPad8"] = 104] = "NumPad8";
  Keys2[Keys2["NumPad9"] = 105] = "NumPad9";
  Keys2[Keys2["Multiply"] = 106] = "Multiply";
  Keys2[Keys2["Add"] = 107] = "Add";
  Keys2[Keys2["Separator"] = 108] = "Separator";
  Keys2[Keys2["Subtract"] = 109] = "Subtract";
  Keys2[Keys2["Decimal"] = 110] = "Decimal";
  Keys2[Keys2["Divide"] = 111] = "Divide";
  Keys2[Keys2["F1"] = 112] = "F1";
  Keys2[Keys2["F2"] = 113] = "F2";
  Keys2[Keys2["F3"] = 114] = "F3";
  Keys2[Keys2["F4"] = 115] = "F4";
  Keys2[Keys2["F5"] = 116] = "F5";
  Keys2[Keys2["F6"] = 117] = "F6";
  Keys2[Keys2["F7"] = 118] = "F7";
  Keys2[Keys2["F8"] = 119] = "F8";
  Keys2[Keys2["F9"] = 120] = "F9";
  Keys2[Keys2["F10"] = 121] = "F10";
  Keys2[Keys2["F11"] = 122] = "F11";
  Keys2[Keys2["F12"] = 123] = "F12";
  Keys2[Keys2["F13"] = 124] = "F13";
  Keys2[Keys2["F14"] = 125] = "F14";
  Keys2[Keys2["F15"] = 126] = "F15";
  Keys2[Keys2["F16"] = 127] = "F16";
  Keys2[Keys2["F17"] = 128] = "F17";
  Keys2[Keys2["F18"] = 129] = "F18";
  Keys2[Keys2["F19"] = 130] = "F19";
  Keys2[Keys2["F20"] = 131] = "F20";
  Keys2[Keys2["F21"] = 132] = "F21";
  Keys2[Keys2["F22"] = 133] = "F22";
  Keys2[Keys2["F23"] = 134] = "F23";
  Keys2[Keys2["F24"] = 135] = "F24";
  Keys2[Keys2["NumLock"] = 144] = "NumLock";
  Keys2[Keys2["Scroll"] = 145] = "Scroll";
  Keys2[Keys2["LShiftKey"] = 160] = "LShiftKey";
  Keys2[Keys2["RShiftKey"] = 161] = "RShiftKey";
  Keys2[Keys2["LControlKey"] = 162] = "LControlKey";
  Keys2[Keys2["RControlKey"] = 163] = "RControlKey";
  Keys2[Keys2["LMenu"] = 164] = "LMenu";
  Keys2[Keys2["RMenu"] = 165] = "RMenu";
  Keys2[Keys2["BrowserBack"] = 166] = "BrowserBack";
  Keys2[Keys2["BrowserForward"] = 167] = "BrowserForward";
  Keys2[Keys2["BrowserRefresh"] = 168] = "BrowserRefresh";
  Keys2[Keys2["BrowserStop"] = 169] = "BrowserStop";
  Keys2[Keys2["BrowserSearch"] = 170] = "BrowserSearch";
  Keys2[Keys2["BrowserFavorites"] = 171] = "BrowserFavorites";
  Keys2[Keys2["BrowserHome"] = 172] = "BrowserHome";
  Keys2[Keys2["VolumeMute"] = 173] = "VolumeMute";
  Keys2[Keys2["VolumeDown"] = 174] = "VolumeDown";
  Keys2[Keys2["VolumeUp"] = 175] = "VolumeUp";
  Keys2[Keys2["MediaNextTrack"] = 176] = "MediaNextTrack";
  Keys2[Keys2["MediaPreviousTrack"] = 177] = "MediaPreviousTrack";
  Keys2[Keys2["MediaStop"] = 178] = "MediaStop";
  Keys2[Keys2["MediaPlayPause"] = 179] = "MediaPlayPause";
  Keys2[Keys2["LaunchMail"] = 180] = "LaunchMail";
  Keys2[Keys2["SelectMedia"] = 181] = "SelectMedia";
  Keys2[Keys2["LaunchApplication1"] = 182] = "LaunchApplication1";
  Keys2[Keys2["LaunchApplication2"] = 183] = "LaunchApplication2";
  Keys2[Keys2["OemSemicolon"] = 186] = "OemSemicolon";
  Keys2[Keys2["Oemplus"] = 187] = "Oemplus";
  Keys2[Keys2["Oemcomma"] = 188] = "Oemcomma";
  Keys2[Keys2["OemMinus"] = 189] = "OemMinus";
  Keys2[Keys2["OemPeriod"] = 190] = "OemPeriod";
  Keys2[Keys2["OemQuestion"] = 191] = "OemQuestion";
  Keys2[Keys2["Oemtilde"] = 192] = "Oemtilde";
  Keys2[Keys2["OemOpenBrackets"] = 219] = "OemOpenBrackets";
  Keys2[Keys2["OemPipe"] = 220] = "OemPipe";
  Keys2[Keys2["OemCloseBrackets"] = 221] = "OemCloseBrackets";
  Keys2[Keys2["OemQuotes"] = 222] = "OemQuotes";
  Keys2[Keys2["Oem8"] = 223] = "Oem8";
  Keys2[Keys2["OemBackslash"] = 226] = "OemBackslash";
  Keys2[Keys2["ProcessKey"] = 229] = "ProcessKey";
  Keys2[Keys2["Attn"] = 246] = "Attn";
  Keys2[Keys2["Crsel"] = 247] = "Crsel";
  Keys2[Keys2["Exsel"] = 248] = "Exsel";
  Keys2[Keys2["EraseEof"] = 249] = "EraseEof";
  Keys2[Keys2["Play"] = 250] = "Play";
  Keys2[Keys2["Zoom"] = 251] = "Zoom";
  Keys2[Keys2["NoName"] = 252] = "NoName";
  Keys2[Keys2["Pa1"] = 253] = "Pa1";
  Keys2[Keys2["OemClear"] = 254] = "OemClear";
  Keys2[Keys2["KeyCode"] = 65535] = "KeyCode";
  Keys2[Keys2["Shift"] = 65536] = "Shift";
  Keys2[Keys2["Control"] = 131072] = "Control";
  Keys2[Keys2["Alt"] = 262144] = "Alt";
  Keys2[Keys2["Modifiers"] = Math.floor(4294901760) & 4294967295] = "Modifiers";
  Keys2[Keys2["IMEAccept"] = 30] = "IMEAccept";
  Keys2[Keys2["Oem102"] = 226] = "Oem102";
  Keys2[Keys2["Oem5"] = 220] = "Oem5";
  Keys2[Keys2["Oem7"] = 222] = "Oem7";
  Keys2[Keys2["Packet"] = 231] = "Packet";
  Keys2[Keys2["Sleep"] = 95] = "Sleep";
  return Keys2;
})(Keys || {});
class PropagateEvent {
  constructor() {
    __privateAdd(this, _IsHandled, false);
  }
  get IsHandled() {
    return __privateGet(this, _IsHandled);
  }
  set IsHandled(value) {
    __privateSet(this, _IsHandled, value);
  }
  StopPropagate() {
    this.IsHandled = true;
  }
  ResetHandled() {
    this.IsHandled = false;
  }
}
_IsHandled = new WeakMap();
class EventHookManager {
  constructor() {
    __publicField(this, "_hookRefs", new System.List());
  }
  HookEvent(type, e) {
    if (this._hookRefs.length == 0)
      return false;
    let r = EventPreviewResult.NotProcessed;
    for (let i = 0; i < this._hookRefs.length; i++) {
      let hook = this._hookRefs[i].deref();
      if (hook == null) {
        this._hookRefs.RemoveAt(i);
        i--;
      } else {
        let single = hook.PreviewEvent(type, e);
        if ((single & EventPreviewResult.Processed) == EventPreviewResult.Processed)
          r |= EventPreviewResult.Processed;
        if ((single & EventPreviewResult.NoDispatch) == EventPreviewResult.NoDispatch)
          r |= EventPreviewResult.NoDispatch;
        if ((single & EventPreviewResult.NoContinue) == EventPreviewResult.NoContinue) {
          r |= EventPreviewResult.NoContinue;
          break;
        }
      }
    }
    return (r & EventPreviewResult.NoDispatch) == EventPreviewResult.NoDispatch;
  }
  Add(hook) {
    this._hookRefs.Add(new WeakRef(hook));
  }
  Remove(hook) {
    for (let i = 0; i < this._hookRefs.length; i++) {
      let weakRef = this._hookRefs[i];
      if (weakRef.deref() === hook) {
        this._hookRefs.RemoveAt(i);
        break;
      }
    }
  }
}
var EventType = /* @__PURE__ */ ((EventType2) => {
  EventType2[EventType2["PointerDown"] = 0] = "PointerDown";
  EventType2[EventType2["PointerUp"] = 1] = "PointerUp";
  EventType2[EventType2["PointerMove"] = 2] = "PointerMove";
  EventType2[EventType2["Scroll"] = 3] = "Scroll";
  EventType2[EventType2["KeyDown"] = 4] = "KeyDown";
  EventType2[EventType2["KeyUp"] = 5] = "KeyUp";
  return EventType2;
})(EventType || {});
const _FocusManager = class {
  constructor() {
    __privateAdd(this, _FocusedWidget, void 0);
  }
  get FocusedWidget() {
    return __privateGet(this, _FocusedWidget);
  }
  set FocusedWidget(value) {
    __privateSet(this, _FocusedWidget, value);
  }
  Focus(widget) {
    if (this.FocusedWidget === widget)
      return;
    if (this.FocusedWidget != null) {
      this.FocusedWidget.FocusNode.RaiseFocusChanged(false);
      this.FocusedWidget = null;
    }
    if (IsInterfaceOfIFocusable(widget)) {
      this.FocusedWidget = widget;
      this.FocusedWidget.FocusNode.RaiseFocusChanged(true);
    }
  }
  OnKeyDown(e) {
    if (this.FocusedWidget == null)
      return;
    _FocusManager.PropagateEvent(this.FocusedWidget, e, (w, ke) => w.FocusNode.RaiseKeyDown(ke));
    if (!e.IsHandled && e.KeyCode == Keys.Tab) {
      let forward = !e.Shift;
      let found;
      if (forward)
        found = _FocusManager.FindFocusableForward(this.FocusedWidget.Parent, this.FocusedWidget);
      else
        found = _FocusManager.FindFocusableBackward(this.FocusedWidget.Parent, this.FocusedWidget);
      if (found != null)
        this.Focus(found);
    }
  }
  OnKeyUp(e) {
    if (this.FocusedWidget == null)
      return;
    _FocusManager.PropagateEvent(this.FocusedWidget, e, (w, ke) => w.FocusNode.RaiseKeyUp(ke));
  }
  OnTextInput(text) {
    this.FocusedWidget.FocusNode.RaiseTextInput(text);
  }
  static PropagateEvent(widget, theEvent, handler) {
    while (true) {
      if (widget == null)
        return;
      if (IsInterfaceOfIFocusable(widget)) {
        handler(widget, theEvent);
        if (theEvent.IsHandled)
          return;
      }
      widget = widget.Parent;
    }
  }
  static FindFocusableForward(container, start) {
    let found = null;
    let hasStart = start == null;
    container.VisitChildren((c) => {
      if (!hasStart) {
        if (c === start)
          hasStart = true;
      } else {
        if (IsInterfaceOfIFocusable(c)) {
          found = c;
          return true;
        }
        let childFocused = _FocusManager.FindFocusableForward(c, null);
        if (childFocused != null) {
          found = childFocused;
          return true;
        }
      }
      return false;
    });
    if (found != null || start == null)
      return found;
    if (container.Parent != null && !IsInterfaceOfIRootWidget(container.Parent))
      return _FocusManager.FindFocusableForward(container.Parent, container);
    return null;
  }
  static FindFocusableBackward(container, start) {
    let found = null;
    container.VisitChildren((c) => {
      if (start != null && c === start)
        return true;
      if (IsInterfaceOfIFocusable(c)) {
        found = c;
      } else {
        let childFocused = _FocusManager.FindFocusableForward(c, null);
        if (childFocused != null) {
          found = childFocused;
        }
      }
      return false;
    });
    if (found != null || start == null)
      return found;
    if (container.Parent != null && !IsInterfaceOfIRootWidget(container.Parent))
      return _FocusManager.FindFocusableBackward(container.Parent, container);
    return null;
  }
};
let FocusManager = _FocusManager;
_FocusedWidget = new WeakMap();
class FocusManagerStack {
  constructor() {
    __publicField(this, "_stack", new System.List());
    this._stack.Add(new FocusManager());
  }
  Push(manager) {
    this._stack.Add(manager);
  }
  Remove(manager) {
    if (manager == this._stack[0])
      throw new System.NotSupportedException();
    this._stack.Remove(manager);
  }
  Focus(widget) {
    if (widget == null)
      return;
    let manager = this.GetFocusManagerByWidget(widget);
    manager.Focus(widget);
  }
  OnKeyDown(e) {
    this.GetFocusManagerWithFocused().OnKeyDown(e);
  }
  OnKeyUp(e) {
    this.GetFocusManagerWithFocused().OnKeyUp(e);
  }
  OnTextInput(text) {
    this.GetFocusManagerWithFocused().OnTextInput(text);
  }
  GetFocusManagerByWidget(widget) {
    let temp = widget;
    while (temp.Parent != null) {
      if (temp.Parent instanceof Popup) {
        const popup = temp.Parent;
        return popup.FocusManager;
      }
      temp = temp.Parent;
    }
    return this._stack[0];
  }
  GetFocusManagerWithFocused() {
    for (let i = this._stack.length - 1; i > 0; i--) {
      if (this._stack[i].FocusedWidget != null)
        return this._stack[i];
    }
    return this._stack[0];
  }
}
class FocusNode {
  constructor() {
    __publicField(this, "KeyDown", new System.Event());
    __publicField(this, "KeyUp", new System.Event());
    __publicField(this, "FocusChanged", new System.Event());
    __publicField(this, "TextInput", new System.Event());
  }
  RaiseKeyDown(theEvent) {
    this.KeyDown.Invoke(theEvent);
  }
  RaiseKeyUp(theEvent) {
    this.KeyUp.Invoke(theEvent);
  }
  RaiseFocusChanged(focused) {
    this.FocusChanged.Invoke(focused);
  }
  RaiseTextInput(text) {
    this.TextInput.Invoke(text);
  }
}
class HitTestResult {
  constructor() {
    __publicField(this, "_path", new System.List());
    __publicField(this, "_transform", Matrix4.CreateIdentity());
    __privateAdd(this, _LastHitWidget, void 0);
  }
  get LastHitWidget() {
    return __privateGet(this, _LastHitWidget);
  }
  set LastHitWidget(value) {
    __privateSet(this, _LastHitWidget, value);
  }
  get IsHitAnyMouseRegion() {
    return this._path.length > 0;
  }
  get IsHitAnyWidget() {
    return this.LastHitWidget != null;
  }
  Add(widget) {
    if (this.LastHitWidget === widget)
      return false;
    this.LastHitWidget = widget;
    this._transform.Translate(-widget.X, -widget.Y);
    if (widget.Parent != null) {
      let parent = widget.Parent;
      if (IsInterfaceOfIScrollable(parent)) {
        const scrollable = parent;
        this._transform.Translate(scrollable.ScrollOffsetX, scrollable.ScrollOffsetY);
      }
    }
    let isOpaqueMouseRegion = false;
    if (IsInterfaceOfIMouseRegion(widget)) {
      const mouseRegion = widget;
      this._path.Add(new HitTestEntry(mouseRegion, this._transform.Clone()));
      isOpaqueMouseRegion = mouseRegion.MouseRegion.Opaque;
    }
    return isOpaqueMouseRegion;
  }
  ConcatLastTransform(transform) {
    this._transform.PreConcat(transform);
    if (this.LastHitWidget === this.LastWidgetWithMouseRegion) {
      this._path[this._path.length - 1] = new HitTestEntry(this.LastEntry.Widget, this._transform.Clone());
    }
  }
  TranslateOnScroll(scrollable, dx, dy, winX, winY) {
    if (this.LastHitWidget === scrollable)
      return true;
    this._transform.Translate(dx, dy);
    let transformed = MatrixUtils.TransformPoint(this._transform, winX, winY);
    let contains = this.LastHitWidget.ContainsPoint(transformed.Dx, transformed.Dy);
    if (contains) {
      for (let i = this._path.length - 1; i >= 0; i--) {
        if (!scrollable.IsAnyParentOf(this._path[i].Widget))
          break;
        this._path[i].Transform.Translate(dx, dy);
      }
    }
    return contains;
  }
  get LastWidgetWithMouseRegion() {
    return this._path.length == 0 ? null : this._path[this._path.length - 1].Widget;
  }
  get LastEntry() {
    return this._path.length == 0 ? null : this._path[this._path.length - 1];
  }
  StillInLastRegion(winX, winY) {
    var _a;
    if (this.LastHitWidget == null)
      return false;
    let transformed = MatrixUtils.TransformPoint(this._transform, winX, winY);
    let contains = this.LastHitWidget.ContainsPoint(transformed.Dx, transformed.Dy);
    if (!contains)
      return false;
    let scrollableParent = (_a = this.LastHitWidget.Parent) == null ? void 0 : _a.FindParent((w) => IsInterfaceOfIScrollable(w));
    if (scrollableParent == null)
      return true;
    let scrollableToWin = scrollableParent.LocalToWindow(0, 0);
    return scrollableParent.ContainsPoint(winX - scrollableToWin.X, winY - scrollableToWin.Y);
  }
  HitTestInLastRegion(winX, winY) {
    let transformed = MatrixUtils.TransformPoint(this._transform, winX, winY);
    let isOpaqueMouseRegion = false;
    if (IsInterfaceOfIMouseRegion(this.LastHitWidget)) {
      const mouseRegion = this.LastHitWidget;
      isOpaqueMouseRegion = mouseRegion.MouseRegion.Opaque;
    }
    if (!isOpaqueMouseRegion)
      this.LastHitWidget.HitTest(transformed.Dx, transformed.Dy, this);
  }
  ExitAll() {
    for (let i = this._path.length - 1; i >= 0; i--) {
      this._path[i].Widget.MouseRegion.RaiseHoverChanged(false);
    }
  }
  ExitOldRegion(newResult) {
    if (!this.IsHitAnyMouseRegion)
      return;
    let exitTo = -1;
    for (let i = 0; i < this._path.length; i++) {
      exitTo = i;
      if (newResult._path.length == i)
        break;
      if (!(this._path[i].Widget === newResult._path[i].Widget))
        break;
      if (i == this._path.length - 1)
        return;
    }
    for (let i = this._path.length - 1; i >= exitTo; i--) {
      this._path[i].Widget.MouseRegion.RaiseHoverChanged(false);
    }
    if (exitTo > 0)
      this._path[exitTo - 1].Widget.MouseRegion.RestoreHoverCursor();
  }
  EnterNewRegion(oldResult) {
    if (!this.IsHitAnyMouseRegion)
      return;
    let enterFrom = -1;
    for (let i = 0; i < this._path.length; i++) {
      enterFrom = i;
      if (oldResult._path.length == i)
        break;
      if (!(this._path[i].Widget === oldResult._path[i].Widget))
        break;
      if (i == this._path.length - 1)
        return;
    }
    for (let i = enterFrom; i < this._path.length; i++) {
      this._path[i].Widget.MouseRegion.RaiseHoverChanged(true);
    }
  }
  PropagatePointerEvent(e, handler) {
    for (let i = this._path.length - 1; i >= 0; i--) {
      let transformed = MatrixUtils.TransformPoint(this._path[i].Transform, e.X, e.Y);
      e.SetPoint(transformed.Dx, transformed.Dy);
      handler(this._path[i].Widget.MouseRegion, e);
      if (e.IsHandled)
        return;
    }
  }
  Reset() {
    this._path.Clear();
    this.LastHitWidget = null;
    this._transform = Matrix4.CreateIdentity();
  }
  CopyFrom(other) {
    this._path.Clear();
    this._path.AddRange(other._path);
    this.LastHitWidget = other.LastHitWidget;
    this._transform = other._transform.Clone();
  }
}
_LastHitWidget = new WeakMap();
class HitTestEntry {
  constructor(widget, transform) {
    __publicField(this, "Widget");
    __publicField(this, "Transform");
    this.Widget = widget;
    this.Transform = transform.Clone();
  }
  ContainsPoint(winX, winY) {
    let transformedPosition = MatrixUtils.TransformPoint(this.Transform, winX, winY);
    return this.Widget.ContainsPoint(transformedPosition.Dx, transformedPosition.Dy);
  }
  Clone() {
    return new HitTestEntry(this.Widget, this.Transform.Clone());
  }
}
var EventPreviewResult = /* @__PURE__ */ ((EventPreviewResult2) => {
  EventPreviewResult2[EventPreviewResult2["NotProcessed"] = 0] = "NotProcessed";
  EventPreviewResult2[EventPreviewResult2["Processed"] = 1] = "Processed";
  EventPreviewResult2[EventPreviewResult2["NoDispatch"] = 2] = "NoDispatch";
  EventPreviewResult2[EventPreviewResult2["NoContinue"] = 4] = "NoContinue";
  EventPreviewResult2[EventPreviewResult2["ProcessedNoDispatch"] = 3] = "ProcessedNoDispatch";
  EventPreviewResult2[EventPreviewResult2["All"] = 7] = "All";
  return EventPreviewResult2;
})(EventPreviewResult || {});
function IsInterfaceOfIFocusable(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && "$meta_PixUI_IFocusable" in obj.constructor;
}
function IsInterfaceOfIScrollable(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && "$meta_PixUI_IScrollable" in obj.constructor;
}
var ScrollDirection = /* @__PURE__ */ ((ScrollDirection2) => {
  ScrollDirection2[ScrollDirection2["Horizontal"] = 1] = "Horizontal";
  ScrollDirection2[ScrollDirection2["Vertical"] = 2] = "Vertical";
  ScrollDirection2[ScrollDirection2["Both"] = 3] = "Both";
  return ScrollDirection2;
})(ScrollDirection || {});
class ScrollController {
  constructor(direction) {
    __publicField(this, "Direction");
    __publicField(this, "OffsetX", 0);
    __publicField(this, "OffsetY", 0);
    this.Direction = direction;
  }
  OnScroll(dx, dy, maxOffsetX, maxOffsetY) {
    let oldX = this.OffsetX;
    let oldY = this.OffsetY;
    if (this.Direction == 3 || this.Direction == 1) {
      this.OffsetX = clamp(this.OffsetX + dx, 0, maxOffsetX);
    }
    if (this.Direction == 3 || this.Direction == 2) {
      this.OffsetY = clamp(this.OffsetY + dy, 0, maxOffsetY);
    }
    return new Offset(this.OffsetX - oldX, this.OffsetY - oldY);
  }
}
const _KeyEvent = class extends PropagateEvent {
  constructor(keyData) {
    super();
    __privateAdd(this, _KeyData, 0);
    this.KeyData = keyData;
  }
  static UseDefault(keysData) {
    _KeyEvent.Default.KeyData = keysData;
    return _KeyEvent.Default;
  }
  get KeyData() {
    return __privateGet(this, _KeyData);
  }
  set KeyData(value) {
    __privateSet(this, _KeyData, value);
  }
  get KeyCode() {
    return this.KeyData & Keys.KeyCode;
  }
  get Control() {
    return (this.KeyData & Keys.Control) == Keys.Control;
  }
  get Shift() {
    return (this.KeyData & Keys.Shift) == Keys.Shift;
  }
  get Alt() {
    return (this.KeyData & Keys.Alt) == Keys.Alt;
  }
};
let KeyEvent = _KeyEvent;
_KeyData = new WeakMap();
__publicField(KeyEvent, "Default", new _KeyEvent(Keys.None));
function IsInterfaceOfIMouseRegion(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && "$meta_PixUI_IMouseRegion" in obj.constructor;
}
class MouseRegion {
  constructor(cursor = null, opaque = true) {
    __publicField(this, "Cursor");
    __publicField(this, "Opaque");
    __publicField(this, "PointerDown", new System.Event());
    __publicField(this, "PointerUp", new System.Event());
    __publicField(this, "PointerMove", new System.Event());
    __publicField(this, "PointerTap", new System.Event());
    __publicField(this, "HoverChanged", new System.Event());
    this.Cursor = cursor;
    this.Opaque = opaque;
  }
  RaisePointerMove(theEvent) {
    this.PointerMove.Invoke(theEvent);
  }
  RaisePointerDown(theEvent) {
    this.PointerDown.Invoke(theEvent);
  }
  RaisePointerUp(theEvent) {
    this.PointerUp.Invoke(theEvent);
  }
  RaisePointerTap(theEvent) {
    this.PointerTap.Invoke(theEvent);
  }
  RaiseHoverChanged(hover) {
    if (this.Cursor != null)
      Cursor.Current = hover ? this.Cursor() : Cursors.Arrow;
    this.HoverChanged.Invoke(hover);
  }
  RestoreHoverCursor() {
    if (this.Cursor != null)
      Cursor.Current = this.Cursor();
  }
}
var PointerButtons = /* @__PURE__ */ ((PointerButtons2) => {
  PointerButtons2[PointerButtons2["None"] = 0] = "None";
  PointerButtons2[PointerButtons2["Left"] = 1048576] = "Left";
  PointerButtons2[PointerButtons2["Right"] = 2097152] = "Right";
  PointerButtons2[PointerButtons2["Middle"] = 4194304] = "Middle";
  PointerButtons2[PointerButtons2["XButton1"] = 8388608] = "XButton1";
  PointerButtons2[PointerButtons2["XButton2"] = 16777216] = "XButton2";
  return PointerButtons2;
})(PointerButtons || {});
const _PointerEvent = class extends PropagateEvent {
  constructor() {
    super();
    __privateAdd(this, _Buttons, 0);
    __privateAdd(this, _X, 0);
    __privateAdd(this, _Y, 0);
    __privateAdd(this, _DeltaX, 0);
    __privateAdd(this, _DeltaY, 0);
  }
  get Buttons() {
    return __privateGet(this, _Buttons);
  }
  set Buttons(value) {
    __privateSet(this, _Buttons, value);
  }
  get X() {
    return __privateGet(this, _X);
  }
  set X(value) {
    __privateSet(this, _X, value);
  }
  get Y() {
    return __privateGet(this, _Y);
  }
  set Y(value) {
    __privateSet(this, _Y, value);
  }
  get DeltaX() {
    return __privateGet(this, _DeltaX);
  }
  set DeltaX(value) {
    __privateSet(this, _DeltaX, value);
  }
  get DeltaY() {
    return __privateGet(this, _DeltaY);
  }
  set DeltaY(value) {
    __privateSet(this, _DeltaY, value);
  }
  static UseDefault(buttons, x, y, dx, dy) {
    _PointerEvent.Default.Buttons = buttons;
    _PointerEvent.Default.X = x;
    _PointerEvent.Default.Y = y;
    _PointerEvent.Default.DeltaX = dx;
    _PointerEvent.Default.DeltaY = dy;
    _PointerEvent.Default.ResetHandled();
    return _PointerEvent.Default;
  }
  SetPoint(x, y) {
    this.X = x;
    this.Y = y;
  }
  static RemovePerspectiveTransform(transform) {
    let vector = new Vector4(0, 0, 1, 0);
    transform.SetColumn(2, vector.Clone());
    transform.SetRow(2, vector.Clone());
    return transform;
  }
};
let PointerEvent = _PointerEvent;
_Buttons = new WeakMap();
_X = new WeakMap();
_Y = new WeakMap();
_DeltaX = new WeakMap();
_DeltaY = new WeakMap();
__publicField(PointerEvent, "Default", new _PointerEvent());
const _ScrollEvent = class {
  constructor() {
    __privateAdd(this, _X2, 0);
    __privateAdd(this, _Y2, 0);
    __privateAdd(this, _Dx, 0);
    __privateAdd(this, _Dy, 0);
  }
  get X() {
    return __privateGet(this, _X2);
  }
  set X(value) {
    __privateSet(this, _X2, value);
  }
  get Y() {
    return __privateGet(this, _Y2);
  }
  set Y(value) {
    __privateSet(this, _Y2, value);
  }
  get Dx() {
    return __privateGet(this, _Dx);
  }
  set Dx(value) {
    __privateSet(this, _Dx, value);
  }
  get Dy() {
    return __privateGet(this, _Dy);
  }
  set Dy(value) {
    __privateSet(this, _Dy, value);
  }
  static Make(x, y, dx, dy) {
    _ScrollEvent.Default.X = x;
    _ScrollEvent.Default.Y = y;
    _ScrollEvent.Default.Dx = dx;
    _ScrollEvent.Default.Dy = dy;
    return _ScrollEvent.Default;
  }
};
let ScrollEvent = _ScrollEvent;
_X2 = new WeakMap();
_Y2 = new WeakMap();
_Dx = new WeakMap();
_Dy = new WeakMap();
__publicField(ScrollEvent, "Default", new _ScrollEvent());
var AnimationStatus = /* @__PURE__ */ ((AnimationStatus2) => {
  AnimationStatus2[AnimationStatus2["Dismissed"] = 0] = "Dismissed";
  AnimationStatus2[AnimationStatus2["Forward"] = 1] = "Forward";
  AnimationStatus2[AnimationStatus2["Reverse"] = 2] = "Reverse";
  AnimationStatus2[AnimationStatus2["Completed"] = 3] = "Completed";
  return AnimationStatus2;
})(AnimationStatus || {});
class Animation {
  get IsDismissed() {
    return this.Status == AnimationStatus.Dismissed;
  }
  get IsCompleted() {
    return this.Status == AnimationStatus.Completed;
  }
}
class AnimationWithParent extends Animation {
  constructor(parent) {
    super();
    __publicField(this, "Parent");
    this.Parent = parent;
  }
  get Status() {
    return this.Parent.Status;
  }
  get ValueChanged() {
    return this.Parent.ValueChanged;
  }
  get StatusChanged() {
    return this.Parent.StatusChanged;
  }
}
class AnimatedEvaluation extends AnimationWithParent {
  constructor(parent, evaluatable) {
    super(parent);
    __publicField(this, "_evaluatable");
    this._evaluatable = evaluatable;
  }
  get Value() {
    return this._evaluatable.Evaluate(this.Parent);
  }
}
class Simulation {
  constructor(tolerance = null) {
    __privateAdd(this, _Tolerance2, void 0);
    this.Tolerance = tolerance != null ? tolerance : Tolerance.Default;
  }
  get Tolerance() {
    return __privateGet(this, _Tolerance2);
  }
  set Tolerance(value) {
    __privateSet(this, _Tolerance2, value);
  }
}
_Tolerance2 = new WeakMap();
class InterpolationSimulation extends Simulation {
  constructor(begin, end, duration, curve, scale) {
    super();
    __publicField(this, "_durationInSeconds");
    __publicField(this, "_begin");
    __publicField(this, "_end");
    __publicField(this, "_curve");
    console.assert(duration > 0);
    this._begin = begin;
    this._end = end;
    this._curve = curve;
    this._durationInSeconds = duration * scale / 1e3;
  }
  X(timeInSeconds) {
    let t = clamp(timeInSeconds / this._durationInSeconds, 0, 1);
    if (t == 0)
      return this._begin;
    if (t == 1)
      return this._end;
    return this._begin + (this._end - this._begin) * this._curve.Transform(t);
  }
  Dx(timeInSeconds) {
    let epsilon = this.Tolerance.Time;
    return (this.X(timeInSeconds + epsilon) - this.X(timeInSeconds - epsilon)) / (2 * epsilon);
  }
  IsDone(timeInSeconds) {
    return timeInSeconds > this._durationInSeconds;
  }
}
class RepeatingSimulation extends Simulation {
  constructor(initialValue, min, max, reverse, period, directionSetter) {
    super();
    __publicField(this, "_min");
    __publicField(this, "_max");
    __publicField(this, "_reverse");
    __publicField(this, "_directionSetter");
    __publicField(this, "_periodInSeconds");
    __publicField(this, "_initialT");
    this._min = min;
    this._max = max;
    this._reverse = reverse;
    this._directionSetter = directionSetter;
    this._periodInSeconds = period / 1e3;
    this._initialT = max == min ? 0 : initialValue / (max - min) * this._periodInSeconds;
    console.assert(this._periodInSeconds > 0);
    console.assert(this._initialT >= 0);
  }
  X(timeInSeconds) {
    console.assert(timeInSeconds >= 0);
    let totalTimeInSeconds = timeInSeconds + this._initialT;
    let t = totalTimeInSeconds / this._periodInSeconds % 1;
    let isPlayingReverse = (Math.floor(totalTimeInSeconds / this._periodInSeconds) & 4294967295 & 1) == 1;
    if (this._reverse && isPlayingReverse) {
      this._directionSetter(AnimationDirection.Reverse);
      return DoubleUtils.Lerp(this._max, this._min, t);
    } else {
      this._directionSetter(AnimationDirection.Forward);
      return DoubleUtils.Lerp(this._min, this._max, t);
    }
  }
  Dx(timeInSeconds) {
    return (this._max - this._min) / this._periodInSeconds;
  }
  IsDone(time) {
    return false;
  }
}
var AnimationDirection = /* @__PURE__ */ ((AnimationDirection2) => {
  AnimationDirection2[AnimationDirection2["Forward"] = 0] = "Forward";
  AnimationDirection2[AnimationDirection2["Reverse"] = 1] = "Reverse";
  return AnimationDirection2;
})(AnimationDirection || {});
var AnimationBehavior = /* @__PURE__ */ ((AnimationBehavior2) => {
  AnimationBehavior2[AnimationBehavior2["Normal"] = 0] = "Normal";
  AnimationBehavior2[AnimationBehavior2["Preserve"] = 1] = "Preserve";
  return AnimationBehavior2;
})(AnimationBehavior || {});
class AnimationController extends Animation {
  constructor(duration, value = null, behavior = 0) {
    super();
    __publicField(this, "_value", 0);
    __publicField(this, "_status", 0);
    __publicField(this, "Duration");
    __publicField(this, "ReverseDuration");
    __publicField(this, "_direction", 0);
    __publicField(this, "_animationBehavior");
    __publicField(this, "_simulation");
    __publicField(this, "_ticker");
    __privateAdd(this, _LastElapsedDuration, void 0);
    __publicField(this, "_lastReportedStatus", AnimationStatus.Dismissed);
    __publicField(this, "LowerBound", 0);
    __publicField(this, "UpperBound", 1);
    __publicField(this, "ValueChanged", new System.Event());
    __publicField(this, "StatusChanged", new System.Event());
    this.Duration = duration;
    this._animationBehavior = behavior;
    this._direction = 0;
    this._ticker = new Ticker(this.OnTick.bind(this));
    this.SetValueInternal(value != null ? value : this.LowerBound);
  }
  get LastElapsedDuration() {
    return __privateGet(this, _LastElapsedDuration);
  }
  set LastElapsedDuration(value) {
    __privateSet(this, _LastElapsedDuration, value);
  }
  get IsAnimating() {
    return this._ticker != null && this._ticker.IsActive;
  }
  get Status() {
    return this._status;
  }
  get Value() {
    return this._value;
  }
  SetValue(newValue) {
    this.Stop();
    this.SetValueInternal(newValue);
    this.NotifyValueChanged();
    this.CheckStatusChanged();
  }
  SetValueInternal(newValue) {
    this._value = clamp(newValue, this.LowerBound, this.UpperBound);
    if (this._value == this.LowerBound)
      this._status = AnimationStatus.Dismissed;
    else if (this._value == this.UpperBound)
      this._status = AnimationStatus.Completed;
    else
      this._status = this._direction == 0 ? AnimationStatus.Forward : AnimationStatus.Reverse;
  }
  Stop(canceled = true) {
    this._ticker.Stop(canceled);
    this._simulation = null;
    this.LastElapsedDuration = null;
  }
  OnTick(elapsedInSeconds) {
    if (this._simulation == null)
      return;
    this.LastElapsedDuration = elapsedInSeconds;
    console.assert(elapsedInSeconds >= 0);
    this._value = clamp(this._simulation.X(elapsedInSeconds), this.LowerBound, this.UpperBound);
    if (this._simulation.IsDone(elapsedInSeconds)) {
      this._status = this._direction == 0 ? AnimationStatus.Completed : AnimationStatus.Dismissed;
      this.Stop(false);
    }
    this.NotifyValueChanged();
    this.CheckStatusChanged();
  }
  AnimateTo(target, duration = null, curve = null) {
    if (this.Duration == null && duration == null)
      throw new System.Exception("Duration not set");
    curve != null ? curve : curve = Curves.Linear;
    this._direction = 0;
    this.AnimateToInternal(target, duration, curve);
  }
  AnimateBack(target, duration = null, curve = null) {
    if (this.Duration == null && this.ReverseDuration == null && duration == null)
      throw new System.Exception("Duration not set");
    curve != null ? curve : curve = Curves.Linear;
    this._direction = 1;
    this.AnimateToInternal(target, duration, curve);
  }
  AnimateToInternal(target, duration = null, curve = null) {
    curve != null ? curve : curve = Curves.Linear;
    let scale = 1;
    let simulationDuration = duration;
    if (simulationDuration == null) {
      console.assert(!(this.Duration == null && this._direction == 0));
      console.assert(!(this.Duration == null && this._direction == 1 && this.ReverseDuration == null));
      let range = this.UpperBound - this.LowerBound;
      let remainingFraction = isFinite(range) ? Math.abs(target - this._value) / range : 1;
      let directionDuration = this._direction == 1 && this.ReverseDuration != null ? this.ReverseDuration : this.Duration;
      simulationDuration = Math.floor(directionDuration * remainingFraction) & 4294967295;
    } else if (target == this._value) {
      simulationDuration = 0;
    }
    this.Stop();
    if (simulationDuration == 0) {
      if (this._value != target) {
        this._value = clamp(target, this.LowerBound, this.UpperBound);
        this.NotifyValueChanged();
      }
      this._status = this._direction == 0 ? AnimationStatus.Completed : AnimationStatus.Dismissed;
      this.CheckStatusChanged();
      return;
    }
    console.assert(simulationDuration > 0);
    console.assert(!this.IsAnimating);
    this.StartSimulation(new InterpolationSimulation(this._value, target, simulationDuration, curve, scale));
  }
  StartSimulation(simulation) {
    console.assert(!this.IsAnimating);
    this._simulation = simulation;
    this.LastElapsedDuration = 0;
    this._value = clamp(simulation.X(0), this.LowerBound, this.UpperBound);
    this._ticker.Start();
    this._status = this._direction == 0 ? AnimationStatus.Forward : AnimationStatus.Reverse;
    this.CheckStatusChanged();
  }
  Forward(from = null) {
    if (this.Duration == null)
      throw new System.Exception("Duration not set");
    this._direction = 0;
    if (from != null)
      this.SetValue(from);
    this.AnimateToInternal(this.UpperBound);
  }
  Reverse(from = null) {
    if (this.Duration == null && this.ReverseDuration == null)
      throw new System.Exception("Duration and ReverseDuration not set");
    this._direction = 1;
    if (from != null)
      this.SetValue(from);
    this.AnimateToInternal(this.LowerBound);
  }
  Reset() {
    this.SetValue(this.LowerBound);
  }
  Repeat(min = null, max = null, reverse = false, period = null) {
    min != null ? min : min = this.LowerBound;
    max != null ? max : max = this.UpperBound;
    period != null ? period : period = this.Duration;
    if (period == null)
      throw new System.Exception("Without an explicit period and with no default Duration.");
    console.assert(max >= min);
    console.assert(max <= this.UpperBound && min >= this.LowerBound);
    this.Stop();
    this.StartSimulation(new RepeatingSimulation(this._value, min, max, reverse, period, (direction) => {
      this._direction = direction;
      this._status = this._direction == 0 ? AnimationStatus.Forward : AnimationStatus.Reverse;
      this.CheckStatusChanged();
    }));
  }
  Dispose() {
    var _a;
    (_a = this._ticker) == null ? void 0 : _a.Stop(true);
    this._ticker = null;
  }
  CheckStatusChanged() {
    let newStatus = this._status;
    if (this._lastReportedStatus == newStatus)
      return;
    this._lastReportedStatus = newStatus;
    this.StatusChanged.Invoke(newStatus);
  }
  NotifyValueChanged() {
    this.ValueChanged.Invoke();
  }
}
_LastElapsedDuration = new WeakMap();
class OptionalAnimationController extends Animation {
  constructor() {
    super(...arguments);
    __publicField(this, "_parent");
    __publicField(this, "_value", 0);
    __publicField(this, "ValueChanged", new System.Event());
    __publicField(this, "StatusChanged", new System.Event());
  }
  get Parent() {
    return this._parent;
  }
  set Parent(value) {
    if (this._parent === value)
      return;
    if (this._parent != null) {
      this._parent.ValueChanged.Remove(this.OnParentValueChanged, this);
      this._parent.StatusChanged.Remove(this.OnParentStatusChanged, this);
    }
    this._parent = value;
    if (this._parent != null) {
      this._parent.ValueChanged.Add(this.OnParentValueChanged, this);
      this._parent.StatusChanged.Add(this.OnParentStatusChanged, this);
    }
  }
  Switch() {
    this._value = this._value == 0 ? 1 : 0;
    this.ValueChanged.Invoke();
    this.StatusChanged.Invoke(this._value == 0 ? AnimationStatus.Dismissed : AnimationStatus.Completed);
  }
  OnParentValueChanged() {
    this.ValueChanged.Invoke();
  }
  OnParentStatusChanged(s) {
    this.StatusChanged.Invoke(s);
  }
  get Value() {
    if (this._parent != null)
      return this._parent.Value;
    return this._value;
  }
  get Status() {
    if (this._parent != null)
      return this._parent.Status;
    return this._value == 0 ? AnimationStatus.Dismissed : AnimationStatus.Completed;
  }
}
const _Tolerance = class {
  constructor(distance = _Tolerance.EpsilonDefault, time = _Tolerance.EpsilonDefault, velocity = _Tolerance.EpsilonDefault) {
    __publicField(this, "Distance");
    __publicField(this, "Time");
    __publicField(this, "Velocity");
    this.Distance = distance;
    this.Time = time;
    this.Velocity = velocity;
  }
};
let Tolerance = _Tolerance;
__publicField(Tolerance, "EpsilonDefault", 1e-3);
__publicField(Tolerance, "Default", new _Tolerance());
class Ticker {
  constructor(onTick) {
    __publicField(this, "_onTick");
    __publicField(this, "_startTime");
    __publicField(this, "_animationId", 0);
    __publicField(this, "_isActive", false);
    this._onTick = onTick;
  }
  get IsActive() {
    return this._isActive;
  }
  get ShouldScheduleTick() {
    return this._isActive;
  }
  Start() {
    this._startTime = System.DateTime.UtcNow;
    this._animationId++;
    this._isActive = true;
    if (this.ShouldScheduleTick)
      this.ScheduleTick();
  }
  Stop(canceled = false) {
    if (!this._isActive)
      return;
    this._isActive = false;
    this._startTime = null;
  }
  ScheduleTick(rescheduling = false) {
    let id = this._animationId;
    requestAnimationFrame(() => this.Tick(System.DateTime.UtcNow, id));
  }
  Tick(timeStamp, id) {
    var _a;
    if (id != this._animationId)
      return;
    (_a = this._startTime) != null ? _a : this._startTime = timeStamp;
    this._onTick(System.DateTime.op_Subtraction(timeStamp, this._startTime).TotalSeconds);
    if (this.ShouldScheduleTick)
      this.ScheduleTick(true);
  }
}
__publicField(Ticker, "Interval", 16);
class ParametricCurve {
  Transform(t) {
    console.assert(t >= 0 && t <= 1);
    return this.TransformInternal(t);
  }
  TransformInternal(t) {
    throw new System.NotSupportedException();
  }
}
class Curve extends ParametricCurve {
  get Flipped() {
    return new FlippedCurve(this);
  }
  Transform(t) {
    if (t == 0 || t == 1)
      return t;
    return super.Transform(t);
  }
}
class Linear extends Curve {
  TransformInternal(t) {
    return t;
  }
}
class BounceInOutCurve extends Curve {
  TransformInternal(t) {
    if (t < 0.5)
      return (1 - Curves.Bounce(1 - t * 2)) * 0.5;
    return Curves.Bounce(t * 2 - 1) * 0.5 + 0.5;
  }
}
class FlippedCurve extends Curve {
  constructor(curve) {
    super();
    __publicField(this, "Curve");
    this.Curve = curve;
  }
  TransformInternal(t) {
    return 1 - this.Curve.Transform(1 - t);
  }
}
class Interval extends Curve {
  constructor(begin, end, curve = null) {
    super();
    __publicField(this, "_begin");
    __publicField(this, "_end");
    __publicField(this, "_curve");
    if (!(begin >= 0 && begin <= 1 && end >= 0 && end <= 1 && end >= begin))
      throw new System.ArgumentOutOfRangeException();
    this._begin = begin;
    this._end = end;
    this._curve = curve != null ? curve : Curves.Linear;
  }
  TransformInternal(t) {
    t = clamp((t - this._begin) / (this._end - this._begin), 0, 1);
    if (t == 0 || t == 1)
      return t;
    return this._curve.Transform(t);
  }
}
class SawTooth extends Curve {
  constructor(count) {
    super();
    __publicField(this, "_count");
    this._count = count;
  }
  TransformInternal(t) {
    t *= this._count;
    return t - Math.trunc(t);
  }
}
const _Cubic = class extends Curve {
  constructor(a, b, c, d) {
    super();
    __publicField(this, "_a");
    __publicField(this, "_b");
    __publicField(this, "_c");
    __publicField(this, "_d");
    this._a = a;
    this._b = b;
    this._c = c;
    this._d = d;
  }
  static EvaluateCubic(a, b, m) {
    return 3 * a * (1 - m) * (1 - m) * m + 3 * b * (1 - m) * m * m + m * m * m;
  }
  TransformInternal(t) {
    let start = 0;
    let end = 1;
    while (true) {
      let midpoint = (start + end) / 2;
      let estimate = _Cubic.EvaluateCubic(this._a, this._c, midpoint);
      if (Math.abs(t - estimate) < _Cubic.CubicErrorBound)
        return _Cubic.EvaluateCubic(this._b, this._d, midpoint);
      if (estimate < t)
        start = midpoint;
      else
        end = midpoint;
    }
  }
};
let Cubic = _Cubic;
__publicField(Cubic, "CubicErrorBound", 1e-3);
class Curves {
  static Bounce(t) {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    }
    if (t < 2 / 2.75) {
      t -= 1.5 / 2.75;
      return 7.5625 * t * t + 0.75;
    }
    if (t < 2.5 / 2.75) {
      t -= 2.25 / 2.75;
      return 7.5625 * t * t + 0.9375;
    }
    t -= 2.625 / 2.75;
    return 7.5625 * t * t + 0.984375;
  }
}
__publicField(Curves, "Linear", new Linear());
__publicField(Curves, "BounceInOut", new BounceInOutCurve());
__publicField(Curves, "EaseInOutCubic", new Cubic(0.645, 0.045, 0.355, 1));
__publicField(Curves, "FastOutSlowIn", new Cubic(0.4, 0, 0.2, 1));
class Animatable {
  Evaluate(animation) {
    return this.Transform(animation.Value);
  }
  Animate(parent) {
    return new AnimatedEvaluation(parent, this);
  }
  Chain(parent) {
    return new ChainedEvaluation(parent, this);
  }
}
class ChainedEvaluation extends Animatable {
  constructor(parent, evaluatable) {
    super();
    __publicField(this, "_parent");
    __publicField(this, "_evaluatable");
    this._parent = parent;
    this._evaluatable = evaluatable;
  }
  Transform(t) {
    return this._evaluatable.Transform(this._parent.Transform(t));
  }
}
class CurveTween extends Animatable {
  constructor(curve) {
    super();
    __publicField(this, "_curve");
    this._curve = curve;
  }
  Transform(t) {
    if (t == 0 || t == 1) {
      console.assert(Math.round(this._curve.Transform(t)) == t);
      return t;
    }
    return this._curve.Transform(t);
  }
}
class Tween extends Animatable {
  constructor(begin = null, end = null) {
    super();
    __publicField(this, "Begin");
    __publicField(this, "End");
    this.Begin = begin;
    this.End = end;
  }
  Transform(t) {
    if (t == 0)
      return this.Begin;
    if (t == 1)
      return this.End;
    return this.Lerp(t);
  }
}
class FloatTween extends Tween {
  constructor(begin, end) {
    super(begin, end);
  }
  Lerp(t) {
    return this.Begin + (this.End - this.Begin) * t;
  }
}
class ColorTween extends Tween {
  constructor(begin, end) {
    super(begin, end);
  }
  Lerp(t) {
    return Color.Lerp(this.Begin, this.End, t);
  }
}
class OffsetTween extends Tween {
  constructor(begin, end) {
    super(begin, end);
  }
  Lerp(t) {
    return Offset.Lerp(this.Begin, this.End, t);
  }
}
class CurvedAnimation extends AnimationWithParent {
  constructor(parent, curve, reverseCurve = null) {
    super(parent);
    __publicField(this, "_curve");
    __publicField(this, "_reverseCurve");
    __publicField(this, "_curveDirection");
    this._curve = curve;
    this._reverseCurve = reverseCurve;
    this.UpdateCurveDirection(parent.Status);
    parent.StatusChanged.Add(this.UpdateCurveDirection, this);
  }
  get UseForwardCurve() {
    var _a;
    return this._reverseCurve == null || ((_a = this._curveDirection) != null ? _a : this.Parent.Status) != AnimationStatus.Reverse;
  }
  UpdateCurveDirection(status) {
    var _a, _b;
    switch (status) {
      case AnimationStatus.Dismissed:
      case AnimationStatus.Completed:
        this._curveDirection = null;
        break;
      case AnimationStatus.Forward:
        (_a = this._curveDirection) != null ? _a : this._curveDirection = AnimationStatus.Forward;
        break;
      case AnimationStatus.Reverse:
        (_b = this._curveDirection) != null ? _b : this._curveDirection = AnimationStatus.Reverse;
        break;
    }
  }
  get Value() {
    let activeCurve = this.UseForwardCurve ? this._curve : this._reverseCurve;
    let t = this.Parent.Value;
    if (activeCurve == null)
      return t;
    if (t == 0 || t == 1) {
      let transformedValue = activeCurve.Transform(t);
      let roundedTransformedValue = Math.round(transformedValue);
      if (roundedTransformedValue != t)
        throw new System.Exception(`Invalid curve endpoint at ${t}`);
      return t;
    }
    return activeCurve.Transform(t);
  }
}
class ColorUtils {
  static ScaleAlpha(a, factor) {
    let alpha = clamp(Math.floor(Math.round(a.Alpha * factor)) & 255, 0, 255);
    return a.WithAlpha(alpha);
  }
  static LerpInt(a, b, t) {
    return a + (b - a) * t;
  }
  static Lerp(a, b, t) {
    if (b == null)
      return a == null ? null : ColorUtils.ScaleAlpha(a, 1 - t);
    if (a == null)
      return ColorUtils.ScaleAlpha(b, t);
    let red = clamp(Math.floor(ColorUtils.LerpInt(a.Red, b.Red, t)) & 255, 0, 255);
    let green = clamp(Math.floor(ColorUtils.LerpInt(a.Green, b.Green, t)) & 255, 0, 255);
    let blue = clamp(Math.floor(ColorUtils.LerpInt(a.Blue, b.Blue, t)) & 255, 0, 255);
    let alpha = clamp(Math.floor(ColorUtils.LerpInt(a.Alpha, b.Alpha, t)) & 255, 0, 255);
    return new Color(red, green, blue, alpha);
  }
}
class FloatUtils {
  static IsNear(a, b) {
    let diff = a - b;
    return diff >= 1e-4 && diff <= 1e-4;
  }
  static Lerp(a, b, t) {
    return a * (1 - t) + b * t;
  }
}
class DoubleUtils {
  static Lerp(a, b, t) {
    if (a == b || Number.isNaN(a) && Number.isNaN(b))
      return a;
    console.assert(isFinite(a), "Cannot interpolate between finite and non-finite values");
    console.assert(isFinite(b), "Cannot interpolate between finite and non-finite values");
    console.assert(isFinite(t), "t must be finite when interpolating between values");
    return a * (1 - t) + b * t;
  }
}
const _PaintDebugger = class {
  static Switch() {
    _PaintDebugger._enable = !_PaintDebugger._enable;
    _PaintDebugger.EnableChanged.Invoke();
  }
  static PaintWidgetBorder(widget, canvas) {
    if (!_PaintDebugger._enable)
      return;
    let paint = PaintUtils.Shared(Colors.Random(125), CanvasKit.PaintStyle.Stroke, 2);
    canvas.drawRect(Rect.FromLTWH(widget.X + 1, widget.Y + 1, widget.W - 2, widget.H - 2), paint);
  }
};
let PaintDebugger = _PaintDebugger;
__publicField(PaintDebugger, "EnableChanged", new System.Event());
__publicField(PaintDebugger, "_enable", false);
const _CircularProgressPainter = class {
  constructor() {
    __publicField(this, "_controller");
    __publicField(this, "_strokeHeadTween", new CurveTween(new Interval(0, 0.5, Curves.FastOutSlowIn)).Chain(new CurveTween(new SawTooth(_CircularProgressPainter._pathCount))));
    __publicField(this, "_strokeTailTween", new CurveTween(new Interval(0.5, 1, Curves.FastOutSlowIn)).Chain(new CurveTween(new SawTooth(_CircularProgressPainter._pathCount))));
    __publicField(this, "_offsetTween", new CurveTween(new SawTooth(_CircularProgressPainter._pathCount)));
    __publicField(this, "_rotationTween", new CurveTween(new SawTooth(_CircularProgressPainter._rotationCount)));
    this._controller = new AnimationController(_CircularProgressPainter._kIndeterminateCircularDuration);
  }
  Dispose() {
    this._controller.Dispose();
  }
  Start(valueChangedAction) {
    this._controller.ValueChanged.Add(valueChangedAction, this);
    this._controller.Repeat();
  }
  Stop() {
    this._controller.Stop();
  }
  PaintToWidget(target, canvas, indicatorSize = 36) {
    let dx = (target.W - indicatorSize) / 2;
    let dy = (target.H - indicatorSize) / 2;
    canvas.translate(dx, dy);
    this.Paint(canvas, indicatorSize);
    canvas.translate(-dx, -dy);
  }
  Paint(canvas, indicatorSize) {
    let headValue = this._strokeHeadTween.Evaluate(this._controller);
    let tailValue = this._strokeTailTween.Evaluate(this._controller);
    let offsetValue = this._offsetTween.Evaluate(this._controller);
    let rotationValue = this._rotationTween.Evaluate(this._controller);
    let valueColor = Theme.FocusedColor;
    _CircularProgressPainter.PaintInternal(canvas, indicatorSize, null, headValue, tailValue, offsetValue, rotationValue, 6, valueColor);
  }
  static PaintInternal(canvas, size, value, headValue, tailValue, offsetValue, rotationValue, strokeWidth, valueColor, bgColor = null) {
    let rect = Rect.FromLTWH(0, 0, size, size);
    let arcStart = value != null ? _CircularProgressPainter._startAngle : _CircularProgressPainter._startAngle + tailValue * 3 / 2 * Math.PI + rotationValue * Math.PI * 2 + offsetValue * 0.5 * Math.PI;
    let arcSweep = value != null ? clamp(value, 0, 1) * _CircularProgressPainter._sweep : Math.max(headValue * 3 / 2 * Math.PI - tailValue * 3 / 2 * Math.PI, _CircularProgressPainter._epsilon);
    if (bgColor != null) {
      let bgPaint = PaintUtils.Shared(bgColor, CanvasKit.PaintStyle.Stroke, strokeWidth);
      bgPaint.setAntiAlias(true);
      canvas.drawArc(rect, 0 * 180 / Math.PI, _CircularProgressPainter._sweep * 180 / Math.PI, false, bgPaint);
    }
    let paint = PaintUtils.Shared(valueColor, CanvasKit.PaintStyle.Stroke, strokeWidth);
    paint.setAntiAlias(true);
    if (value == null)
      paint.setStrokeCap(CanvasKit.StrokeCap.Square);
    canvas.drawArc(rect, arcStart * 180 / Math.PI, arcSweep * 180 / Math.PI, false, paint);
  }
};
let CircularProgressPainter = _CircularProgressPainter;
__publicField(CircularProgressPainter, "_kIndeterminateCircularDuration", 1333 * 2222);
__publicField(CircularProgressPainter, "_pathCount", _CircularProgressPainter._kIndeterminateCircularDuration / 1333);
__publicField(CircularProgressPainter, "_rotationCount", _CircularProgressPainter._kIndeterminateCircularDuration / 2222);
__publicField(CircularProgressPainter, "_twoPi", Math.PI * 2);
__publicField(CircularProgressPainter, "_epsilon", 1e-3);
__publicField(CircularProgressPainter, "_sweep", _CircularProgressPainter._twoPi - _CircularProgressPainter._epsilon);
__publicField(CircularProgressPainter, "_startAngle", -Math.PI / 2);
class TextPainter {
  static BuildParagraph(text, width, fontSize, color, fontStyle = null, maxLines = 1, forceHeight = false) {
    let ts = MakeTextStyle({ color, fontSize });
    if (fontStyle != null)
      ts.fontStyle = fontStyle;
    let ps = MakeParagraphStyle({ maxLines: Math.floor(maxLines) & 4294967295, textStyle: ts });
    if (forceHeight) {
      ts.heightMultiplier = 1;
      ps.heightMultiplier = 1;
    }
    let pb = MakeParagraphBuilder(ps);
    pb.pushStyle(ts);
    pb.addText(text);
    pb.pop();
    let ph = pb.build();
    ph.layout(width);
    pb.delete();
    return ph;
  }
}
var BindingOptions = /* @__PURE__ */ ((BindingOptions2) => {
  BindingOptions2[BindingOptions2["None"] = 0] = "None";
  BindingOptions2[BindingOptions2["AffectsVisual"] = 1] = "AffectsVisual";
  BindingOptions2[BindingOptions2["AffectsLayout"] = 2] = "AffectsLayout";
  return BindingOptions2;
})(BindingOptions || {});
class Binding {
  constructor(target, options = 0) {
    __publicField(this, "Target");
    __publicField(this, "Options");
    this.Target = new WeakRef(target);
    this.Options = options;
  }
}
class StateBase {
  constructor() {
    __publicField(this, "_bindings");
  }
  AddBinding(target, options) {
    if (this._bindings == null) {
      this._bindings = new System.List().Init([new Binding(target, options)]);
    } else {
      if (!this._bindings.Any((b) => b.Target.deref() === target)) {
        this._bindings.Add(new Binding(target, options));
      }
    }
  }
  RemoveBinding(target) {
    var _a;
    (_a = this._bindings) == null ? void 0 : _a.RemoveAll((b) => b.Target.deref() === target);
  }
  NotifyValueChanged() {
    if (this._bindings == null)
      return;
    for (let i = 0; i < this._bindings.length; i++) {
      let target = this._bindings[i].Target.deref();
      if (target == null) {
        this._bindings.RemoveAt(i);
        i--;
      } else {
        target.OnStateChanged(this, this._bindings[i].Options);
      }
    }
  }
}
class State extends StateBase {
  toString() {
    var _a, _b;
    return (_b = (_a = this.Value) == null ? void 0 : _a.toString()) != null ? _b : "";
  }
  AsStateOfString(formatter = null, parser = null) {
    return RxComputed.MakeAsString(this, formatter, parser);
  }
  AsStateOfBool(getter) {
    return RxComputed.Make1(this, getter);
  }
  static op_Implicit_From(value) {
    return new Rx(value);
  }
}
class Rx extends State {
  constructor(value) {
    super();
    __publicField(this, "_value");
    this._value = value;
  }
  get Readonly() {
    return false;
  }
  get Value() {
    return this._value;
  }
  set Value(value) {
    if (System.Equals(this._value, value))
      return;
    this._value = value;
    this.NotifyValueChanged();
  }
}
class RxComputed extends State {
  constructor(getter, setter) {
    super();
    __publicField(this, "_getter");
    __publicField(this, "_setter");
    this._getter = getter;
    this._setter = setter;
  }
  static MakeAsString(s, formatter = null, parser = null) {
    let computed = new RxComputed(formatter == null ? s.toString.bind(s) : () => formatter(s.Value), parser == null ? null : (v) => s.Value = parser(v));
    s.AddBinding(computed, BindingOptions.None);
    return computed;
  }
  static Make1(source, getter, setter = null) {
    let computed = new RxComputed(() => getter(source.Value), setter);
    source.AddBinding(computed, BindingOptions.None);
    return computed;
  }
  static Make2(s1, s2, getter, setter = null) {
    let computed = new RxComputed(() => getter(s1.Value, s2.Value), setter);
    s1.AddBinding(computed, BindingOptions.None);
    s2.AddBinding(computed, BindingOptions.None);
    return computed;
  }
  get Readonly() {
    return this._setter == null;
  }
  get Value() {
    return this._getter();
  }
  set Value(value) {
    var _a;
    try {
      (_a = this._setter) == null ? void 0 : _a.call(this, value);
    } catch (e) {
    }
  }
  OnStateChanged(state, options) {
    this.NotifyValueChanged();
  }
}
class RxList extends StateBase {
  constructor(source) {
    super();
    __publicField(this, "_source");
    this._source = source;
  }
  get Readonly() {
    return true;
  }
  Add(item) {
    this._source.Add(item);
    this.NotifyValueChanged();
  }
  Remove(item) {
    let res = this._source.Remove(item);
    if (res)
      this.NotifyValueChanged();
    return res;
  }
  Clear() {
    this._source.Clear();
    this.NotifyValueChanged();
  }
  Contains(item) {
    return this._source.Contains(item);
  }
  IndexOf(item) {
    return this._source.IndexOf(item);
  }
  Insert(index, item) {
    this._source.Insert(index, item);
    this.NotifyValueChanged();
  }
  RemoveAt(index) {
    this._source.RemoveAt(index);
    this.NotifyValueChanged();
  }
}
class RxProperty extends State {
  constructor(getter, setter = null, autoNotify = true) {
    super();
    __publicField(this, "_getter");
    __publicField(this, "_setter");
    this._getter = getter;
    if (setter == null || !autoNotify)
      this._setter = setter;
    else
      this._setter = (v) => {
        setter(v);
        this.NotifyValueChanged();
      };
  }
  get Readonly() {
    return this._setter == null;
  }
  get Value() {
    return this._getter();
  }
  set Value(value) {
    if (this._setter == null)
      throw new System.NotSupportedException();
    this._setter(value);
  }
}
class RxObject {
  constructor() {
    __publicField(this, "_target");
  }
  get Target() {
    return this._target;
  }
  set Target(value) {
    let old = this._target;
    this._target = value;
    this.OnTargetChanged(old);
  }
  OnTargetChanged(old) {
    const props = Object.getOwnPropertyNames(this);
    for (let prop of props) {
      if (this[prop] instanceof RxProperty) {
        this[prop].NotifyValueChanged();
      }
    }
  }
}
class ObjectNotifier {
  constructor() {
    __publicField(this, "_changeHandler");
  }
  set OnChange(value) {
    this._changeHandler = value;
  }
  Notify(obj) {
    var _a;
    (_a = this._changeHandler) == null ? void 0 : _a.call(this, obj);
  }
}
const _Radius = class {
  constructor(x, y) {
    __publicField(this, "X");
    __publicField(this, "Y");
    this.X = x;
    this.Y = y;
  }
  static Circular(radius) {
    return new _Radius(radius, radius);
  }
  static Elliptical(x, y) {
    return new _Radius(x, y);
  }
  static Lerp(a, b, t) {
    if (b == null) {
      if (a == null)
        return null;
      let k = 1 - t;
      return _Radius.Elliptical(a.X * k, a.Y * k);
    }
    if (a == null)
      return _Radius.Elliptical(b.X * t, b.Y * t);
    return _Radius.Elliptical(FloatUtils.Lerp(a.X, b.X, t), FloatUtils.Lerp(a.Y, b.Y, t));
  }
  static op_Multiply(pt, operand) {
    return new _Radius(pt.X * operand, pt.Y * operand);
  }
  Equals(other) {
    return this.X == other.X && this.Y == other.Y;
  }
  Clone() {
    return new _Radius(this.X, this.Y);
  }
};
let Radius = _Radius;
__publicField(Radius, "Empty", new _Radius(0, 0));
var BorderStyle = /* @__PURE__ */ ((BorderStyle2) => {
  BorderStyle2[BorderStyle2["None"] = 0] = "None";
  BorderStyle2[BorderStyle2["Solid"] = 1] = "Solid";
  return BorderStyle2;
})(BorderStyle || {});
const _BorderSide = class {
  constructor(color, width = 1, style = 1) {
    __publicField(this, "Color");
    __publicField(this, "Width");
    __publicField(this, "Style");
    this.Color = color;
    this.Width = width;
    this.Style = style;
  }
  ApplyPaint(paint) {
    paint.setStyle(CanvasKit.PaintStyle.Stroke);
    paint.setColor(this.Style == 1 ? this.Color : Color.Empty);
    paint.setStrokeWidth(this.Style == 1 ? this.Width : 0);
  }
  Lerp(a, b, t) {
    if (t == 0)
      return a;
    if (t == 1)
      return b;
    let width = FloatUtils.Lerp(a.Width, b.Width, t);
    if (width < 0)
      return _BorderSide.Empty;
    if (a.Style == b.Style)
      return new _BorderSide(Color.Lerp(a.Color, b.Color, t), width, a.Style);
    let colorA = a.Style == 1 ? a.Color : a.Color.WithAlpha(0);
    let colorB = b.Style == 1 ? b.Color : b.Color.WithAlpha(0);
    return new _BorderSide(Color.Lerp(colorA, colorB, t), width);
  }
  Clone() {
    return new _BorderSide(this.Color, this.Width, this.Style);
  }
};
let BorderSide = _BorderSide;
__publicField(BorderSide, "Empty", new _BorderSide(Color.Empty, 0, 0));
const _BorderRadius = class {
  constructor(topLeft, topRight, bottomLeft, bottomRight) {
    __publicField(this, "TopLeft");
    __publicField(this, "TopRight");
    __publicField(this, "BottomLeft");
    __publicField(this, "BottomRight");
    this.TopLeft = topLeft;
    this.TopRight = topRight;
    this.BottomLeft = bottomLeft;
    this.BottomRight = bottomRight;
  }
  static All(radius) {
    return new _BorderRadius(radius, radius, radius, radius);
  }
  static Circular(radius) {
    return _BorderRadius.All(Radius.Circular(radius));
  }
  static Vertical(top, bottom) {
    return new _BorderRadius(top, top, bottom, bottom);
  }
  static Horizontal(left, right) {
    return new _BorderRadius(left, right, left, right);
  }
  static Lerp(a, b, t) {
    if (a == null && b == null)
      return null;
    if (a == null)
      return _BorderRadius.op_Multiply(b, t);
    if (b == null)
      return _BorderRadius.op_Multiply(a, 1 - t);
    return new _BorderRadius(Radius.Lerp(a.TopLeft, b.TopLeft, t), Radius.Lerp(a.TopRight, b.TopRight, t), Radius.Lerp(a.BottomLeft, b.BottomLeft, t), Radius.Lerp(a.BottomRight, b.BottomRight, t));
  }
  static op_Multiply(pt, operand) {
    return new _BorderRadius(Radius.op_Multiply(pt.TopLeft, operand), Radius.op_Multiply(pt.TopRight, operand), Radius.op_Multiply(pt.BottomLeft, operand), Radius.op_Multiply(pt.BottomRight, operand));
  }
  ToRRect(rect) {
    return RRect.FromRectAndCorner(rect.Clone(), this.TopLeft, this.TopRight, this.BottomLeft, this.BottomRight);
  }
  Clone() {
    return new _BorderRadius(this.TopLeft, this.TopRight, this.BottomLeft, this.BottomRight);
  }
};
let BorderRadius = _BorderRadius;
__publicField(BorderRadius, "Empty", _BorderRadius.All(Radius.Empty));
class ShapeBorder {
  LerpTo(to, tween, t) {
  }
}
class OutlinedBorder extends ShapeBorder {
  constructor(side) {
    super();
    __publicField(this, "Side");
    this.Side = side != null ? side : BorderSide.Empty;
  }
  get Dimensions() {
    return EdgeInsets.All(this.Side.Width);
  }
}
class InputBorder extends ShapeBorder {
  constructor(borderSide) {
    super();
    __privateAdd(this, _BorderSide2, BorderSide.Empty.Clone());
    this.BorderSide = borderSide != null ? borderSide : BorderSide.Empty;
  }
  get BorderSide() {
    return __privateGet(this, _BorderSide2);
  }
  set BorderSide(value) {
    __privateSet(this, _BorderSide2, value);
  }
  get Dimensions() {
    return EdgeInsets.All(this.BorderSide.Width);
  }
}
_BorderSide2 = new WeakMap();
const _OutlineInputBorder = class extends InputBorder {
  constructor(borderSide = null, borderRadius = null, gapPadding = 4) {
    super(borderSide != null ? borderSide : new BorderSide(new Color(4288387995)));
    __privateAdd(this, _BorderRadius2, BorderRadius.Empty.Clone());
    __privateAdd(this, _GapPadding, 0);
    if (gapPadding < 0)
      throw new System.ArgumentOutOfRangeException("gapPadding");
    this.BorderRadius = borderRadius != null ? borderRadius : BorderRadius.All(Radius.Circular(4));
    this.GapPadding = gapPadding;
  }
  get BorderRadius() {
    return __privateGet(this, _BorderRadius2);
  }
  set BorderRadius(value) {
    __privateSet(this, _BorderRadius2, value);
  }
  get GapPadding() {
    return __privateGet(this, _GapPadding);
  }
  set GapPadding(value) {
    __privateSet(this, _GapPadding, value);
  }
  GetOuterPath(rect) {
    throw new System.NotImplementedException();
  }
  GetInnerPath(rect) {
    throw new System.NotImplementedException();
  }
  LerpTo(to, tween, t) {
    if (to instanceof _OutlineInputBorder) {
      const other = to;
      let temp = tween;
      temp.BorderRadius = BorderRadius.Lerp(this.BorderRadius, other.BorderRadius, t);
      temp.BorderSide = this.BorderSide.Lerp(this.BorderSide, other.BorderSide, t);
      temp.GapPadding = other.GapPadding;
    } else {
      super.LerpTo(to, tween, t);
    }
  }
  Clone() {
    return new _OutlineInputBorder(this.BorderSide, this.BorderRadius, this.GapPadding);
  }
  Paint(canvas, rect, fillColor = null) {
    let outer = this.BorderRadius.ToRRect(rect);
    outer.Deflate(this.BorderSide.Width / 2, this.BorderSide.Width / 2);
    if (fillColor != null)
      canvas.drawRRect(outer, PaintUtils.Shared(fillColor));
    let paint = PaintUtils.Shared();
    this.BorderSide.ApplyPaint(paint);
    paint.setAntiAlias(true);
    canvas.drawRRect(outer, paint);
  }
};
let OutlineInputBorder = _OutlineInputBorder;
_BorderRadius2 = new WeakMap();
_GapPadding = new WeakMap();
class RoundedRectangleBorder extends OutlinedBorder {
  constructor(side = null, borderRadius = null) {
    super(side);
    __publicField(this, "BorderRadius");
    this.BorderRadius = borderRadius != null ? borderRadius : BorderRadius.Empty;
  }
  GetOuterPath(rect) {
    let rrect = this.BorderRadius.ToRRect(rect);
    rrect.Deflate(this.Side.Width, this.Side.Width);
    let path = new CanvasKit.Path();
    path.addRRect(rrect);
    return path;
  }
  GetInnerPath(rect) {
    let rrect = this.BorderRadius.ToRRect(rect);
    let path = new CanvasKit.Path();
    path.addRRect(rrect);
    return path;
  }
  LerpTo(to, tween, t) {
    throw new System.NotImplementedException();
  }
  CopyWith(side) {
    return new RoundedRectangleBorder(side != null ? side : this.Side, this.BorderRadius);
  }
  Clone() {
    throw new System.NotImplementedException();
  }
  Paint(canvas, rect, fillColor = null) {
    if (this.Side.Style == BorderStyle.None)
      return;
    let width = this.Side.Width;
    if (width == 0) {
      let paint = PaintUtils.Shared();
      this.Side.ApplyPaint(paint);
      let rrect = this.BorderRadius.ToRRect(rect);
      canvas.drawRRect(rrect, paint);
    } else {
      let outer = this.BorderRadius.ToRRect(rect);
      let inner = RRect.FromCopy(outer);
      inner.Deflate(width, width);
      let paint = PaintUtils.Shared(this.Side.Color);
      canvas.drawDRRect(outer, inner, paint);
    }
  }
}
class ClipperOfRect {
  constructor(rect, antiAlias = false) {
    __publicField(this, "_area", Rect.Empty.Clone());
    __publicField(this, "_antiAlias");
    this._area = rect.Clone();
    this._antiAlias = antiAlias;
  }
  Dispose() {
  }
  ApplyToCanvas(canvas) {
    canvas.clipRect(this._area, CanvasKit.ClipOp.Intersect, this._antiAlias);
  }
  get IsEmpty() {
    return this._area.IsEmpty;
  }
  Offset(dx, dy) {
    this._area.Offset(dx, dy);
  }
  GetRect() {
    return this._area;
  }
  GetPath() {
    throw new System.NotSupportedException();
  }
  IntersectWith(to) {
    if (to instanceof ClipperOfRect) {
      this._area.IntersectTo(to.GetRect());
      return this;
    }
    if (to instanceof ClipperOfPath) {
      return to.IntersectWith(this);
    }
    throw new System.NotSupportedException();
  }
}
class ClipperOfPath {
  constructor(path, antiAlias = true) {
    __publicField(this, "_area");
    __publicField(this, "_antiAlias");
    this._area = path;
    this._antiAlias = antiAlias;
  }
  Dispose() {
    this._area.delete();
  }
  ApplyToCanvas(canvas) {
    canvas.clipPath(this._area, CanvasKit.ClipOp.Intersect, this._antiAlias);
  }
  get IsEmpty() {
    return this._area.isEmpty();
  }
  Offset(dx, dy) {
    this._area.offset(dx, dy);
  }
  GetPath() {
    return this._area;
  }
  GetRect() {
    throw new System.NotSupportedException();
  }
  IntersectWith(to) {
    if (to instanceof ClipperOfRect) {
      let other = new CanvasKit.Path();
      other.addRect(to.GetRect());
      this._area.op(other, CanvasKit.PathOp.Intersect);
      other.delete();
      return this;
    }
    if (to instanceof ClipperOfPath) {
      this._area.op(to.GetPath(), CanvasKit.PathOp.Intersect);
      to.Dispose();
      return this;
    }
    throw new System.NotSupportedException();
  }
}
class Theme {
}
__publicField(Theme, "DefaultFontSize", 15);
__publicField(Theme, "FocusedColor", new Color(4280391411));
__publicField(Theme, "FocusedBorderWidth", 2);
__publicField(Theme, "CaretColor", new Color(4280391411));
__publicField(Theme, "AccentColor", new Color(4294410779));
__publicField(Theme, "DisabledBgColor", new Color(4294309882));
class WidgetRef {
  constructor() {
    __privateAdd(this, _Widget2, void 0);
  }
  get Widget() {
    return __privateGet(this, _Widget2);
  }
  set Widget(value) {
    __privateSet(this, _Widget2, value);
  }
  SetWidget(widget) {
    this.Widget = widget;
  }
}
_Widget2 = new WeakMap();
function IsInterfaceOfIRootWidget(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && "$meta_PixUI_IRootWidget" in obj.constructor;
}
const _Widget = class {
  constructor() {
    __publicField(this, "_states");
    __publicField(this, "DebugLabel");
    __publicField(this, "_flag", 0);
    __privateAdd(this, _X3, 0);
    __privateAdd(this, _Y3, 0);
    __privateAdd(this, _W, 0);
    __privateAdd(this, _H, 0);
    __publicField(this, "CachedAvailableWidth", NaN);
    __publicField(this, "CachedAvailableHeight", NaN);
    __publicField(this, "_width");
    __publicField(this, "_height");
    __publicField(this, "_parent");
  }
  get IsOpaque() {
    return false;
  }
  get Clipper() {
    return null;
  }
  set Ref(value) {
    value.SetWidget(this);
  }
  SetFlagValue(value, mask) {
    if (value)
      this._flag |= mask;
    else
      this._flag &= ~mask;
  }
  get SuspendingMount() {
    return (this._flag & _Widget.SuspendingMountMask) == _Widget.SuspendingMountMask;
  }
  set SuspendingMount(value) {
    this.SetFlagValue(value, _Widget.SuspendingMountMask);
  }
  get HasLayout() {
    return (this._flag & _Widget.HasLayoutMask) == _Widget.HasLayoutMask;
  }
  set HasLayout(value) {
    this.SetFlagValue(value, _Widget.HasLayoutMask);
  }
  get IsLayoutTight() {
    return (this._flag & _Widget.LayoutTightMask) == _Widget.LayoutTightMask;
  }
  set IsLayoutTight(value) {
    if (value == this.IsLayoutTight)
      return;
    this.SetFlagValue(value, _Widget.LayoutTightMask);
    if (this.IsMounted)
      this.Invalidate(InvalidAction.Relayout);
  }
  get IsMounted() {
    return (this._flag & _Widget.MountedMask) == _Widget.MountedMask;
  }
  set IsMounted(value) {
    if (value) {
      this._flag |= _Widget.MountedMask;
      this.OnMounted();
    } else {
      this._flag &= ~_Widget.MountedMask;
      this.OnUnmounted();
    }
  }
  OnMounted() {
  }
  OnUnmounted() {
  }
  get X() {
    return __privateGet(this, _X3);
  }
  set X(value) {
    __privateSet(this, _X3, value);
  }
  get Y() {
    return __privateGet(this, _Y3);
  }
  set Y(value) {
    __privateSet(this, _Y3, value);
  }
  get W() {
    return __privateGet(this, _W);
  }
  set W(value) {
    __privateSet(this, _W, value);
  }
  get H() {
    return __privateGet(this, _H);
  }
  set H(value) {
    __privateSet(this, _H, value);
  }
  get Width() {
    return this._width;
  }
  set Width(value) {
    this._width = this.Rebind(this._width, value, BindingOptions.AffectsLayout);
  }
  get Height() {
    return this._height;
  }
  set Height(value) {
    this._height = this.Rebind(this._height, value, BindingOptions.AffectsLayout);
  }
  get AutoSize() {
    return this._width == null || this._height == null;
  }
  SetPosition(x, y) {
    this.X = x;
    this.Y = y;
  }
  SetSize(w, h) {
    this.W = w;
    this.H = h;
  }
  get Parent() {
    return this._parent;
  }
  set Parent(value) {
    if (value == null && this._parent == null)
      return;
    if (IsInterfaceOfIRootWidget(this) && value != null)
      throw new System.InvalidOperationException("Can't set parent for IRootWidget");
    if (this._parent != null && value != null && !this.SuspendingMount)
      throw new System.InvalidOperationException("Widget already has parent");
    if (this.SuspendingMount && value == null)
      return;
    this._parent = value;
    if (this._parent == null) {
      this.Unmount();
    } else {
      if (this._parent.IsMounted)
        this.Mount();
    }
  }
  get Root() {
    if (this._parent != null)
      return this._parent.Root;
    if (IsInterfaceOfIRootWidget(this)) {
      const root = this;
      return root;
    }
    return null;
  }
  get CurrentNavigator() {
    let routeView = this.FindParent((w) => w instanceof RouteView);
    if (routeView == null)
      return null;
    return routeView.Navigator;
  }
  VisitChildren(action) {
  }
  IndexOfChild(child) {
    let index = -1;
    let found = -1;
    this.VisitChildren((item) => {
      index++;
      if (!(item === child))
        return false;
      found = index;
      return true;
    });
    return found;
  }
  FindParent(predicate) {
    var _a;
    return predicate(this) ? this : (_a = this._parent) == null ? void 0 : _a.FindParent(predicate);
  }
  IsAnyParentOf(child) {
    if ((child == null ? void 0 : child.Parent) == null)
      return false;
    return child.Parent === this || this.IsAnyParentOf(child.Parent);
  }
  ContainsPoint(x, y) {
    return x >= 0 && x < this.W && y >= 0 && y < this.H;
  }
  HitTest(x, y, result) {
    if (!this.ContainsPoint(x, y))
      return false;
    if (result.Add(this))
      return true;
    this.VisitChildren((child) => this.HitTestChild(child, x, y, result));
    return true;
  }
  HitTestChild(child, x, y, result) {
    let scrollOffsetX = 0;
    let scrollOffsetY = 0;
    if (IsInterfaceOfIScrollable(this)) {
      const scrollable = this;
      scrollOffsetX = scrollable.ScrollOffsetX;
      scrollOffsetY = scrollable.ScrollOffsetY;
    }
    let hit = child.HitTest(x - child.X + scrollOffsetX, y - child.Y + scrollOffsetY, result);
    return hit;
  }
  Compute1(s, getter) {
    return RxComputed.Make1(s, getter);
  }
  Compute2(s1, s2, getter, setter = null) {
    return RxComputed.Make2(s1, s2, getter, setter);
  }
  Bind(newState, options = BindingOptions.AffectsVisual) {
    return this.Rebind(null, newState, options);
  }
  Rebind(oldState, newState, options = BindingOptions.AffectsVisual) {
    oldState == null ? void 0 : oldState.RemoveBinding(this);
    if (newState == null)
      return newState;
    newState.AddBinding(this, options);
    if (this._states == null) {
      this._states = new System.List().Init([newState]);
    } else if (!this._states.Contains(newState)) {
      this._states.Add(newState);
    }
    return newState;
  }
  Mount() {
    if (this.SuspendingMount)
      return;
    this.IsMounted = true;
    this.VisitChildren((child) => {
      child.Mount();
      return false;
    });
  }
  Unmount() {
    if (this.SuspendingMount)
      return;
    this.IsMounted = false;
    this.VisitChildren((child) => {
      child.Unmount();
      return false;
    });
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    let hasChildren = false;
    this.SetSize(0, 0);
    this.VisitChildren((child) => {
      hasChildren = true;
      child.Layout(width, height);
      this.SetSize(Math.max(this.W, child.W), Math.max(this.H, child.H));
      return false;
    });
    if (!hasChildren)
      this.SetSize(width, height);
  }
  CacheAndCheckAssignWidth(availableWidth) {
    this.CachedAvailableWidth = Math.max(0, availableWidth);
    return this.Width == null ? this.CachedAvailableWidth : Math.min(Math.max(0, this.Width.Value), this.CachedAvailableWidth);
  }
  CacheAndCheckAssignHeight(availableHeight) {
    this.CachedAvailableHeight = Math.max(0, availableHeight);
    return this.Height == null ? this.CachedAvailableHeight : Math.min(Math.max(0, this.Height.Value), this.CachedAvailableHeight);
  }
  OnChildSizeChanged(child, dx, dy, affects) {
    console.assert(this.AutoSize);
    let oldWidth = this.W;
    let oldHeight = this.H;
    this.Layout(this.CachedAvailableWidth, this.CachedAvailableHeight);
    this.TryNotifyParentIfSizeChanged(oldWidth, oldHeight, affects);
  }
  TryNotifyParentIfSizeChanged(oldWidth, oldHeight, affects) {
    let dx = this.W - oldWidth;
    let dy = this.H - oldHeight;
    if (dx != 0 || dy != 0) {
      affects.Widget = this;
      affects.OldX = this.X;
      affects.OldY = this.Y;
      affects.OldW = oldWidth;
      affects.OldH = oldHeight;
      if (this.Parent != null && this.Parent.AutoSize)
        this.Parent.OnChildSizeChanged(this, dx, dy, affects);
    }
  }
  LocalToWindow(x, y) {
    let temp = this;
    while (temp != null) {
      x += temp.X;
      y += temp.Y;
      if (IsInterfaceOfIScrollable(temp.Parent)) {
        const scrollable = temp.Parent;
        x -= scrollable.ScrollOffsetX;
        y -= scrollable.ScrollOffsetY;
      } else if (temp.Parent instanceof Transform) {
        const transform = temp.Parent;
        let transformed = MatrixUtils.TransformPoint(transform.EffectiveTransform, x, y);
        x = transformed.Dx;
        y = transformed.Dy;
      }
      temp = temp.Parent;
    }
    return new Point(x, y);
  }
  Paint(canvas, area = null) {
    this.PaintChildren(canvas, area);
  }
  PaintChildren(canvas, area = null) {
    this.VisitChildren((child) => {
      if (child.W <= 0 || child.H <= 0)
        return false;
      if (area != null && !area.IntersectsWith(child))
        return false;
      let needTranslate = child.X != 0 || child.Y != 0;
      if (needTranslate)
        canvas.translate(child.X, child.Y);
      child.Paint(canvas, area == null ? void 0 : area.ToChild(child));
      if (needTranslate)
        canvas.translate(-child.X, -child.Y);
      PaintDebugger.PaintWidgetBorder(child, canvas);
      return false;
    });
  }
  Invalidate(action, area = null) {
    InvalidQueue.Add(this, action, area);
  }
  OnStateChanged(state, options) {
    if (options == BindingOptions.AffectsLayout) {
      InvalidQueue.Add(this, InvalidAction.Relayout, null);
    } else if (options == BindingOptions.AffectsVisual) {
      InvalidQueue.Add(this, InvalidAction.Repaint, null);
    }
  }
  get Overlay() {
    var _a;
    return (_a = this.Root) == null ? void 0 : _a.Window.Overlay;
  }
  ClearBindings() {
    if (this._states == null)
      return;
    for (const state of this._states) {
      state.RemoveBinding(this);
    }
    this._states = null;
  }
  Dispose() {
    this.ClearBindings();
    this.Parent = null;
  }
  toString() {
    var _a;
    return `${this.constructor.name}[${(_a = this.DebugLabel) != null ? _a : ""}]`;
  }
};
let Widget = _Widget;
_X3 = new WeakMap();
_Y3 = new WeakMap();
_W = new WeakMap();
_H = new WeakMap();
__publicField(Widget, "MountedMask", 1);
__publicField(Widget, "HasLayoutMask", 2);
__publicField(Widget, "LayoutTightMask", 1 << 3);
__publicField(Widget, "SuspendingMountMask", 1 << 20);
class WidgetController {
  constructor() {
    __publicField(this, "_widget");
  }
  get Widget() {
    return this._widget;
  }
  AttachWidget(widget) {
    if (this._widget != null)
      throw new System.InvalidOperationException();
    this._widget = widget;
  }
}
class SingleChildWidget extends Widget {
  constructor() {
    super();
    __publicField(this, "_child");
    __publicField(this, "_padding");
    this.IsLayoutTight = true;
  }
  get Padding() {
    return this._padding;
  }
  set Padding(value) {
    this._padding = this.Rebind(this._padding, value, BindingOptions.AffectsLayout);
  }
  get Child() {
    return this._child;
  }
  set Child(value) {
    if (this._child != null)
      this._child.Parent = null;
    this._child = value;
    if (this._child != null)
      this._child.Parent = this;
  }
  VisitChildren(action) {
    if (this._child != null)
      action(this._child);
  }
  Layout(availableWidth, availableHeight) {
    var _a, _b;
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    let padding = (_b = (_a = this._padding) == null ? void 0 : _a.Value) != null ? _b : EdgeInsets.All(0);
    if (this.Child == null) {
      if (this.IsLayoutTight)
        this.SetSize(0, 0);
      else
        this.SetSize(width, height);
      return;
    }
    this.Child.Layout(width - padding.Left - padding.Right, height - padding.Top - padding.Bottom);
    this.Child.SetPosition(padding.Left, padding.Top);
    if (this.IsLayoutTight)
      this.SetSize(this.Child.W + padding.Left + padding.Right, this.Child.H + padding.Top + padding.Bottom);
    else
      this.SetSize(width, height);
  }
  OnChildSizeChanged(child, dx, dy, affects) {
    console.assert(this.AutoSize);
    if (!this.IsLayoutTight)
      return;
    let oldWidth = this.W;
    let oldHeight = this.H;
    this.SetSize(oldWidth + dx, oldHeight + dy);
    this.TryNotifyParentIfSizeChanged(oldWidth, oldHeight, affects);
  }
}
class MultiChildWidget extends Widget {
  constructor() {
    super();
    __publicField(this, "_children");
    this._children = new WidgetList(this);
  }
  set Children(value) {
    this._children.Clear();
    for (const child of value) {
      this._children.Add(child);
    }
  }
  GetChildAt(index) {
    return this._children[index];
  }
  VisitChildren(action) {
    for (const child of this._children) {
      if (action(child))
        break;
    }
  }
  IndexOfChild(child) {
    return this._children.IndexOf(child);
  }
}
class Root extends SingleChildWidget {
  constructor(window2, child) {
    super();
    __privateAdd(this, _Window, void 0);
    this.Window = window2;
    this.IsMounted = true;
    this.Child = child;
  }
  get Window() {
    return __privateGet(this, _Window);
  }
  set Window(value) {
    __privateSet(this, _Window, value);
  }
  Layout(availableWidth, availableHeight) {
    this.CachedAvailableWidth = availableWidth;
    this.CachedAvailableHeight = availableHeight;
    this.SetPosition(0, 0);
    this.SetSize(availableWidth, availableHeight);
    this.Child.Layout(this.W, this.H);
  }
  OnChildSizeChanged(child, dx, dy, affects) {
  }
}
_Window = new WeakMap();
__publicField(Root, "$meta_PixUI_IRootWidget", true);
class View extends SingleChildWidget {
  constructor() {
    super(...arguments);
    __publicField(this, "_bgBgColor");
  }
  get BgColor() {
    return this._bgBgColor;
  }
  set BgColor(value) {
    this._bgBgColor = this.Rebind(this._bgBgColor, value, BindingOptions.AffectsVisual);
  }
  get IsOpaque() {
    return this._bgBgColor != null && this._bgBgColor.Value.IsOpaque;
  }
  Paint(canvas, area = null) {
    if (this._bgBgColor != null)
      canvas.drawRect(Rect.FromLTWH(0, 0, this.W, this.H), PaintUtils.Shared(this._bgBgColor.Value));
    this.PaintChildren(canvas, area);
  }
}
class Transform extends SingleChildWidget {
  constructor(transform, origin = null) {
    super();
    __publicField(this, "_transform", Matrix4.Empty.Clone());
    __publicField(this, "_origin");
    this.SetTransform(transform.Clone());
    this.Origin = origin;
  }
  get Origin() {
    return this._origin;
  }
  set Origin(value) {
    if (System.OpEquality(this._origin, value))
      return;
    this._origin = value;
    this.NeedInvalidate();
  }
  InitTransformAndOrigin(value, origin = null) {
    this._transform = value.Clone();
    this._origin = origin;
  }
  SetTransform(value) {
    if (System.OpEquality(this._transform, value))
      return;
    this._transform = value.Clone();
    this.NeedInvalidate();
  }
  NeedInvalidate() {
    if (this.IsMounted)
      this.Invalidate(InvalidAction.Repaint);
  }
  get EffectiveTransform() {
    if (this._origin == null)
      return this._transform;
    let result = Matrix4.CreateIdentity();
    if (this._origin != null)
      result.Translate(this._origin.Dx, this._origin.Dy);
    result.Multiply(this._transform);
    if (this._origin != null)
      result.Translate(-this._origin.Dx, -this._origin.Dy);
    return result;
  }
  HitTest(x, y, result) {
    if (this.Child == null)
      return false;
    let effectiveTransform = this.EffectiveTransform.Clone();
    let transform = Matrix4.TryInvert(PointerEvent.RemovePerspectiveTransform(effectiveTransform.Clone()));
    if (transform == null) {
      return false;
    }
    let transformed = MatrixUtils.TransformPoint(transform, x, y);
    let hitChild = this.Child.HitTest(transformed.Dx, transformed.Dy, result);
    if (hitChild) {
      result.ConcatLastTransform(transform);
    }
    return hitChild;
  }
  Paint(canvas, area = null) {
    if (this.Child == null)
      return;
    canvas.save();
    canvas.concat(this.EffectiveTransform.TransponseTo());
    this.PaintChildren(canvas, area);
    canvas.restore();
  }
}
class Center extends SingleChildWidget {
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    if (this.Child != null) {
      this.Child.Layout(width, height);
      this.Child.SetPosition((width - this.Child.W) / 2, (height - this.Child.H) / 2);
    }
    this.SetSize(width, height);
  }
}
class Container extends SingleChildWidget {
  constructor() {
    super();
    __publicField(this, "_bgColor");
    this.IsLayoutTight = false;
  }
  get IsOpaque() {
    return this._bgColor != null && this._bgColor.Value.IsOpaque;
  }
  get BgColor() {
    return this._bgColor;
  }
  set BgColor(value) {
    this._bgColor = this.Rebind(this._bgColor, value, BindingOptions.AffectsVisual);
  }
  Paint(canvas, area = null) {
    if (this._bgColor != null)
      canvas.drawRect(Rect.FromLTWH(0, 0, this.W, this.H), PaintUtils.Shared(this._bgColor.Value));
    this.PaintChildren(canvas, area);
  }
}
class Expanded extends SingleChildWidget {
  constructor(child = null, flex = 1) {
    super();
    __privateAdd(this, _Flex, 1);
    this.Child = child;
    this.Flex = flex;
  }
  get Flex() {
    return __privateGet(this, _Flex);
  }
  set Flex(value) {
    __privateSet(this, _Flex, value);
  }
  Layout(availableWidth, availableHeight) {
    var _a, _b, _c, _d;
    this.CachedAvailableWidth = availableWidth;
    this.CachedAvailableHeight = availableHeight;
    if (this.Child != null) {
      this.Child.Layout(availableWidth, availableHeight);
      this.Child.SetPosition(0, 0);
    }
    let w = this.Parent instanceof Column ? (_b = (_a = this.Child) == null ? void 0 : _a.W) != null ? _b : 0 : availableWidth;
    let h = this.Parent instanceof Row ? (_d = (_c = this.Child) == null ? void 0 : _c.H) != null ? _d : 0 : availableHeight;
    this.SetSize(w, h);
  }
  OnChildSizeChanged(child, dx, dy, affects) {
    let oldWidth = this.W;
    let oldHeight = this.H;
    let w = this.Parent instanceof Column ? child.W : this.CachedAvailableWidth;
    let h = this.Parent instanceof Row ? child.H : this.CachedAvailableHeight;
    this.SetSize(w, h);
    this.TryNotifyParentIfSizeChanged(oldWidth, oldHeight, affects);
  }
}
_Flex = new WeakMap();
class Column extends MultiChildWidget {
  constructor(alignment = HorizontalAlignment.Center, spacing = 0, debugLabel = null) {
    super();
    __publicField(this, "_alignment");
    __publicField(this, "_spacing");
    __publicField(this, "_totalFlex", 0);
    if (spacing < 0)
      throw new System.ArgumentOutOfRangeException("spacing");
    this._alignment = alignment;
    this._spacing = spacing;
    this.DebugLabel = debugLabel;
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    let remaingHeight = height;
    let maxWidthOfChild = 0;
    this._totalFlex = 0;
    for (let i = 0; i < this._children.length; i++) {
      if (i != 0 && remaingHeight >= this._spacing)
        remaingHeight = Math.max(0, remaingHeight - this._spacing);
      let child = this._children[i];
      if (child instanceof Expanded) {
        const expanded = child;
        this._totalFlex += expanded.Flex;
        continue;
      }
      if (remaingHeight <= 0) {
        child.Layout(0, 0);
      } else {
        child.Layout(width, remaingHeight);
        maxWidthOfChild = Math.max(maxWidthOfChild, child.W);
        remaingHeight -= child.H;
      }
    }
    if (this._totalFlex > 0) {
      for (const child of this._children) {
        if (child instanceof Expanded) {
          const expanded = child;
          if (remaingHeight <= 0) {
            child.Layout(0, 0);
          } else {
            child.Layout(width, remaingHeight * (expanded.Flex / this._totalFlex));
            maxWidthOfChild = Math.max(maxWidthOfChild, child.W);
          }
        }
      }
    }
    let totalHeight = 0;
    for (let i = 0; i < this._children.length; i++) {
      if (i != 0)
        totalHeight += this._spacing;
      if (totalHeight >= height)
        break;
      let child = this._children[i];
      let childX = match(this._alignment).with(HorizontalAlignment.Right, () => maxWidthOfChild - child.W).with(HorizontalAlignment.Center, () => (maxWidthOfChild - child.W) / 2).otherwise(() => 0);
      child.SetPosition(childX, totalHeight);
      totalHeight += child.H;
    }
    this.SetSize(maxWidthOfChild, Math.min(height, totalHeight));
  }
  OnChildSizeChanged(child, dx, dy, affects) {
    console.assert(this.AutoSize);
    let oldWidth = this.W;
    let oldHeight = this.H;
    let width = this.Width == null ? this.CachedAvailableWidth : Math.min(this.Width.Value, this.CachedAvailableWidth);
    this.Height == null ? this.CachedAvailableHeight : Math.min(this.Height.Value, this.CachedAvailableHeight);
    if (dx != 0) {
      let newWidth = 0;
      for (const item of this._children) {
        newWidth = Math.min(Math.max(item.W, newWidth), width);
      }
      this.SetSize(newWidth, oldHeight);
      for (const item of this._children) {
        let childX = match(this._alignment).with(HorizontalAlignment.Right, () => this.W - item.W).with(HorizontalAlignment.Center, () => (this.W - item.W) / 2).otherwise(() => 0);
        item.SetPosition(childX, item.Y);
      }
    }
    if (dy != 0) {
      if (this._totalFlex > 0) {
        throw new System.NotImplementedException();
      } else {
        let indexOfChild = this._children.IndexOf(child);
        for (let i = indexOfChild + 1; i < this._children.length; i++) {
          this._children[i].SetPosition(this._children[i].X, this._children[i].Y + dy);
        }
        this.SetSize(this.W, this.H + dy);
      }
    }
    this.TryNotifyParentIfSizeChanged(oldWidth, oldHeight, affects);
  }
}
class Row extends MultiChildWidget {
  constructor(alignment = VerticalAlignment.Middle, spacing = 0) {
    super();
    __publicField(this, "_alignment");
    __publicField(this, "_spacing");
    if (spacing < 0)
      throw new System.ArgumentOutOfRangeException("spacing");
    this._alignment = alignment;
    this._spacing = spacing;
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    let remaingWidth = width;
    let maxHeightOfChild = 0;
    let hasExpanded = false;
    let totalFlex = 0;
    for (let i = 0; i < this._children.length; i++) {
      if (i != 0 && remaingWidth >= this._spacing)
        remaingWidth = Math.max(0, remaingWidth - this._spacing);
      let child = this._children[i];
      if (child instanceof Expanded) {
        const expanded = child;
        hasExpanded = true;
        totalFlex += expanded.Flex;
        continue;
      }
      if (remaingWidth <= 0) {
        child.Layout(0, 0);
      } else {
        child.Layout(remaingWidth, height);
        maxHeightOfChild = Math.max(maxHeightOfChild, child.H);
        remaingWidth -= child.W;
      }
    }
    if (hasExpanded) {
      for (const child of this._children) {
        if (child instanceof Expanded) {
          const expanded = child;
          if (remaingWidth <= 0) {
            child.Layout(0, 0);
          } else {
            child.Layout(remaingWidth * (expanded.Flex / totalFlex), height);
            maxHeightOfChild = Math.max(maxHeightOfChild, child.H);
          }
        }
      }
    }
    let totalWidth = 0;
    for (let i = 0; i < this._children.length; i++) {
      if (i != 0)
        totalWidth += this._spacing;
      if (totalWidth >= width)
        break;
      let child = this._children[i];
      let childY = match(this._alignment).with(VerticalAlignment.Bottom, () => maxHeightOfChild - child.H).with(VerticalAlignment.Middle, () => (maxHeightOfChild - child.H) / 2).otherwise(() => 0);
      child.SetPosition(totalWidth, childY);
      totalWidth += child.W;
    }
    this.SetSize(Math.min(width, totalWidth), maxHeightOfChild);
  }
}
class ListViewController extends WidgetController {
  constructor(axis = Axis.Vertical) {
    super();
    __publicField(this, "ScrollController");
    __publicField(this, "_dataSource");
    this.ScrollController = new ScrollController(axis == Axis.Vertical ? ScrollDirection.Vertical : ScrollDirection.Horizontal);
  }
  get DataSource() {
    return this._dataSource;
  }
  set DataSource(value) {
    this._dataSource = value;
    this.Widget.OnDataSourceChanged();
  }
  ScrollTo(index) {
    let toChild = this.Widget.GetChildAt(index);
    let offsetY = this.ScrollController.OffsetY;
    if (toChild.Y >= offsetY && toChild.Y + toChild.H <= this.Widget.H + offsetY)
      return;
    let deltaY = toChild.Y >= offsetY ? toChild.Y + toChild.H - this.Widget.H - offsetY : toChild.Y - offsetY;
    let offset = this.Widget.OnScroll(0, deltaY);
    if (!offset.IsEmpty)
      this.Widget.Root.Window.AfterScrollDone(this.Widget, offset);
  }
}
const _ListView = class extends MultiChildWidget {
  constructor(itemBuilder, dataSource = null, controller = null) {
    super();
    __publicField(this, "_controller");
    __publicField(this, "_itemBuilder");
    this._itemBuilder = itemBuilder;
    this._controller = controller != null ? controller : new ListViewController();
    this._controller.AttachWidget(this);
    if (dataSource != null)
      this._controller.DataSource = dataSource;
  }
  static From(widgets, controller = null) {
    return new _ListView((w, i) => w, widgets, controller);
  }
  OnDataSourceChanged() {
    this._children.Clear();
    if (this._controller.DataSource != null) {
      for (let i = 0; i < this._controller.DataSource.length; i++) {
        this._children.Add(this._itemBuilder(this._controller.DataSource[i], i));
      }
    }
    if (this.IsMounted)
      this.Invalidate(InvalidAction.Relayout);
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    let y = 0;
    for (const child of this._children) {
      child.Layout(width, Number.POSITIVE_INFINITY);
      child.SetPosition(0, y);
      y += child.H;
    }
    this.SetSize(width, height);
  }
  Paint(canvas, area = null) {
    canvas.save();
    canvas.clipRect(Rect.FromLTWH(0, 0, this.W, this.H), CanvasKit.ClipOp.Intersect, false);
    let offset = this._controller.ScrollController.OffsetY;
    for (const child of this._children) {
      if (child.Y + child.H <= offset)
        continue;
      canvas.translate(0, child.Y - offset);
      child.Paint(canvas, null);
      canvas.translate(0, offset - child.Y);
    }
    canvas.restore();
  }
  get ScrollOffsetX() {
    return this._controller.ScrollController.OffsetX;
  }
  get ScrollOffsetY() {
    return this._controller.ScrollController.OffsetY;
  }
  OnScroll(dx, dy) {
    if (this._children.length == 0)
      return Offset.Empty;
    let lastChild = this._children[this._children.length - 1];
    if (lastChild.Y + lastChild.H <= this.H)
      return Offset.Empty;
    let maxOffsetX = 0;
    let maxOffsetY = lastChild.Y + lastChild.H - this.H;
    let offset = this._controller.ScrollController.OnScroll(dx, dy, maxOffsetX, maxOffsetY);
    if (!offset.IsEmpty)
      this.Invalidate(InvalidAction.Repaint);
    return offset;
  }
};
let ListView = _ListView;
__publicField(ListView, "$meta_PixUI_IScrollable", true);
const _Card = class extends SingleChildWidget {
  constructor() {
    super(...arguments);
    __publicField(this, "_margin");
    __publicField(this, "_elevation");
    __publicField(this, "_color");
    __publicField(this, "_shadowColor");
    __publicField(this, "_shape");
  }
  get Color() {
    return this._color;
  }
  set Color(value) {
    this._color = this.Rebind(this._color, value, BindingOptions.AffectsVisual);
  }
  get ShadowColor() {
    return this._shadowColor;
  }
  set ShadowColor(value) {
    this._shadowColor = this.Rebind(this._shadowColor, value, BindingOptions.AffectsVisual);
  }
  get Elevation() {
    return this._elevation;
  }
  set Elevation(value) {
    this._elevation = this.Rebind(this._elevation, value, BindingOptions.AffectsVisual);
  }
  get Margin() {
    return this._margin;
  }
  set Margin(value) {
    this._margin = this.Rebind(this._margin, value, BindingOptions.AffectsLayout);
  }
  get Shape() {
    return this._shape;
  }
  set Shape(value) {
    this._shape = this.Rebind(this._shape, value, BindingOptions.AffectsLayout);
  }
  Layout(availableWidth, availableHeight) {
    var _a, _b, _c, _d;
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    if (this.Child == null) {
      this.SetSize(width, height);
      return;
    }
    let margin = (_b = (_a = this._margin) == null ? void 0 : _a.Value) != null ? _b : EdgeInsets.All(_Card.DefaultMargin);
    let padding = (_d = (_c = this.Padding) == null ? void 0 : _c.Value) != null ? _d : EdgeInsets.All(0);
    this.Child.Layout(width - margin.Horizontal - padding.Horizontal, height - margin.Vertical - padding.Vertical);
    this.Child.SetPosition(margin.Left + padding.Left, margin.Top + padding.Top);
    this.SetSize(this.Child.W + margin.Horizontal + padding.Horizontal, this.Child.H + margin.Vertical + padding.Vertical);
  }
  get Clipper() {
    var _a, _b;
    let shape = (_b = (_a = this._shape) == null ? void 0 : _a.Value) != null ? _b : _Card.DefaultShape;
    let rect = this.GetChildRect();
    let path = shape.GetOuterPath(rect);
    return new ClipperOfPath(path);
  }
  GetChildRect() {
    var _a, _b;
    let margin = (_b = (_a = this._margin) == null ? void 0 : _a.Value) != null ? _b : EdgeInsets.All(_Card.DefaultMargin);
    return Rect.FromLTWH(margin.Left, margin.Top, this.W - margin.Left - margin.Right, this.H - margin.Top - margin.Bottom);
  }
  Paint(canvas, area = null) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    let color = (_b = (_a = this._color) == null ? void 0 : _a.Value) != null ? _b : Colors.White;
    let shadowColor = (_d = (_c = this._shadowColor) == null ? void 0 : _c.Value) != null ? _d : Colors.Black;
    let elevation = (_f = (_e = this._elevation) == null ? void 0 : _e.Value) != null ? _f : 2;
    let rect = this.GetChildRect();
    let shape = (_h = (_g = this._shape) == null ? void 0 : _g.Value) != null ? _h : _Card.DefaultShape;
    let clipper = this.Clipper;
    let outer = clipper.GetPath();
    if (elevation > 0) {
      DrawShadow(canvas, outer, shadowColor, elevation, shadowColor.Alpha != 255, this.Root.Window.ScaleFactor);
    }
    canvas.save();
    clipper.ApplyToCanvas(canvas);
    canvas.clear(color);
    shape.Paint(canvas, rect);
    this.PaintChildren(canvas, area);
    canvas.restore();
    clipper.Dispose();
  }
};
let Card = _Card;
__publicField(Card, "DefaultMargin", 4);
__publicField(Card, "DefaultShape", new RoundedRectangleBorder(null, BorderRadius.All(Radius.Circular(4))));
class DynamicView extends SingleChildWidget {
  constructor() {
    super();
    __publicField(this, "_animationController");
    __publicField(this, "_animationFrom");
    __publicField(this, "_animationTo");
    __publicField(this, "_transitionStack");
    this.IsLayoutTight = false;
  }
  ReplaceTo(to) {
    if (!this.IsMounted) {
      this.Child = to;
      return;
    }
    this.Root.Window.BeforeDynamicViewChange(this);
    this.Child = to;
    this.Root.Window.AfterDynamicViewChange(this);
    this.Invalidate(InvalidAction.Relayout);
  }
  AnimateTo(from, to, duration, reverse, enteringBuilder, existingBuilder) {
    this._animationFrom = from;
    this._animationTo = to;
    this.Root.Window.BeforeDynamicViewChange(this);
    this.CreateAnimationControl(duration, reverse);
    let exsiting = existingBuilder == null ? from : existingBuilder(this._animationController, from);
    let entering = enteringBuilder(this._animationController, to);
    this._transitionStack = new TransitionStack(exsiting, entering);
    this.Child = this._transitionStack;
    this.Layout(this.CachedAvailableWidth, this.CachedAvailableHeight);
    if (reverse)
      this._animationController.Reverse();
    else
      this._animationController.Forward();
  }
  CreateAnimationControl(duration, reverse) {
    let initValue = reverse ? 1 : 0;
    this._animationController = new AnimationController(duration, initValue);
    this._animationController.ValueChanged.Add(this.OnAnimationValueChanged, this);
    this._animationController.StatusChanged.Add(this.OnAnimationStatusChanged, this);
  }
  OnAnimationValueChanged() {
    this.Invalidate(InvalidAction.Repaint);
  }
  OnAnimationStatusChanged(status) {
    if (status == AnimationStatus.Completed || status == AnimationStatus.Dismissed) {
      this._animationController.ValueChanged.Remove(this.OnAnimationValueChanged, this);
      this._animationController.StatusChanged.Remove(this.OnAnimationStatusChanged, this);
      this._animationController.Dispose();
      this._animationController = null;
      if (this._animationFrom.SuspendingMount) {
        this._animationFrom.SuspendingMount = false;
        this._animationFrom.Parent = null;
        this._animationTo.SuspendingMount = true;
      } else {
        this._animationTo.SuspendingMount = false;
        this._animationTo.Parent = null;
        this._animationFrom.SuspendingMount = true;
      }
      this.Child = status == AnimationStatus.Dismissed ? this._animationFrom : this._animationTo;
      if (this._animationTo.SuspendingMount)
        this._animationTo.SuspendingMount = false;
      else
        this._animationFrom.SuspendingMount = false;
      this._transitionStack.Dispose();
      this._transitionStack = null;
      this.Root.Window.AfterDynamicViewChange(this);
    }
  }
  HitTest(x, y, result) {
    if (this._animationController != null && this._animationController.Status != AnimationStatus.Dismissed && this._animationController.Status != AnimationStatus.Completed) {
      if (!this.ContainsPoint(x, y))
        return false;
      result.Add(this);
      return true;
    }
    return super.HitTest(x, y, result);
  }
  get Clipper() {
    return this.Parent == null ? null : new ClipperOfRect(Rect.FromLTWH(0, 0, this.W, this.H));
  }
  Paint(canvas, area = null) {
    let clipper = this.Clipper;
    if (clipper != null) {
      canvas.save();
      clipper.ApplyToCanvas(canvas);
    }
    this.PaintChildren(canvas, area);
    if (clipper != null)
      canvas.restore();
    clipper == null ? void 0 : clipper.Dispose();
  }
}
const _RouteSettings = class {
};
let RouteSettings = _RouteSettings;
__publicField(RouteSettings, "Empty", new _RouteSettings());
class Route {
  constructor(name, builder, enteringBuilder = null, existingBuilder = null, duration = 200, reverseDuration = 200, isDynamic = false) {
    __publicField(this, "Name");
    __publicField(this, "Dynamic");
    __publicField(this, "Builder");
    __publicField(this, "Duration");
    __publicField(this, "ReverseDuration");
    __publicField(this, "EnteringBuilder");
    __publicField(this, "ExistingBuilder");
    this.Name = name;
    this.Dynamic = isDynamic;
    this.Builder = builder;
    this.Duration = duration;
    this.ReverseDuration = reverseDuration;
    this.EnteringBuilder = enteringBuilder;
  }
}
class TransitionStack extends Widget {
  constructor(from, to) {
    super();
    __publicField(this, "_from");
    __publicField(this, "_to");
    this._from = from;
    this._from.Parent = this;
    this._to = to;
    this._to.Parent = this;
  }
  VisitChildren(action) {
    if (!this.IsMounted)
      return;
    if (action(this._from))
      return;
    action(this._to);
  }
  Layout(availableWidth, availableHeight) {
    this.CachedAvailableWidth = availableWidth;
    this.CachedAvailableHeight = availableHeight;
    this.SetSize(availableWidth, availableHeight);
    this._from.Layout(this.W, this.H);
    this._from.SetPosition(0, 0);
    this._to.Layout(this.W, this.H);
    this._to.SetPosition(0, 0);
  }
  OnChildSizeChanged(child, dx, dy, affects) {
  }
  Paint(canvas, area = null) {
    this._from.Paint(canvas, area);
    this._to.Paint(canvas, area);
  }
}
var RouteChangeAction = /* @__PURE__ */ ((RouteChangeAction2) => {
  RouteChangeAction2[RouteChangeAction2["Push"] = 0] = "Push";
  RouteChangeAction2[RouteChangeAction2["Pop"] = 1] = "Pop";
  return RouteChangeAction2;
})(RouteChangeAction || {});
class RouteEntry {
  constructor(route, settings) {
    __publicField(this, "_settings");
    __publicField(this, "_widget");
    __privateAdd(this, _Route, void 0);
    this.Route = route;
    this._settings = settings;
  }
  get Route() {
    return __privateGet(this, _Route);
  }
  set Route(value) {
    __privateSet(this, _Route, value);
  }
  GetWidget() {
    if (this._widget != null)
      return this._widget;
    this._widget = this.Route.Builder(this._settings);
    return this._widget;
  }
}
_Route = new WeakMap();
class Navigator {
  constructor(routes) {
    __publicField(this, "_routes", new System.List());
    __publicField(this, "_history", new System.List());
    __publicField(this, "_histroyIndex", -1);
    __publicField(this, "OnRouteChanged");
    this._routes.AddRange(routes);
  }
  GetCurrentRoute() {
    if (this._routes.length == 0)
      return new Text(State.op_Implicit_From("Empty routes"));
    if (this._history.length != 0)
      return this._history[this._histroyIndex].GetWidget();
    let entry = new RouteEntry(this._routes[0], RouteSettings.Empty);
    this._history.Add(entry);
    this._histroyIndex = 0;
    return entry.GetWidget();
  }
  PushNamed(name) {
    var _a;
    if (this._histroyIndex != this._history.length - 1) {
      this._history.RemoveRange(this._histroyIndex + 1, this._history.length - this._histroyIndex - 1);
    }
    let matchRoute = this._routes.Find((r) => r.Name == name);
    if (matchRoute == null)
      throw new System.ArgumentException(`Can't find route: ${name}`);
    let entry = new RouteEntry(matchRoute, new RouteSettings());
    this._history.Add(entry);
    this._histroyIndex++;
    (_a = this.OnRouteChanged) == null ? void 0 : _a.call(this, 0, matchRoute);
  }
  Pop() {
    var _a;
    if (this._histroyIndex <= 0)
      return;
    let oldEntry = this._history[this._histroyIndex];
    this._histroyIndex--;
    (_a = this.OnRouteChanged) == null ? void 0 : _a.call(this, 1, oldEntry.Route);
  }
}
class RouteView extends DynamicView {
  constructor(navigator2) {
    super();
    __privateAdd(this, _Navigator, void 0);
    this.Navigator = navigator2;
    this.Navigator.OnRouteChanged = this.OnRouteChanged.bind(this);
    this.Child = this.Navigator.GetCurrentRoute();
  }
  get Navigator() {
    return __privateGet(this, _Navigator);
  }
  set Navigator(value) {
    __privateSet(this, _Navigator, value);
  }
  OnRouteChanged(action, route) {
    if (route.EnteringBuilder == null) {
      this.ReplaceTo(this.Navigator.GetCurrentRoute());
    } else {
      let from = this.Child;
      from.SuspendingMount = true;
      let to;
      let reverse = action == RouteChangeAction.Pop;
      if (reverse) {
        to = from;
        from = this.Navigator.GetCurrentRoute();
      } else {
        to = this.Navigator.GetCurrentRoute();
      }
      this.AnimateTo(from, to, route.Duration, reverse, route.EnteringBuilder, route.ExistingBuilder);
    }
  }
}
_Navigator = new WeakMap();
class WhenBuilder {
  constructor(match2, builder) {
    __publicField(this, "Match");
    __publicField(this, "Builder");
    __publicField(this, "_cachedWidget");
    this.Match = match2;
    this.Builder = builder;
  }
  GetWidget() {
    if (this._cachedWidget == null)
      this._cachedWidget = this.Builder();
    return this._cachedWidget;
  }
}
class Conditional extends DynamicView {
  constructor(state) {
    super();
    __publicField(this, "_state");
    __publicField(this, "_whens", new System.List());
    this.IsLayoutTight = true;
    this._state = this.Bind(state, BindingOptions.AffectsLayout);
  }
  MakeChildByCondition() {
    for (const item of this._whens) {
      if (item.Match(this._state.Value)) {
        return item.GetWidget();
      }
    }
    return null;
  }
  When(predicate, builder) {
    var _a;
    this._whens.Add(new WhenBuilder(predicate, builder));
    (_a = this.Child) != null ? _a : this.Child = this.MakeChildByCondition();
    return this;
  }
  OnStateChanged(state, options) {
    if (state === this._state) {
      let newChild = this.MakeChildByCondition();
      this.ReplaceTo(newChild);
      return;
    }
    super.OnStateChanged(state, options);
  }
}
class IfConditional extends Conditional {
  constructor(state, trueBuilder, falseBuilder = null) {
    super(state);
    this.When((v) => v, trueBuilder);
    if (falseBuilder != null)
      this.When((v) => !v, falseBuilder);
  }
}
class FutureBuilder extends DynamicView {
  constructor(future, doneBuilder, runningBuilder = null) {
    super();
    __publicField(this, "_future");
    __publicField(this, "_doneBuilder");
    this._future = future;
    this._doneBuilder = doneBuilder;
    if (runningBuilder != null)
      this.ReplaceTo(runningBuilder());
  }
  OnMounted() {
    super.OnMounted();
    if (!this.HasLayout)
      this.Run();
  }
  async Run() {
    try {
      let res = await this._future;
      this.ReplaceTo(this._doneBuilder(res, null));
    } catch (ex) {
      let nullValue = null;
      this.ReplaceTo(this._doneBuilder(nullValue, ex));
    }
  }
}
class TextBase extends Widget {
  constructor(text) {
    super();
    __privateAdd(this, _Text, void 0);
    __publicField(this, "_fontSize");
    __publicField(this, "_fontWeight");
    __publicField(this, "_textColor");
    __publicField(this, "_maxLines", 1);
    __publicField(this, "_cachedParagraph");
    this.Text = this.Bind(text, this instanceof EditableText ? BindingOptions.AffectsVisual : BindingOptions.AffectsLayout);
  }
  get Text() {
    return __privateGet(this, _Text);
  }
  set Text(value) {
    __privateSet(this, _Text, value);
  }
  get CachedParagraph() {
    return this._cachedParagraph;
  }
  get ForceHeight() {
    return false;
  }
  get FontSize() {
    return this._fontSize;
  }
  set FontSize(value) {
    this._fontSize = this.Rebind(this._fontSize, value, BindingOptions.AffectsLayout);
  }
  get FontWeight() {
    return this._fontWeight;
  }
  set FontWeight(value) {
    this._fontWeight = this.Rebind(this._fontWeight, value, BindingOptions.AffectsLayout);
  }
  get TextColor() {
    return this._textColor;
  }
  set TextColor(value) {
    this._textColor = this.Rebind(this._textColor, value, BindingOptions.AffectsVisual);
  }
  set MaxLines(value) {
    var _a;
    if (value <= 0)
      throw new System.ArgumentException();
    if (this._maxLines != value) {
      this._maxLines = value;
      if (this.IsMounted) {
        (_a = this._cachedParagraph) == null ? void 0 : _a.delete();
        this._cachedParagraph = null;
        this.Invalidate(InvalidAction.Relayout);
      }
    }
  }
  OnStateChanged(state, options) {
    var _a;
    (_a = this._cachedParagraph) == null ? void 0 : _a.delete();
    this._cachedParagraph = null;
    super.OnStateChanged(state, options);
  }
  BuildParagraph(text, width) {
    var _a, _b, _c;
    (_a = this._cachedParagraph) == null ? void 0 : _a.delete();
    let color = (_c = (_b = this._textColor) == null ? void 0 : _b.Value) != null ? _c : Colors.Black;
    this._cachedParagraph = this.BuildParagraphInternal(text, width, color);
  }
  BuildParagraphInternal(text, width, color) {
    var _a, _b;
    let fontSize = (_b = (_a = this._fontSize) == null ? void 0 : _a.Value) != null ? _b : Theme.DefaultFontSize;
    let fontStyle = this._fontWeight == null ? null : new FontStyle(this._fontWeight.Value, CanvasKit.FontSlant.Upright);
    return TextPainter.BuildParagraph(text, width, fontSize, color, fontStyle, this._maxLines, this.ForceHeight);
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    if (this.Text.Value == null || this.Text.Value.length == 0) {
      this.SetSize(0, 0);
      return;
    }
    this.BuildParagraph(this.Text.Value, width);
    this.SetSize(Math.min(width, this._cachedParagraph.getMaxIntrinsicWidth()), Math.min(height, this._cachedParagraph.getHeight()));
  }
  Paint(canvas, area = null) {
    if (this.Text.Value == null || this.Text.Value.length == 0)
      return;
    if (this._cachedParagraph == null) {
      let width = this.Width == null ? this.CachedAvailableWidth : Math.min(Math.max(0, this.Width.Value), this.CachedAvailableWidth);
      this.BuildParagraph(this.Text.Value, width);
    }
    canvas.drawParagraph(this._cachedParagraph, 0, 0);
  }
}
_Text = new WeakMap();
class Text extends TextBase {
  constructor(text) {
    super(text);
  }
}
class EditableText extends TextBase {
  constructor(text) {
    super(text);
    __publicField(this, "_caret");
    __publicField(this, "_caretPosition", 0);
    __publicField(this, "Focused", State.op_Implicit_From(false));
    __publicField(this, "_hintParagraph");
    __publicField(this, "_readonly");
    __privateAdd(this, _MouseRegion, void 0);
    __privateAdd(this, _FocusNode, void 0);
    __publicField(this, "IsObscure", false);
    __publicField(this, "HintText");
    this.MouseRegion = new MouseRegion(() => Cursors.IBeam);
    this.MouseRegion.PointerDown.Add(this._OnPointerDown, this);
    this.FocusNode = new FocusNode();
    this.FocusNode.FocusChanged.Add(this._OnFocusChanged, this);
    this.FocusNode.TextInput.Add(this._OnTextInput, this);
    this.FocusNode.KeyDown.Add(this._OnKeyDown, this);
    this._caret = new Caret(this, this.GetCaretColor.bind(this), this.GetCaretBounds.bind(this));
  }
  get Readonly() {
    return this._readonly;
  }
  set Readonly(value) {
    this._readonly = this.Rebind(this._readonly, value, BindingOptions.None);
  }
  get IsReadonly() {
    return this._readonly != null && this._readonly.Value;
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
  get FontHeight() {
    var _a, _b;
    return ((_b = (_a = this.FontSize) == null ? void 0 : _a.Value) != null ? _b : Theme.DefaultFontSize) + 4;
  }
  get ForceHeight() {
    return true;
  }
  _OnFocusChanged(focused) {
    this.Focused.Value = focused;
    if (focused) {
      if (!this.IsReadonly)
        this.Root.Window.StartTextInput();
      this._caret.Show();
    } else {
      if (!this.IsReadonly)
        this.Root.Window.StopTextInput();
      this._caret.Hide();
    }
  }
  _OnTextInput(text) {
    if (this.IsReadonly)
      return;
    if (this.Text.Value != null)
      this.Text.Value = this.Text.Value.Insert(this._caretPosition, text);
    else
      this.Text.Value = text;
    this._caretPosition += text.length;
  }
  _OnPointerDown(theEvent) {
    let newPos = 0;
    if (this.CachedParagraph != null) {
      let pos = this.CachedParagraph.getGlyphPositionAtCoordinate(theEvent.X, theEvent.Y);
      console.log(`pos=${pos.pos} affinity=${pos.affinity}`);
      newPos = pos.pos;
    }
    if (newPos != this._caretPosition) {
      this._caretPosition = newPos;
      this._caret.NotifyPositionChanged();
    }
  }
  _OnKeyDown(keyEvent) {
    switch (keyEvent.KeyCode) {
      case Keys.Back:
        this.DeleteBack();
        break;
      case Keys.Left:
        this.MoveLeft();
        break;
      case Keys.Right:
        this.MoveRight();
        break;
    }
  }
  DeleteBack() {
    if (this.IsReadonly || this._caretPosition == 0)
      return;
    this.Text.Value = this.Text.Value.Remove(this._caretPosition - 1, 1);
    this._caretPosition--;
  }
  MoveLeft() {
    if (this._caretPosition == 0)
      return;
    this._caretPosition--;
    this._caret.NotifyPositionChanged();
  }
  MoveRight() {
    if (this._caretPosition == this.Text.Value.length)
      return;
    this._caretPosition++;
    this._caret.NotifyPositionChanged();
  }
  GetCaretBounds() {
    let caretWidth = 2;
    let halfCaretWidth = caretWidth / 2;
    this.TryBuildParagraph();
    let winPt = this.LocalToWindow(0, 0);
    if (this._caretPosition != 0) {
      if (this._caretPosition == this.Text.Value.length) {
        let textbox = GetRectForPosition(this.CachedParagraph, this._caretPosition - 1, CanvasKit.RectHeightStyle.Tight, CanvasKit.RectWidthStyle.Tight);
        winPt.Offset(textbox.Rect.Left + textbox.Rect.Width, 0);
      } else {
        let textbox = GetRectForPosition(this.CachedParagraph, this._caretPosition, CanvasKit.RectHeightStyle.Tight, CanvasKit.RectWidthStyle.Tight);
        winPt.Offset(textbox.Rect.Left, 0);
      }
    }
    return Rect.FromLTWH(winPt.X - halfCaretWidth, winPt.Y, caretWidth, this.H);
  }
  GetCaretColor() {
    return Theme.CaretColor;
  }
  TryBuildParagraph() {
    if (this.CachedParagraph != null)
      return;
    if (this.Text.Value == null || this.Text.Value.length == 0)
      return;
    let text = this.IsObscure ? "\u25CF".repeat(this.Text.Value.length) : this.Text.Value;
    this.BuildParagraph(text, Number.POSITIVE_INFINITY);
  }
  OnStateChanged(state, options) {
    var _a, _b;
    if (state === this._readonly) {
      if (this.IsReadonly)
        (_a = this.Root) == null ? void 0 : _a.Window.StopTextInput();
      else
        (_b = this.Root) == null ? void 0 : _b.Window.StartTextInput();
      return;
    }
    super.OnStateChanged(state, options);
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    this.TryBuildParagraph();
    this.SetSize(width, Math.min(height, this.FontHeight));
  }
  Paint(canvas, area = null) {
    var _a;
    if (this.Text.Value == null || this.Text.Value.length == 0) {
      if (System.IsNullOrEmpty(this.HintText))
        return;
      (_a = this._hintParagraph) != null ? _a : this._hintParagraph = this.BuildParagraphInternal(this.HintText, Number.POSITIVE_INFINITY, Colors.Gray);
      canvas.drawParagraph(this._hintParagraph, 0, 2);
    } else {
      this.TryBuildParagraph();
      if (this.CachedParagraph == null)
        return;
      canvas.drawParagraph(this.CachedParagraph, 0, 2);
    }
  }
}
_MouseRegion = new WeakMap();
_FocusNode = new WeakMap();
__publicField(EditableText, "$meta_PixUI_IMouseRegion", true);
__publicField(EditableText, "$meta_PixUI_IFocusable", true);
const _InputBase = class extends Widget {
  constructor(editor) {
    super();
    __publicField(this, "_prefix");
    __publicField(this, "_suffix");
    __publicField(this, "_editor");
    __publicField(this, "_border");
    __publicField(this, "_padding");
    __publicField(this, "_focusedDecoration");
    this._editor = editor;
    this._editor.Parent = this;
    this._focusedDecoration = new FocusedDecoration(this, this.GetFocusedBorder.bind(this), this.GetUnFocusedBorder.bind(this));
    this._focusedDecoration.AttachFocusChangedEvent(this._editor);
  }
  get Padding() {
    return this._padding;
  }
  set Padding(value) {
    this._padding = this.Rebind(this._padding, value, BindingOptions.AffectsLayout);
  }
  get IsReadonly() {
    return this.Readonly != null && this.Readonly.Value;
  }
  get PrefixWidget() {
    return this._prefix;
  }
  set PrefixWidget(value) {
    if (this._prefix != null)
      this._prefix.Parent = null;
    this._prefix = value;
    if (this._prefix == null)
      return;
    this._prefix.Parent = this;
    if (!this.IsMounted)
      return;
    this.Invalidate(InvalidAction.Relayout);
  }
  get SuffixWidget() {
    return this._suffix;
  }
  set SuffixWidget(value) {
    if (this._suffix != null)
      this._suffix.Parent = null;
    this._suffix = value;
    if (this._suffix == null)
      return;
    this._suffix.Parent = this;
    if (!this.IsMounted)
      return;
    this.Invalidate(InvalidAction.Relayout);
  }
  GetUnFocusedBorder() {
    var _a;
    return (_a = this._border) != null ? _a : _InputBase.DefaultBorder;
  }
  GetFocusedBorder() {
    var _a;
    let border = (_a = this._border) != null ? _a : _InputBase.DefaultBorder;
    if (border instanceof OutlineInputBorder) {
      const outline = border;
      return new OutlineInputBorder(new BorderSide(Theme.FocusedColor, Theme.FocusedBorderWidth), outline.BorderRadius);
    }
    throw new System.NotImplementedException();
  }
  OnUnmounted() {
    this._focusedDecoration.StopAndReset();
    super.OnUnmounted();
  }
  VisitChildren(action) {
    if (this._prefix != null) {
      if (action(this._prefix))
        return;
    }
    if (action(this._editor))
      return;
    if (this._suffix != null)
      action(this._suffix);
  }
  Layout(availableWidth, availableHeight) {
    var _a, _b, _c, _d, _e, _f;
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    let padding = (_b = (_a = this._padding) == null ? void 0 : _a.Value) != null ? _b : EdgeInsets.All(4);
    let lw = width - padding.Horizontal;
    let lh = height - padding.Vertical;
    if (lw <= 0 || lh <= 0) {
      this.SetSize(width, height);
      return;
    }
    if (this._prefix != null) {
      this._prefix.Layout(lw, lh);
      lw -= this._prefix.W;
    }
    if (this._suffix != null) {
      this._suffix.Layout(lw, lh);
      lw -= this._suffix.W;
    }
    this._editor.Layout(lw, lh);
    let maxChildHeight = this._editor.H;
    (_c = this._prefix) == null ? void 0 : _c.SetPosition(padding.Left, (maxChildHeight - this._prefix.H) / 2 + padding.Top);
    (_d = this._suffix) == null ? void 0 : _d.SetPosition(width - padding.Right - this._suffix.W, (maxChildHeight - this._suffix.H) / 2 + padding.Top);
    this._editor.SetPosition(padding.Left + ((_f = (_e = this._prefix) == null ? void 0 : _e.W) != null ? _f : 0), padding.Top + 1);
    height = Math.min(height, maxChildHeight + padding.Vertical);
    this.SetSize(width, height);
  }
  Paint(canvas, area = null) {
    var _a;
    let bounds = Rect.FromLTWH(0, 0, this.W, this.H);
    let border = (_a = this._border) != null ? _a : _InputBase.DefaultBorder;
    border.Paint(canvas, bounds, this.IsReadonly ? Theme.DisabledBgColor : Colors.White);
    this.PaintChildren(canvas, area);
  }
};
let InputBase = _InputBase;
__publicField(InputBase, "DefaultBorder", new OutlineInputBorder(null, BorderRadius.All(Radius.Circular(4))));
class Input extends InputBase {
  constructor(text) {
    super(new EditableText(text));
    this.Readonly = State.op_Implicit_From(text.Readonly);
  }
  get FontSize() {
    return this._editor.FontSize;
  }
  set FontSize(value) {
    this._editor.FontSize = value;
  }
  set Prefix(value) {
    this.PrefixWidget = value;
  }
  set Suffix(value) {
    this.SuffixWidget = value;
  }
  get Readonly() {
    return this._editor.Readonly;
  }
  set Readonly(value) {
    this._editor.Readonly = value;
  }
  set IsObscure(value) {
    this._editor.IsObscure = value;
  }
  set HintText(value) {
    this._editor.HintText = value;
  }
}
class Select extends InputBase {
  constructor(value, filterable = false) {
    super(filterable ? new EditableText(value.AsStateOfString()) : new SelectText(value.AsStateOfString()));
    __publicField(this, "_selectedValue");
    __publicField(this, "_optionBuilder");
    __publicField(this, "_expandAnimation", new OptionalAnimationController());
    __publicField(this, "_listPopup");
    __publicField(this, "_showing", false);
    __publicField(this, "_labelGetter");
    __publicField(this, "Options", []);
    this._selectedValue = value;
    this.SuffixWidget = new ExpandIcon(new FloatTween(0, 0.5).Animate(this._expandAnimation));
    if (IsInterfaceOfIMouseRegion(this._editor)) {
      const mouseRegion = this._editor;
      mouseRegion.MouseRegion.PointerTap.Add(this.OnEditorTap, this);
    }
    if (IsInterfaceOfIFocusable(this._editor)) {
      const focusable = this._editor;
      focusable.FocusNode.FocusChanged.Add(this.OnFocusChanged, this);
    }
  }
  set OptionsAsyncGetter(value) {
    this.GetOptionsAsync(value);
  }
  set LabelGetter(value) {
    this._labelGetter = value;
  }
  get Readonly() {
    if (this._editor instanceof EditableText) {
      const editableText = this._editor;
      return editableText.Readonly;
    }
    return this._editor.Readonly;
  }
  set Readonly(value) {
    if (this._editor instanceof EditableText) {
      const editableText = this._editor;
      editableText.Readonly = value;
    } else
      this._editor.Readonly = value;
  }
  OnFocusChanged(focused) {
    if (!focused)
      this.HidePopup();
  }
  OnEditorTap(e) {
    if (this._showing)
      this.HidePopup();
    else
      this.ShowPopup();
  }
  ShowPopup() {
    var _a;
    if (this._showing || this.Options.length == 0)
      return;
    this._showing = true;
    let optionBuilder = (_a = this._optionBuilder) != null ? _a : (data, index, isHover, isSelected) => {
      var _a2;
      let color = RxComputed.Make1(isSelected, (v) => v ? Colors.White : Colors.Black);
      return new Text(State.op_Implicit_From(this._labelGetter != null ? this._labelGetter(data) : (_a2 = data == null ? void 0 : data.toString()) != null ? _a2 : "")).Init({ TextColor: color });
    };
    this._listPopup = new ListPopup(this.Overlay, optionBuilder, this.W + 8, Theme.DefaultFontSize + 8);
    this._listPopup.DataSource = new System.List(this.Options);
    if (this._selectedValue.Value != null)
      this._listPopup.InitSelect(this._selectedValue.Value);
    this._listPopup.OnSelectionChanged = this.OnSelectionChanged.bind(this);
    this._listPopup.Show(this, new Offset(-4, 0), Popup.DefaultTransitionBuilder);
    this._expandAnimation.Parent = this._listPopup.AnimationController;
  }
  HidePopup() {
    var _a;
    if (!this._showing)
      return;
    this._showing = false;
    (_a = this._listPopup) == null ? void 0 : _a.Hide();
    this._listPopup = null;
  }
  async GetOptionsAsync(builder) {
    this.Options = await builder;
  }
  OnSelectionChanged(data) {
    this._showing = false;
    this._listPopup = null;
    this._selectedValue.Value = data;
  }
}
class SelectText extends TextBase {
  constructor(text) {
    super(text);
    __privateAdd(this, _MouseRegion2, void 0);
    __privateAdd(this, _FocusNode2, void 0);
    __publicField(this, "_readonly");
    this.MouseRegion = new MouseRegion();
    this.FocusNode = new FocusNode();
  }
  get MouseRegion() {
    return __privateGet(this, _MouseRegion2);
  }
  set MouseRegion(value) {
    __privateSet(this, _MouseRegion2, value);
  }
  get FocusNode() {
    return __privateGet(this, _FocusNode2);
  }
  set FocusNode(value) {
    __privateSet(this, _FocusNode2, value);
  }
  get Readonly() {
    return this._readonly;
  }
  set Readonly(value) {
    this._readonly = this.Rebind(this._readonly, value, BindingOptions.None);
  }
  get ForceHeight() {
    return true;
  }
  Layout(availableWidth, availableHeight) {
    var _a, _b;
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    this.BuildParagraph(this.Text.Value, width);
    let fontHeight = ((_b = (_a = this.FontSize) == null ? void 0 : _a.Value) != null ? _b : Theme.DefaultFontSize) + 4;
    this.SetSize(width, Math.min(height, fontHeight));
  }
  Paint(canvas, area = null) {
    if (this.Text.Value.length == 0)
      return;
    canvas.drawParagraph(this.CachedParagraph, 0, 2);
  }
}
_MouseRegion2 = new WeakMap();
_FocusNode2 = new WeakMap();
__publicField(SelectText, "$meta_PixUI_IMouseRegion", true);
__publicField(SelectText, "$meta_PixUI_IFocusable", true);
class Toggleable extends Widget {
  constructor() {
    super();
    __publicField(this, "_value");
    __publicField(this, "_triState", false);
    __publicField(this, "_positionController");
    __privateAdd(this, _MouseRegion3, void 0);
    __publicField(this, "ValueChanged", new System.Event());
    this.MouseRegion = new MouseRegion(() => Cursors.Hand);
    this.MouseRegion.PointerTap.Add(this.OnTap, this);
  }
  get MouseRegion() {
    return __privateGet(this, _MouseRegion3);
  }
  set MouseRegion(value) {
    __privateSet(this, _MouseRegion3, value);
  }
  InitState(value, tristate) {
    this._triState = tristate;
    this._value = this.Bind(value, BindingOptions.AffectsVisual);
    this._positionController = new AnimationController(100, value.Value != null && value.Value ? 1 : 0);
    this._positionController.ValueChanged.Add(this.OnPositionValueChanged, this);
  }
  OnTap(e) {
    if (this._value.Value == null || this._value.Value == false)
      this._value.Value = true;
    else
      this._value.Value = false;
  }
  AnimateToValue() {
    if (this._triState) {
      if (this._value.Value == null || this._value.Value == true) {
        this._positionController.SetValue(0);
        this._positionController.Forward();
      } else
        this._positionController.Reverse();
    } else {
      if (this._value.Value != null && this._value.Value == true)
        this._positionController.Forward();
      else
        this._positionController.Reverse();
    }
  }
  OnPositionValueChanged() {
    this.Invalidate(InvalidAction.Repaint);
  }
  OnStateChanged(state, options) {
    if (state === this._value) {
      this.ValueChanged.Invoke(this._value.Value);
      this.AnimateToValue();
      return;
    }
    super.OnStateChanged(state, options);
  }
}
_MouseRegion3 = new WeakMap();
__publicField(Toggleable, "$meta_PixUI_IMouseRegion", true);
const _Switch = class extends Toggleable {
  constructor(value) {
    super();
    this.InitState(RxComputed.Make1(value, (v) => v, (v) => value.Value = v != null ? v : false), false);
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    this.SetSize(Math.min(width, _Switch._kSwitchWidth), Math.min(height, _Switch._kSwitchHeight));
  }
  Paint(canvas, area = null) {
    canvas.save();
    canvas.translate(0, (_Switch._kSwitchHeight - _Switch._kTrackHeight) / 2);
    let currentValue = this._positionController.Value;
    let currentReactionValue = 0;
    let visualPosition = currentValue;
    let activeColor = Theme.AccentColor;
    let trackColor = new Color(1375731712);
    let paint = PaintUtils.Shared(Color.Lerp(trackColor, activeColor, currentValue));
    paint.setAntiAlias(true);
    let trackRect = Rect.FromLTWH((this.W - _Switch._kTrackWidth) / 2, (this.H - _Switch._kSwitchHeight) / 2, _Switch._kTrackWidth, _Switch._kTrackHeight);
    let trackRRect = RRect.FromRectAndRadius(trackRect.Clone(), _Switch._kTrackRadius, _Switch._kTrackRadius);
    canvas.drawRRect(trackRRect, paint);
    let currentThumbExtension = _Switch._kThumbExtension * currentReactionValue;
    let thumbLeft = FloatUtils.Lerp(trackRect.Left + _Switch._kTrackInnerStart - _Switch._kThumbRadius, trackRect.Left + _Switch._kTrackInnerEnd - _Switch._kThumbRadius - currentThumbExtension, visualPosition);
    let thumbRight = FloatUtils.Lerp(trackRect.Left + _Switch._kTrackInnerStart + _Switch._kThumbRadius + currentThumbExtension, trackRect.Left + _Switch._kTrackInnerEnd + _Switch._kThumbRadius, visualPosition);
    let thumbCenterY = _Switch._kTrackHeight / 2;
    let thumbBounds = new Rect(thumbLeft, thumbCenterY - _Switch._kThumbRadius, thumbRight, thumbCenterY + _Switch._kThumbRadius);
    let clipPath = new CanvasKit.Path();
    clipPath.addRRect(trackRRect);
    canvas.clipPath(clipPath, CanvasKit.ClipOp.Intersect, true);
    _Switch.PaintThumb(canvas, thumbBounds.Clone());
    canvas.restore();
  }
  static PaintThumb(canvas, rect) {
    let shortestSide = Math.min(rect.Width, rect.Height);
    let rrect = RRect.FromRectAndRadius(rect.Clone(), shortestSide / 2, shortestSide / 2);
    let paint = PaintUtils.Shared(Color.Empty);
    paint.setAntiAlias(true);
    rrect.Shift(0, 3);
    let shadowColor = new Color(637534208);
    let blurRadius = 8;
    paint.setColor(shadowColor);
    paint.setMaskFilter(CanvasKit.MaskFilter.MakeBlur(CanvasKit.BlurStyle.Normal, ConvertRadiusToSigma(blurRadius), false));
    canvas.drawRRect(rrect, paint);
    shadowColor = new Color(251658240);
    blurRadius = 1;
    paint.setColor(shadowColor);
    paint.setMaskFilter(CanvasKit.MaskFilter.MakeBlur(CanvasKit.BlurStyle.Normal, ConvertRadiusToSigma(blurRadius), false));
    canvas.drawRRect(rrect, paint);
    rrect.Shift(0, -3);
    rrect.Inflate(0.5, 0.5);
    paint.setColor(_Switch._kThumbBorderColor);
    paint.setMaskFilter(null);
    canvas.drawRRect(rrect, paint);
    rrect.Deflate(0.5, 0.5);
    paint.setColor(Colors.White);
    canvas.drawRRect(rrect, paint);
  }
};
let Switch = _Switch;
__publicField(Switch, "_kTrackWidth", 40);
__publicField(Switch, "_kTrackHeight", 24);
__publicField(Switch, "_kTrackRadius", _Switch._kTrackHeight / 2);
__publicField(Switch, "_kTrackInnerStart", _Switch._kTrackHeight / 2);
__publicField(Switch, "_kTrackInnerEnd", _Switch._kTrackWidth - _Switch._kTrackInnerStart);
__publicField(Switch, "_kSwitchWidth", _Switch._kTrackWidth + 6);
__publicField(Switch, "_kSwitchHeight", _Switch._kTrackHeight + 6);
__publicField(Switch, "_kThumbExtension", 7);
__publicField(Switch, "_kThumbRadius", _Switch._kTrackHeight / 2 - 2);
__publicField(Switch, "_kThumbBorderColor", new Color(167772160));
const _Checkbox = class extends Toggleable {
  constructor(value) {
    super();
    __publicField(this, "_previousValue");
    __publicField(this, "_shape", new RoundedRectangleBorder(null, BorderRadius.All(Radius.Circular(1))));
    this._previousValue = value.Value;
    this.InitState(RxComputed.Make1(value, (v) => v, (v) => value.Value = v != null ? v : false), false);
    this._positionController.StatusChanged.Add(this.OnPositionStatusChanged, this);
  }
  static Tristate(value) {
    let checkbox = new _Checkbox(_Checkbox._notSetState);
    checkbox._previousValue = value.Value;
    checkbox.InitState(value, true);
    return checkbox;
  }
  OnPositionStatusChanged(status) {
    if (status == AnimationStatus.Completed || status == AnimationStatus.Dismissed)
      this._previousValue = this._value.Value;
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    this.SetSize(Math.min(width, _Checkbox._kCheckboxSize), Math.min(height, _Checkbox._kCheckboxSize));
  }
  Paint(canvas, area = null) {
    let origin = new Offset(this.W / 2 - _Checkbox._kEdgeSize / 2, this.H / 2 - _Checkbox._kEdgeSize / 2);
    let checkColor = Colors.White;
    let status = this._positionController.Status;
    let tNormalized = status == AnimationStatus.Forward || status == AnimationStatus.Completed ? this._positionController.Value : 1 - this._positionController.Value;
    if (this._previousValue == false || this._value.Value == false) {
      let t = this._value.Value == false ? 1 - tNormalized : tNormalized;
      let outer = _Checkbox.OuterRectAt(origin, t);
      let color = _Checkbox.ColorAt(t);
      let paint = PaintUtils.Shared(color);
      if (t <= 0.5) {
        let border = new BorderSide(color, 2);
        this.DrawBox(canvas, outer, paint, border, false);
      } else {
        this.DrawBox(canvas, outer, paint, null, true);
        let strokePaint = PaintUtils.Shared(checkColor, CanvasKit.PaintStyle.Stroke, _Checkbox._kStrokeWidth);
        let tShrink = (t - 0.5) * 2;
        if (this._previousValue == null || this._value.Value == null)
          _Checkbox.DrawDash(canvas, origin, tShrink, strokePaint);
        else
          _Checkbox.DrawCheck(canvas, origin, tShrink, strokePaint);
      }
    } else {
      let outer = _Checkbox.OuterRectAt(origin, 1);
      let paint = PaintUtils.Shared(_Checkbox.ColorAt(1));
      this.DrawBox(canvas, outer, paint, null, true);
      let strokePaint = PaintUtils.Shared(checkColor, CanvasKit.PaintStyle.Stroke, _Checkbox._kStrokeWidth);
      if (tNormalized <= 0.5) {
        let tShrink = 1 - tNormalized * 2;
        if (this._previousValue && this._previousValue)
          _Checkbox.DrawCheck(canvas, origin, tShrink, strokePaint);
        else
          _Checkbox.DrawDash(canvas, origin, tShrink, strokePaint);
      } else {
        let tExpand = (tNormalized - 0.5) * 2;
        if (this._value.Value != null && this._value.Value)
          _Checkbox.DrawCheck(canvas, origin, tExpand, strokePaint);
        else
          _Checkbox.DrawDash(canvas, origin, tExpand, strokePaint);
      }
    }
  }
  DrawBox(canvas, outer, paint, side, fill) {
    if (fill)
      canvas.drawPath(this._shape.GetOuterPath(outer), paint);
    if (side != null)
      this._shape.CopyWith(side).Paint(canvas, outer);
  }
  static DrawCheck(canvas, origin, t, paint) {
    console.assert(t >= 0 && t <= 1);
    let start = new Offset(_Checkbox._kEdgeSize * 0.15, _Checkbox._kEdgeSize * 0.45);
    let mid = new Offset(_Checkbox._kEdgeSize * 0.4, _Checkbox._kEdgeSize * 0.7);
    let end = new Offset(_Checkbox._kEdgeSize * 0.85, _Checkbox._kEdgeSize * 0.25);
    if (t < 0.5) {
      let strokeT = t * 2;
      let drawMid = Offset.Lerp(start, mid, strokeT);
      canvas.drawLine(origin.Dx + start.Dx, origin.Dy + start.Dy, origin.Dx + drawMid.Dx, origin.Dy + drawMid.Dy, paint);
    } else {
      let strokeT = (t - 0.5) * 2;
      let drawEnd = Offset.Lerp(mid, end, strokeT);
      canvas.drawLine(origin.Dx + start.Dx, origin.Dy + start.Dy, origin.Dx + mid.Dx + 0.8, origin.Dy + mid.Dy + 0.8, paint);
      canvas.drawLine(origin.Dx + mid.Dx, origin.Dy + mid.Dy, origin.Dx + drawEnd.Dx, origin.Dy + drawEnd.Dy, paint);
    }
  }
  static DrawDash(canvas, origin, t, paint) {
    console.assert(t >= 0 && t <= 1);
    let start = new Offset(_Checkbox._kEdgeSize * 0.2, _Checkbox._kEdgeSize * 0.5);
    let mid = new Offset(_Checkbox._kEdgeSize * 0.5, _Checkbox._kEdgeSize * 0.5);
    let end = new Offset(_Checkbox._kEdgeSize * 0.8, _Checkbox._kEdgeSize * 0.5);
    let drawStart = Offset.Lerp(start, mid, 1 - t);
    let drawEnd = Offset.Lerp(mid, end, t);
    canvas.drawLine(origin.Dx + drawStart.Dx, origin.Dy + drawStart.Dy, origin.Dx + drawEnd.Dx, origin.Dy + drawEnd.Dy, paint);
  }
  static OuterRectAt(origin, t) {
    let inset = 1 - Math.abs(t - 0.5) * 2;
    let size = _Checkbox._kEdgeSize - inset * _Checkbox._kStrokeWidth;
    return Rect.FromLTWH(origin.Dx + inset, origin.Dy + inset, size, size);
  }
  static ColorAt(t) {
    let activeColor = Theme.AccentColor;
    let inactiveColor = new Color(1375731712);
    return t >= 0.25 ? activeColor : Color.Lerp(inactiveColor, activeColor, t * 4);
  }
};
let Checkbox = _Checkbox;
__publicField(Checkbox, "_notSetState", State.op_Implicit_From(false));
__publicField(Checkbox, "_kCheckboxSize", 30);
__publicField(Checkbox, "_kEdgeSize", 18);
__publicField(Checkbox, "_kStrokeWidth", 2);
const _Radio = class extends Toggleable {
  constructor(value) {
    super();
    this.InitState(RxComputed.Make1(value, (v) => v, (v) => value.Value = v != null ? v : false), false);
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    this.SetSize(Math.min(width, _Radio._kRadioSize), Math.min(height, _Radio._kRadioSize));
  }
  Paint(canvas, area = null) {
    let center = new Offset(this.W / 2, this.H / 2);
    let activeColor = Theme.AccentColor;
    let inactiveColor = new Color(1375731712);
    let color = Color.Lerp(inactiveColor, activeColor, this._positionController.Value);
    let paint = PaintUtils.Shared(color, CanvasKit.PaintStyle.Stroke, 2);
    paint.setAntiAlias(true);
    canvas.drawCircle(center.Dx, center.Dy, _Radio._kOuterRadius, paint);
    if (!this._positionController.IsDismissed) {
      paint.setStyle(CanvasKit.PaintStyle.Fill);
      canvas.drawCircle(center.Dx, center.Dy, _Radio._kInnerRadius * this._positionController.Value, paint);
    }
  }
};
let Radio = _Radio;
__publicField(Radio, "_kRadioSize", 30);
__publicField(Radio, "_kOuterRadius", 8);
__publicField(Radio, "_kInnerRadius", 4.5);
class Overlay extends Widget {
  constructor(window2) {
    super();
    __publicField(this, "_children");
    __privateAdd(this, _Window2, void 0);
    this.Window = window2;
    this.IsMounted = true;
    this._children = new WidgetList(this);
  }
  get Window() {
    return __privateGet(this, _Window2);
  }
  set Window(value) {
    __privateSet(this, _Window2, value);
  }
  get HasEntry() {
    return this._children.length > 0;
  }
  FindEntry(predicate) {
    return this._children.FirstOrDefault((entry) => predicate(entry));
  }
  Show(entry) {
    if (this._children.Contains(entry))
      return;
    this._children.Add(entry);
    entry.Layout(this.Window.Width, this.Window.Height);
    this.Invalidate(InvalidAction.Repaint);
  }
  Remove(entry) {
    if (!this._children.Remove(entry))
      return;
    this.Invalidate(InvalidAction.Repaint);
  }
  HitTest(x, y, result) {
    for (let i = this._children.length - 1; i >= 0; i--) {
      if (this.HitTestChild(this._children[i], x, y, result))
        break;
    }
    return result.IsHitAnyMouseRegion;
  }
  Layout(availableWidth, availableHeight) {
  }
  Paint(canvas, area = null) {
    for (const entry of this._children) {
      let needTranslate = entry.X != 0 || entry.Y != 0;
      if (needTranslate)
        canvas.translate(entry.X, entry.Y);
      entry.Paint(canvas, area);
      if (needTranslate)
        canvas.translate(-entry.X, -entry.Y);
    }
  }
}
_Window2 = new WeakMap();
__publicField(Overlay, "$meta_PixUI_IRootWidget", true);
class Caret {
  constructor(widget, colorBuilder, boundsBuilder) {
    __publicField(this, "_widget");
    __publicField(this, "ColorBuilder");
    __publicField(this, "BoundsBuilder");
    __publicField(this, "_decorator");
    this._widget = widget;
    this.ColorBuilder = colorBuilder;
    this.BoundsBuilder = boundsBuilder;
  }
  Show() {
    var _a;
    this._decorator = new CaretDecorator(this);
    (_a = this._widget.Overlay) == null ? void 0 : _a.Show(this._decorator);
  }
  Hide() {
    if (this._decorator == null)
      return;
    this._decorator.Parent.Remove(this._decorator);
    this._decorator = null;
  }
  NotifyPositionChanged() {
    var _a;
    (_a = this._decorator) == null ? void 0 : _a.Invalidate(InvalidAction.Repaint);
  }
}
class CaretDecorator extends Widget {
  constructor(owner) {
    super();
    __publicField(this, "_owner");
    this._owner = owner;
  }
  Layout(availableWidth, availableHeight) {
  }
  Paint(canvas, area = null) {
    let paint = PaintUtils.Shared(this._owner.ColorBuilder(), CanvasKit.PaintStyle.Fill);
    let bounds = this._owner.BoundsBuilder();
    canvas.drawRect(Rect.FromLTWH(bounds.Left, bounds.Top, bounds.Width, bounds.Height), paint);
  }
  OnMounted() {
  }
  OnUnmounted() {
  }
}
class FocusedDecoration {
  constructor(widget, focusedBorderBuilder, unfocusedBorderBuilder = null) {
    __publicField(this, "Widget");
    __publicField(this, "_focusedBorderBuilder");
    __publicField(this, "_unfocusedBorderBuilder");
    __publicField(this, "_decorator");
    this.Widget = widget;
    this._focusedBorderBuilder = focusedBorderBuilder;
    this._unfocusedBorderBuilder = unfocusedBorderBuilder;
  }
  AttachFocusChangedEvent(widget) {
    if (IsInterfaceOfIFocusable(widget)) {
      const focusable = widget;
      focusable.FocusNode.FocusChanged.Add(this._OnFocusChanged, this);
    }
  }
  _OnFocusChanged(focused) {
    var _a, _b;
    if (focused) {
      this._decorator = new FocusedDecorator(this);
      (_a = this.Widget.Overlay) == null ? void 0 : _a.Show(this._decorator);
    } else {
      (_b = this._decorator) == null ? void 0 : _b.Hide();
    }
  }
  GetUnfocusedBorder() {
    var _a;
    return (_a = this._unfocusedBorderBuilder) == null ? void 0 : _a.call(this);
  }
  GetFocusedBorder() {
    return this._focusedBorderBuilder();
  }
  StopAndReset() {
    var _a;
    (_a = this._decorator) == null ? void 0 : _a.Reset();
  }
  RemoveOverlayEntry() {
    if (this._decorator == null)
      return;
    this._decorator.Parent.Remove(this._decorator);
    this._decorator = null;
  }
}
class FocusedDecorator extends Widget {
  constructor(owner) {
    super();
    __publicField(this, "_owner");
    __publicField(this, "_from");
    __publicField(this, "_to");
    __publicField(this, "_tween");
    __publicField(this, "_controller");
    this._owner = owner;
    this._from = owner.GetUnfocusedBorder();
    this._to = owner.GetFocusedBorder();
    if (this._from != null)
      this._tween = this._from.Clone();
  }
  Hide() {
    var _a;
    if (this._from == null) {
      this._owner.RemoveOverlayEntry();
      return;
    }
    (_a = this._controller) == null ? void 0 : _a.Reverse();
  }
  Reset() {
    var _a;
    (_a = this._controller) == null ? void 0 : _a.Reset();
  }
  HitTest(x, y, result) {
    return false;
  }
  Layout(availableWidth, availableHeight) {
  }
  Paint(canvas, area = null) {
    let widget = this._owner.Widget;
    let pt2Win = widget.LocalToWindow(0, 0);
    let bounds = Rect.FromLTWH(pt2Win.X, pt2Win.Y, widget.W, widget.H);
    if (this._from == null) {
      this._to.Paint(canvas, bounds);
      return;
    }
    this._tween.Paint(canvas, bounds);
  }
  OnMounted() {
    if (this._from == null)
      return;
    if (this._controller == null) {
      this._controller = new AnimationController(200);
      this._controller.ValueChanged.Add(this.OnAnimationValueChanged, this);
      this._controller.StatusChanged.Add(this.OnAnimationStateChanged, this);
    }
    this._controller.Forward();
  }
  OnAnimationValueChanged() {
    this._from.LerpTo(this._to, this._tween, this._controller.Value);
    this.Invalidate(InvalidAction.Repaint);
  }
  OnAnimationStateChanged(status) {
    if (status == AnimationStatus.Dismissed) {
      this._owner.RemoveOverlayEntry();
    }
  }
  Dispose() {
    if (this._controller != null) {
      this._controller.ValueChanged.Remove(this.OnAnimationValueChanged, this);
      this._controller.StatusChanged.Remove(this.OnAnimationStateChanged, this);
      this._controller.Dispose();
    }
    super.Dispose();
  }
}
class HoverDecoration {
  constructor(widget, shapeBuilder, boundsGetter = null, elevation = 4, hoverColor = null) {
    __publicField(this, "Widget");
    __publicField(this, "ShapeBuilder");
    __publicField(this, "BoundsGetter");
    __publicField(this, "Elevation");
    __publicField(this, "HoverColor");
    __publicField(this, "_decorator");
    this.Widget = widget;
    this.ShapeBuilder = shapeBuilder;
    this.BoundsGetter = boundsGetter;
    this.Elevation = elevation;
    this.HoverColor = hoverColor;
  }
  Show() {
    var _a;
    this._decorator = new HoverDecorator(this);
    (_a = this.Widget.Overlay) == null ? void 0 : _a.Show(this._decorator);
  }
  Hide() {
    if (this._decorator == null)
      return;
    this._decorator.Parent.Remove(this._decorator);
    this._decorator = null;
  }
  AttachHoverChangedEvent(widget) {
    widget.MouseRegion.HoverChanged.Add(this._OnHoverChanged, this);
  }
  _OnHoverChanged(hover) {
    if (hover)
      this.Show();
    else
      this.Hide();
  }
}
class HoverDecorator extends Widget {
  constructor(owner) {
    super();
    __publicField(this, "_owner");
    __publicField(this, "_shape");
    this._owner = owner;
    this._shape = owner.ShapeBuilder();
  }
  HitTest(x, y, result) {
    return false;
  }
  Layout(availableWidth, availableHeight) {
  }
  Paint(canvas, area = null) {
    let bounds = Rect.Empty.Clone();
    if (this._owner.BoundsGetter == null) {
      let widget = this._owner.Widget;
      let pt2Win = widget.LocalToWindow(0, 0);
      bounds = Rect.FromLTWH(pt2Win.X, pt2Win.Y, widget.W, widget.H);
    } else {
      bounds = this._owner.BoundsGetter();
    }
    let path = this._shape.GetOuterPath(bounds);
    if (this._owner.Elevation > 0) {
      canvas.save();
      canvas.clipPath(path, CanvasKit.ClipOp.Difference, false);
      DrawShadow(canvas, path, Colors.Black, this._owner.Elevation, false, this.Root.Window.ScaleFactor);
      canvas.restore();
    }
    if (this._owner.HoverColor != null) {
      canvas.save();
      canvas.clipPath(path, CanvasKit.ClipOp.Intersect, false);
      let paint = PaintUtils.Shared(this._owner.HoverColor);
      canvas.drawPath(path, paint);
      canvas.restore();
    }
    path.delete();
  }
}
class Popup extends Widget {
  constructor(overlay) {
    super();
    __publicField(this, "Owner");
    __publicField(this, "FocusManager", new FocusManager());
    __publicField(this, "_transition");
    __publicField(this, "_proxy");
    this.Owner = overlay;
  }
  get IsDialog() {
    return false;
  }
  get AnimationController() {
    var _a;
    return (_a = this._transition) == null ? void 0 : _a.AnimationController;
  }
  UpdatePosition(x, y) {
    this.SetPosition(x, y);
    this.Invalidate(InvalidAction.Repaint);
  }
  Show(relativeTo = null, relativeOffset = null, transitionBuilder = null) {
    var _a, _b, _c;
    let target = this;
    let origin = null;
    let winX = 0;
    let winY = 0;
    if (relativeTo != null) {
      let winPt = relativeTo.LocalToWindow(0, 0);
      let offsetX = (_a = relativeOffset == null ? void 0 : relativeOffset.Dx) != null ? _a : 0;
      let offsetY = (_b = relativeOffset == null ? void 0 : relativeOffset.Dy) != null ? _b : 0;
      this._proxy = new PopupProxy(this);
      target = this._proxy;
      let popupHeight = this.H;
      if (winPt.Y + relativeTo.H + offsetY + popupHeight > this.Owner.Window.Height) {
        winX = winPt.X + offsetX;
        winY = winPt.Y - offsetY - popupHeight;
        origin = new Offset(0, popupHeight);
      } else {
        winX = winPt.X + offsetX;
        winY = winPt.Y + relativeTo.H + offsetY;
      }
    }
    if (transitionBuilder != null) {
      (_c = this._proxy) != null ? _c : this._proxy = new PopupProxy(this);
      this._transition = new PopupTransitionWrap(this.Owner, this.IsDialog, this._proxy, origin, transitionBuilder);
      this._transition.Forward();
      target = this._transition;
    }
    if (relativeTo != null)
      target.SetPosition(winX, winY);
    else if (this.IsDialog)
      target.SetPosition((this.Owner.Window.Width - this.W) / 2, (this.Owner.Window.Height - this.H) / 2);
    this.Owner.Window.EventHookManager.Add(this);
    this.Owner.Window.FocusManagerStack.Push(this.FocusManager);
    this.Owner.Show(target);
  }
  Hide() {
    this.Owner.Window.EventHookManager.Remove(this);
    this.Owner.Window.FocusManagerStack.Remove(this.FocusManager);
    if (this._transition != null) {
      this._transition.Reverse();
    } else if (this._proxy != null) {
      this.Owner.Remove(this._proxy);
      this._proxy = null;
    } else {
      this.Owner.Remove(this);
    }
  }
  PreviewEvent(type, e) {
    return EventPreviewResult.NotProcessed;
  }
}
__publicField(Popup, "DefaultTransitionBuilder", (animation, child, origin) => new ScaleYTransition(animation, origin).Init({
  Child: child
}));
__publicField(Popup, "DialogTransitionBuilder", (animation, child, origin) => {
  let curve = new CurvedAnimation(animation, Curves.EaseInOutCubic);
  let offsetAnimation = new OffsetTween(new Offset(0, -0.1), new Offset(0, 0)).Animate(curve);
  return new SlideTransition(offsetAnimation).Init({
    Child: child
  });
});
class PopupTransitionWrap extends SingleChildWidget {
  constructor(overlay, isDialog, proxy, origin, transitionBuilder) {
    super();
    __publicField(this, "AnimationController");
    __publicField(this, "_overlay");
    __publicField(this, "_isDialog");
    this._overlay = overlay;
    this._isDialog = isDialog;
    this.AnimationController = new AnimationController(100);
    this.AnimationController.StatusChanged.Add(this.OnAnimationStateChanged, this);
    this.Child = transitionBuilder(this.AnimationController, proxy, origin);
  }
  Forward() {
    this.AnimationController.Forward();
  }
  Reverse() {
    this.AnimationController.Reverse();
  }
  OnAnimationStateChanged(status) {
    if (status == AnimationStatus.Completed) {
      this._overlay.Window.RunNewHitTest();
    } else if (status == AnimationStatus.Dismissed) {
      this._overlay.Remove(this);
      this._overlay.Window.RunNewHitTest();
    }
  }
  HitTest(x, y, result) {
    if (this._isDialog) {
      result.Add(this);
      this.HitTestChild(this.Child, x, y, result);
      return true;
    }
    return super.HitTest(x, y, result);
  }
  Dispose() {
    this.AnimationController.Dispose();
    super.Dispose();
  }
}
class PopupProxy extends Widget {
  constructor(popup) {
    super();
    __publicField(this, "_popup");
    popup.Layout(popup.Owner.Window.Width, popup.Owner.Window.Height);
    this._popup = popup;
    this._popup.Parent = this;
  }
  VisitChildren(action) {
    action(this._popup);
  }
  ContainsPoint(x, y) {
    return this._popup.ContainsPoint(x, y);
  }
  HitTest(x, y, result) {
    return this._popup.HitTest(x, y, result);
  }
  Layout(availableWidth, availableHeight) {
    this.SetSize(this._popup.W, this._popup.H);
  }
  OnUnmounted() {
    this._popup.Parent = null;
    super.OnUnmounted();
  }
}
class ScaleYTransition extends Transform {
  constructor(animation, origin = null) {
    super(Matrix4.CreateScale(1, animation.Value, 1), origin);
    __publicField(this, "_animation");
    this._animation = animation;
    this._animation.ValueChanged.Add(this.OnAnimationValueChanged, this);
  }
  OnAnimationValueChanged() {
    this.SetTransform(Matrix4.CreateScale(1, this._animation.Value, 1));
  }
}
const _ItemState = class {
  constructor(hoverState, selectedState) {
    __publicField(this, "HoverState");
    __publicField(this, "SelectedState");
    this.HoverState = hoverState;
    this.SelectedState = selectedState;
  }
  Clone() {
    return new _ItemState(this.HoverState, this.SelectedState);
  }
};
let ItemState = _ItemState;
__publicField(ItemState, "Empty", new _ItemState(State.op_Implicit_From(false), State.op_Implicit_From(false)));
class ListPopupItemWidget extends SingleChildWidget {
  constructor(index, hoverState, selectedState, onSelect) {
    super();
    __publicField(this, "_hoverState");
    __publicField(this, "_selectedState");
    __privateAdd(this, _MouseRegion4, void 0);
    this._hoverState = this.Bind(hoverState);
    this._selectedState = selectedState;
    this.MouseRegion = new MouseRegion(() => Cursors.Hand);
    this.MouseRegion.HoverChanged.Add((isHover) => hoverState.Value = isHover);
    this.MouseRegion.PointerTap.Add((e) => onSelect(index));
  }
  get MouseRegion() {
    return __privateGet(this, _MouseRegion4);
  }
  set MouseRegion(value) {
    __privateSet(this, _MouseRegion4, value);
  }
  Layout(availableWidth, availableHeight) {
    var _a;
    let fixedWidth = this.Width.Value;
    let fixedHeight = this.Height.Value;
    (_a = this.Child) == null ? void 0 : _a.Layout(fixedWidth, fixedHeight);
    this.SetSize(fixedWidth, fixedHeight);
  }
  Paint(canvas, area = null) {
    if (this._selectedState.Value)
      canvas.drawRect(Rect.FromLTWH(0, 0, this.W, this.H), PaintUtils.Shared(Theme.FocusedColor));
    else if (this._hoverState.Value)
      canvas.drawRect(Rect.FromLTWH(0, 0, this.W, this.H), PaintUtils.Shared(Theme.AccentColor));
    super.Paint(canvas, area);
  }
}
_MouseRegion4 = new WeakMap();
__publicField(ListPopupItemWidget, "$meta_PixUI_IMouseRegion", true);
class ListPopup extends Popup {
  constructor(overlay, itemBuilder, popupWidth, itemExtent, maxShowItems = 5) {
    super(overlay);
    __publicField(this, "_listViewController");
    __publicField(this, "_itemBuilder");
    __publicField(this, "_child");
    __publicField(this, "_maxShowItems");
    __publicField(this, "_itemExtent");
    __publicField(this, "_itemStates");
    __publicField(this, "_selectedIndex", -1);
    __publicField(this, "_fullDataSource");
    __publicField(this, "OnSelectionChanged");
    this._itemExtent = itemExtent;
    this._maxShowItems = maxShowItems;
    this._itemBuilder = itemBuilder;
    this._listViewController = new ListViewController();
    this._child = new Card().Init({
      Width: State.op_Implicit_From(popupWidth),
      Elevation: State.op_Implicit_From(8),
      Child: new ListView(this.BuildItem.bind(this), null, this._listViewController)
    });
    this._child.Parent = this;
  }
  get DataSource() {
    return this._listViewController.DataSource;
  }
  set DataSource(value) {
    this._fullDataSource = value;
    this.ChangeDataSource(value);
  }
  ChangeDataSource(value) {
    if (value != null) {
      this._itemStates = new Array(value.length).fill(ItemState.Empty.Clone());
      for (let i = 0; i < value.length; i++) {
        this._itemStates[i] = new ItemState(State.op_Implicit_From(false), State.op_Implicit_From(false));
      }
    }
    this._selectedIndex = -1;
    this._listViewController.DataSource = value;
  }
  BuildItem(data, index) {
    let states = this._itemStates[index];
    return new ListPopupItemWidget(index, states.HoverState, states.SelectedState, this.OnSelectByTap.bind(this)).Init({
      Width: this._child.Width,
      Height: State.op_Implicit_From(this._itemExtent),
      Child: this._itemBuilder(data, index, states.HoverState, states.SelectedState)
    });
  }
  TrySelectFirst() {
    if (this._listViewController.DataSource != null && this._listViewController.DataSource.length > 0) {
      this.Select(0, false);
      this._listViewController.ScrollController.OffsetY = 0;
    }
  }
  InitSelect(item) {
    let index = this._listViewController.DataSource.IndexOf(item);
    if (index < 0)
      return;
    this._selectedIndex = index;
    this._itemStates[this._selectedIndex].SelectedState.Value = true;
  }
  Select(index, raiseChangedEvent = false) {
    var _a;
    if (this._selectedIndex == index)
      return;
    if (this._selectedIndex >= 0)
      this._itemStates[this._selectedIndex].SelectedState.Value = false;
    this._selectedIndex = index;
    if (this._selectedIndex >= 0)
      this._itemStates[this._selectedIndex].SelectedState.Value = true;
    if (raiseChangedEvent)
      (_a = this.OnSelectionChanged) == null ? void 0 : _a.call(this, this.DataSource[index]);
    this.Invalidate(InvalidAction.Repaint);
  }
  UpdateFilter(predicate) {
    var _a;
    this.Invalidate(InvalidAction.Relayout);
    this.ChangeDataSource((_a = this._fullDataSource) == null ? void 0 : _a.Where((t) => predicate(t)).ToArray());
  }
  ClearFilter() {
    this.Invalidate(InvalidAction.Relayout);
    this.ChangeDataSource(this._fullDataSource);
  }
  OnSelectByTap(index) {
    this.Select(index, true);
    this.Hide();
  }
  OnKeysUp() {
    if (this._selectedIndex <= 0)
      return;
    this.Select(this._selectedIndex - 1, false);
    this._listViewController.ScrollTo(this._selectedIndex);
  }
  OnKeysDown() {
    if (this._selectedIndex == this.DataSource.length - 1)
      return;
    this.Select(this._selectedIndex + 1, false);
    this._listViewController.ScrollTo(this._selectedIndex);
  }
  OnKeysReturn() {
    var _a;
    if (this._selectedIndex >= 0) {
      (_a = this.OnSelectionChanged) == null ? void 0 : _a.call(this, this.DataSource[this._selectedIndex]);
      this.Hide();
    }
  }
  VisitChildren(action) {
    action(this._child);
  }
  Layout(availableWidth, availableHeight) {
    if (this.DataSource == null)
      return;
    let maxHeight = Math.min(this._itemExtent * this._maxShowItems, this.DataSource.length * this._itemExtent);
    let cardMarginTotalHeight = this._child.Margin == null ? Card.DefaultMargin * 2 : this._child.Margin.Value.Top + this._child.Margin.Value.Bottom;
    this._child.Layout(this._child.Width.Value, maxHeight + cardMarginTotalHeight);
    this.SetSize(this._child.W, this._child.H);
  }
  PreviewEvent(type, e) {
    if (type == EventType.KeyDown) {
      let keyEvent = e;
      if (keyEvent.KeyCode == Keys.Up) {
        this.OnKeysUp();
        return EventPreviewResult.NoDispatch;
      }
      if (keyEvent.KeyCode == Keys.Down) {
        this.OnKeysDown();
        return EventPreviewResult.NoDispatch;
      }
      if (keyEvent.KeyCode == Keys.Return) {
        this.OnKeysReturn();
        return EventPreviewResult.NoDispatch;
      }
    }
    return super.PreviewEvent(type, e);
  }
}
class Dialog extends Popup {
  constructor(overlay = null) {
    super(overlay != null ? overlay : UIWindow.Current.Overlay);
    __publicField(this, "_child");
    __publicField(this, "Title", State.op_Implicit_From(""));
    __publicField(this, "_closeDone");
  }
  get IsDialog() {
    return true;
  }
  TryBuildChild() {
    if (this._child != null)
      return;
    this._child = new Card().Init({
      Elevation: State.op_Implicit_From(20),
      Child: new Column().Init({
        Children: [
          this.BuildTitle(),
          new Expanded(this.BuildBody()),
          this.BuildFooter()
        ]
      })
    });
    this._child.Parent = this;
  }
  BuildTitle() {
    return new Row().Init({
      Height: State.op_Implicit_From(25),
      Children: [
        new Container().Init({ Width: State.op_Implicit_From(35) }),
        new Expanded().Init({
          Child: new Center().Init({ Child: new Text(this.Title) })
        }),
        new Button(null, State.op_Implicit_From(Icons.Filled.Close)).Init({
          Style: ButtonStyle.Transparent,
          OnTap: (_) => this.Close(true)
        })
      ]
    });
  }
  BuildFooter() {
    return new Container().Init({
      Height: State.op_Implicit_From(Button.DefaultHeight + 20 + 20),
      Padding: State.op_Implicit_From(EdgeInsets.All(20)),
      Child: new Row(VerticalAlignment.Middle, 20).Init({
        Children: [
          new Expanded(),
          new Button(State.op_Implicit_From("Cancel")).Init({
            Width: State.op_Implicit_From(80),
            OnTap: (_) => this.Close(true)
          }),
          new Button(State.op_Implicit_From("OK")).Init({
            Width: State.op_Implicit_From(80),
            OnTap: (_) => this.Close(false)
          })
        ]
      })
    });
  }
  Show() {
    super.Show(null, null, Popup.DialogTransitionBuilder);
  }
  ShowAndWaitClose() {
    this.Show();
    this._closeDone = new System.TaskCompletionSource();
    return this._closeDone.Task;
  }
  OnClosing(canceled) {
    return false;
  }
  Close(canceled) {
    var _a;
    if (this.OnClosing(canceled))
      return;
    this.Hide();
    (_a = this._closeDone) == null ? void 0 : _a.SetResult(canceled);
  }
  OnMounted() {
    this.TryBuildChild();
    super.OnMounted();
  }
  VisitChildren(action) {
    action(this._child);
  }
  ContainsPoint(x, y) {
    return true;
  }
  HitTest(x, y, result) {
    result.Add(this);
    this.HitTestChild(this._child, x, y, result);
    return true;
  }
  Layout(availableWidth, availableHeight) {
    var _a, _b, _c, _d;
    this.TryBuildChild();
    this._child.Layout((_b = (_a = this.Width) == null ? void 0 : _a.Value) != null ? _b : availableWidth, (_d = (_c = this.Height) == null ? void 0 : _c.Value) != null ? _d : availableHeight);
    this.SetSize(this._child.W, this._child.H);
  }
}
class NotificationEntry extends SingleChildWidget {
  constructor(icon, text) {
    super();
    __publicField(this, "_controller", new AnimationController(100));
    this._controller.ValueChanged.Add(this.OnAnimationValueChanged, this);
    this._controller.StatusChanged.Add(this.OnAnimationStateChanged, this);
    this.Child = new Card().Init({
      Width: State.op_Implicit_From(280),
      Child: new Row(VerticalAlignment.Middle, 5).Init({
        Children: [
          icon,
          new Expanded().Init({ Child: text }),
          new Button(null, State.op_Implicit_From(Icons.Filled.Close)).Init({
            Style: ButtonStyle.Transparent,
            Shape: ButtonShape.Pills,
            OnTap: (_) => this._controller.Reverse()
          })
        ]
      })
    });
  }
  OnAnimationValueChanged() {
    let offsetX = this.Overlay.Window.Width - this.W * this._controller.Value;
    this.SetPosition(offsetX, this.Y);
    this.Invalidate(InvalidAction.Repaint);
  }
  OnAnimationStateChanged(status) {
    if (status == AnimationStatus.Completed)
      this.StartHide();
    else if (status == AnimationStatus.Dismissed)
      this.Parent.RemoveEntry(this);
  }
  async StartHide() {
    await new Promise((resolve) => setTimeout(() => resolve(), 3e3));
    this._controller.Reverse();
  }
  StartShow() {
    this._controller.Forward();
  }
  Dispose() {
    this._controller.Dispose();
    super.Dispose();
  }
}
const _Notification = class extends Popup {
  constructor(overlay) {
    super(overlay);
    __publicField(this, "_children", new System.List());
  }
  RemoveEntry(entry) {
    let index = this._children.IndexOf(entry);
    let entryHeight = entry.H;
    for (let i = index + 1; i < this._children.length; i++) {
      this._children[i].SetPosition(this._children[i].X, this._children[i].Y - entryHeight);
    }
    this._children.RemoveAt(index);
    this.Invalidate(InvalidAction.Repaint);
  }
  VisitChildren(action) {
    for (const child of this._children) {
      if (action(child))
        break;
    }
  }
  HitTest(x, y, result) {
    for (const child of this._children) {
      if (this.HitTestChild(child, x, y, result))
        return true;
    }
    return false;
  }
  Layout(availableWidth, availableHeight) {
  }
  Paint(canvas, area = null) {
    for (const child of this._children) {
      canvas.translate(child.X, child.Y);
      child.Paint(canvas, area);
      canvas.translate(-child.X, -child.Y);
    }
  }
  static Show(icon, text) {
    let win = UIWindow.Current;
    let exists = win.Overlay.FindEntry((e) => e instanceof _Notification);
    let notification = exists == null ? new _Notification(win.Overlay) : exists;
    if (exists == null)
      notification.Show();
    let entry = new NotificationEntry(icon, text);
    entry.Parent = notification;
    entry.Layout(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    let childrenCount = notification._children.length;
    let yPos = childrenCount == 0 ? _Notification._firstOffset : notification._children[childrenCount - 1].Y + notification._children[childrenCount - 1].H + _Notification._sepSpace;
    entry.SetPosition(win.Width, yPos);
    notification._children.Add(entry);
    entry.StartShow();
  }
  static Info(message) {
    let color = State.op_Implicit_From(Colors.Gray);
    _Notification.Show(new Icon(State.op_Implicit_From(Icons.Filled.Info)).Init({
      Size: State.op_Implicit_From(18),
      Color: color
    }), new Text(State.op_Implicit_From(message)).Init({ TextColor: color, MaxLines: 5 }));
  }
  static Success(message) {
    let color = State.op_Implicit_From(Colors.Green);
    _Notification.Show(new Icon(State.op_Implicit_From(Icons.Filled.Error)).Init({
      Size: State.op_Implicit_From(18),
      Color: color
    }), new Text(State.op_Implicit_From(message)).Init({ TextColor: color, MaxLines: 5 }));
  }
  static Error(message) {
    let color = State.op_Implicit_From(Colors.Red);
    _Notification.Show(new Icon(State.op_Implicit_From(Icons.Filled.Error)).Init({
      Size: State.op_Implicit_From(18),
      Color: color
    }), new Text(State.op_Implicit_From(message)).Init({ TextColor: color, MaxLines: 5 }));
  }
};
let Notification = _Notification;
__publicField(Notification, "_firstOffset", 10);
__publicField(Notification, "_sepSpace", 2);
class Inspector extends Widget {
  constructor() {
    super();
    __publicField(this, "_target");
  }
  static Show(target) {
    if (!target.IsMounted)
      return null;
    let overlay = target.Overlay;
    let inspector = overlay.FindEntry((w) => w instanceof Inspector);
    if (inspector == null) {
      let instance = new Inspector();
      instance._target = target;
      overlay.Show(instance);
      return instance;
    } else {
      let instance = inspector;
      instance._target = target;
      instance.Invalidate(InvalidAction.Repaint);
      return instance;
    }
  }
  Remove() {
    this.Parent.Remove(this);
  }
  HitTest(x, y, result) {
    return false;
  }
  Layout(availableWidth, availableHeight) {
  }
  Paint(canvas, area = null) {
    let path = new System.List();
    let temp = this._target;
    while (temp.Parent != null) {
      path.Add(temp.Parent);
      temp = temp.Parent;
    }
    canvas.save();
    for (let i = path.length - 1; i >= 0; i--) {
      temp = path[i];
      canvas.translate(temp.X, temp.Y);
      if (IsInterfaceOfIScrollable(temp)) {
        const scrollable = temp;
        canvas.translate(-scrollable.ScrollOffsetX, -scrollable.ScrollOffsetY);
      } else if (temp instanceof Transform) {
        const transform = temp;
        canvas.concat(transform.EffectiveTransform.TransponseTo());
      }
    }
    let bounds = Rect.FromLTWH(this._target.X + 0.5, this._target.Y + 0.5, this._target.W - 1, this._target.H - 1);
    let borderColor = new Color(2155839166);
    let fillColor = new Color(2159918588);
    canvas.drawRect(bounds, PaintUtils.Shared(fillColor));
    canvas.drawRect(bounds, PaintUtils.Shared(borderColor, CanvasKit.PaintStyle.Stroke));
    canvas.restore();
  }
}
class FadeTransition extends SingleChildWidget {
  constructor(opacity) {
    super();
    __publicField(this, "_opacity");
    this._opacity = opacity;
  }
  Paint(canvas, area = null) {
    if (this._opacity.Value == 0 || this.Child == null)
      return;
    let alpha = Math.floor(255 * this._opacity.Value) & 255;
    let paint = PaintUtils.Shared(new Color(0, 0, 0, alpha));
    let rect = Rect.FromLTWH(this.Child.X, this.Child.Y, this.Child.W, this.Child.H);
    canvas.saveLayer(paint, rect);
    this.PaintChildren(canvas, area);
    canvas.restore();
  }
}
class RotationTransition extends Transform {
  constructor(turns) {
    super(Matrix4.CreateIdentity());
    __publicField(this, "_turns");
    this._turns = turns;
    this._turns.ValueChanged.Add(this.OnTurnChanged, this);
  }
  Layout(availableWidth, availableHeight) {
    super.Layout(availableWidth, availableHeight);
    let originX = 0;
    let originY = 0;
    if (this.Child != null) {
      originX = this.Child.W / 2;
      originY = this.Child.H / 2;
    }
    this.InitTransformAndOrigin(this.CalcTransform(), new Offset(originX, originY));
  }
  CalcTransform() {
    let matrix = Matrix4.CreateIdentity();
    matrix.RotateZ(this._turns.Value * Math.PI * 2);
    return matrix;
  }
  OnTurnChanged() {
    this.SetTransform(this.CalcTransform());
  }
  Dispose() {
    this._turns.ValueChanged.Remove(this.OnTurnChanged, this);
    super.Dispose();
  }
}
class SlideTransition extends Transform {
  constructor(position) {
    super(Matrix4.CreateIdentity());
    __publicField(this, "_position");
    __publicField(this, "_offsetX", 0);
    __publicField(this, "_offsetY", 0);
    this._position = position;
    this._position.ValueChanged.Add(this.OnPositionChanged, this);
  }
  Layout(availableWidth, availableHeight) {
    super.Layout(availableWidth, availableHeight);
    this.CalcOffset();
    this.InitTransformAndOrigin(Matrix4.CreateTranslation(this._offsetX, this._offsetY, 0));
  }
  CalcOffset() {
    if (this.Child == null)
      return;
    this._offsetX = this._position.Value.Dx * this.Child.W;
    this._offsetY = this._position.Value.Dy * this.Child.H;
  }
  OnPositionChanged() {
    this.CalcOffset();
    this.SetTransform(Matrix4.CreateTranslation(this._offsetX, this._offsetY, 0));
  }
  Dispose() {
    this._position.ValueChanged.Remove(this.OnPositionChanged, this);
    super.Dispose();
  }
}
var ButtonIconPosition = /* @__PURE__ */ ((ButtonIconPosition2) => {
  ButtonIconPosition2[ButtonIconPosition2["Left"] = 0] = "Left";
  ButtonIconPosition2[ButtonIconPosition2["Top"] = 1] = "Top";
  return ButtonIconPosition2;
})(ButtonIconPosition || {});
var ButtonStyle = /* @__PURE__ */ ((ButtonStyle2) => {
  ButtonStyle2[ButtonStyle2["Solid"] = 0] = "Solid";
  ButtonStyle2[ButtonStyle2["Outline"] = 1] = "Outline";
  ButtonStyle2[ButtonStyle2["Transparent"] = 2] = "Transparent";
  return ButtonStyle2;
})(ButtonStyle || {});
var ButtonShape = /* @__PURE__ */ ((ButtonShape2) => {
  ButtonShape2[ButtonShape2["Standard"] = 0] = "Standard";
  ButtonShape2[ButtonShape2["Pills"] = 1] = "Pills";
  ButtonShape2[ButtonShape2["Square"] = 2] = "Square";
  return ButtonShape2;
})(ButtonShape || {});
const _Button = class extends Widget {
  constructor(text = null, icon = null) {
    super();
    __publicField(this, "_text");
    __publicField(this, "_icon");
    __publicField(this, "_outlineWidth");
    __publicField(this, "_textColor");
    __publicField(this, "_fontSize");
    __publicField(this, "Style", ButtonStyle.Solid);
    __publicField(this, "Shape", ButtonShape.Standard);
    __publicField(this, "_textWidget");
    __publicField(this, "_iconWidget");
    __publicField(this, "_hoverDecoration");
    __privateAdd(this, _MouseRegion5, void 0);
    __privateAdd(this, _FocusNode3, void 0);
    this._text = text;
    this._icon = icon;
    this.Height = State.op_Implicit_From(_Button.DefaultHeight);
    this.MouseRegion = new MouseRegion(() => Cursors.Hand);
    this.FocusNode = new FocusNode();
    this._hoverDecoration = new HoverDecoration(this, this.GetHoverShaper.bind(this), this.GetHoverBounds.bind(this));
    this._hoverDecoration.AttachHoverChangedEvent(this);
  }
  get TextColor() {
    return this._textColor;
  }
  set TextColor(value) {
    this._textColor = value;
    if (this._textWidget != null)
      this._textWidget.TextColor = value;
    if (this._iconWidget != null)
      this._iconWidget.Color = value;
  }
  get FontSize() {
    return this._fontSize;
  }
  set FontSize(value) {
    this._fontSize = value;
    if (this._textWidget != null)
      this._textWidget.FontSize = value;
    if (this._iconWidget != null)
      this._iconWidget.Size = value;
  }
  get MouseRegion() {
    return __privateGet(this, _MouseRegion5);
  }
  set MouseRegion(value) {
    __privateSet(this, _MouseRegion5, value);
  }
  get FocusNode() {
    return __privateGet(this, _FocusNode3);
  }
  set FocusNode(value) {
    __privateSet(this, _FocusNode3, value);
  }
  set OnTap(value) {
    this.MouseRegion.PointerTap.Add(value, this);
  }
  GetHoverShaper() {
    switch (this.Shape) {
      case ButtonShape.Square:
        return new RoundedRectangleBorder();
      case ButtonShape.Standard:
        return new RoundedRectangleBorder(null, BorderRadius.All(Radius.Circular(_Button.StandardRadius)));
      case ButtonShape.Pills:
        return new RoundedRectangleBorder(null, BorderRadius.All(Radius.Circular(this.H / 2)));
      default:
        throw new System.NotImplementedException();
    }
  }
  GetHoverBounds() {
    if (this._iconWidget != null && this._textWidget == null && this.Style == ButtonStyle.Transparent) {
      let pt2Win = this._iconWidget.LocalToWindow(0, 0);
      return Rect.FromLTWH(pt2Win.X, pt2Win.Y, this._iconWidget.W, this._iconWidget.H);
    } else {
      let pt2Win = this.LocalToWindow(0, 0);
      return Rect.FromLTWH(pt2Win.X, pt2Win.Y, this.W, this.H);
    }
  }
  Layout(availableWidth, availableHeight) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    this.TryBuildContent();
    (_a = this._iconWidget) == null ? void 0 : _a.Layout(width, height);
    (_d = this._textWidget) == null ? void 0 : _d.Layout(width - ((_c = (_b = this._iconWidget) == null ? void 0 : _b.W) != null ? _c : 0), height);
    let contentWidth = ((_f = (_e = this._iconWidget) == null ? void 0 : _e.W) != null ? _f : 0) + ((_h = (_g = this._textWidget) == null ? void 0 : _g.W) != null ? _h : 0);
    if (this.Width == null)
      this.SetSize(Math.max(_Button.DefaultHeight, contentWidth + 16), height);
    else
      this.SetSize(width, height);
    let contentOffsetX = (this.W - contentWidth) / 2;
    (_i = this._iconWidget) == null ? void 0 : _i.SetPosition(contentOffsetX, (this.H - this._iconWidget.H) / 2);
    (_l = this._textWidget) == null ? void 0 : _l.SetPosition(contentOffsetX + ((_k = (_j = this._iconWidget) == null ? void 0 : _j.W) != null ? _k : 0), (this.H - this._textWidget.H) / 2);
  }
  TryBuildContent() {
    if (this._text == null && this._icon == null)
      return;
    if (this._textColor == null) {
      this._textColor = State.op_Implicit_From(this.Style == ButtonStyle.Solid ? Colors.White : Colors.Black);
    }
    if (this._text != null && this._textWidget == null) {
      this._textWidget = new Text(this._text).Init({
        TextColor: this._textColor,
        FontSize: this._fontSize
      });
      this._textWidget.Parent = this;
    }
    if (this._icon != null && this._iconWidget == null) {
      this._iconWidget = new Icon(this._icon).Init({ Color: this._textColor, Size: this._fontSize });
      this._iconWidget.Parent = this;
    }
  }
  Paint(canvas, area = null) {
    this.PaintShape(canvas);
    if (this._iconWidget != null) {
      canvas.translate(this._iconWidget.X, this._iconWidget.Y);
      this._iconWidget.Paint(canvas, area);
      canvas.translate(-this._iconWidget.X, -this._iconWidget.Y);
    }
    if (this._textWidget != null) {
      canvas.translate(this._textWidget.X, this._textWidget.Y);
      this._textWidget.Paint(canvas, area);
      canvas.translate(-this._textWidget.X, -this._textWidget.Y);
    }
  }
  PaintShape(canvas) {
    var _a, _b;
    if (this.Style == ButtonStyle.Transparent)
      return;
    let paint = PaintUtils.Shared();
    paint.setStyle(this.Style == ButtonStyle.Solid ? CanvasKit.PaintStyle.Fill : CanvasKit.PaintStyle.Stroke);
    paint.setStrokeWidth(this.Style == ButtonStyle.Outline ? (_b = (_a = this._outlineWidth) == null ? void 0 : _a.Value) != null ? _b : 2 : 0);
    paint.setAntiAlias(this.Shape != ButtonShape.Square);
    paint.setColor(new Color(4281893119));
    switch (this.Shape) {
      case ButtonShape.Square:
        canvas.drawRect(Rect.FromLTWH(0, 0, this.W, this.H), paint);
        break;
      case ButtonShape.Standard: {
        let rrect = RRect.FromRectAndRadius(Rect.FromLTWH(0, 0, this.W, this.H), _Button.StandardRadius, _Button.StandardRadius);
        canvas.drawRRect(rrect, paint);
        break;
      }
      default:
        throw new System.NotImplementedException();
    }
  }
  OnUnmounted() {
    super.OnUnmounted();
    this._hoverDecoration.Hide();
  }
  Dispose() {
    var _a, _b;
    (_a = this._textWidget) == null ? void 0 : _a.Dispose();
    (_b = this._iconWidget) == null ? void 0 : _b.Dispose();
    super.Dispose();
  }
};
let Button = _Button;
_MouseRegion5 = new WeakMap();
_FocusNode3 = new WeakMap();
__publicField(Button, "$meta_PixUI_IMouseRegion", true);
__publicField(Button, "$meta_PixUI_IFocusable", true);
__publicField(Button, "DefaultHeight", 30);
__publicField(Button, "StandardRadius", 4);
class ExpandIcon extends SingleChildWidget {
  constructor(turns, size = null, color = null) {
    super();
    __privateAdd(this, _MouseRegion6, void 0);
    this.MouseRegion = new MouseRegion();
    this.Child = new RotationTransition(turns).Init({
      Child: new Icon(State.op_Implicit_From(Icons.Filled.ExpandMore)).Init({
        Size: size,
        Color: color
      })
    });
  }
  get MouseRegion() {
    return __privateGet(this, _MouseRegion6);
  }
  set MouseRegion(value) {
    __privateSet(this, _MouseRegion6, value);
  }
  set OnPointerDown(value) {
    this.MouseRegion.PointerDown.Add(value, this);
  }
}
_MouseRegion6 = new WeakMap();
__publicField(ExpandIcon, "$meta_PixUI_IMouseRegion", true);
class ButtonGroup extends MultiChildWidget {
  constructor() {
    super();
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    let xPos = 0;
    let buttonHeight = State.op_Implicit_From(Math.min(height, Button.DefaultHeight));
    for (let i = 0; i < this._children.length; i++) {
      this._children[i].Height = buttonHeight;
      this._children[i].Shape = ButtonShape.Square;
      this._children[i].Layout(Math.max(0, width - xPos), buttonHeight.Value);
      this._children[i].SetPosition(xPos, 0);
      xPos += this._children[i].W;
    }
    this.SetSize(xPos, buttonHeight.Value);
  }
  Paint(canvas, area = null) {
    let rrect = RRect.FromRectAndRadius(Rect.FromLTWH(0, 0, this.W, this.H), Button.StandardRadius, Button.StandardRadius);
    let path = new CanvasKit.Path();
    path.addRRect(rrect);
    canvas.save();
    canvas.clipPath(path, CanvasKit.ClipOp.Intersect, true);
    super.Paint(canvas, area);
    let paint = PaintUtils.Shared(Colors.White, CanvasKit.PaintStyle.Stroke, 1);
    for (let i = 1; i < this._children.length; i++) {
      let x = this._children[i].X - 0.5;
      canvas.drawLine(x, 0, x, this.H, paint);
    }
    canvas.restore();
    path.delete();
  }
}
class IconData {
  constructor(codePoint, fontFamily, assemblyName, assetPath) {
    __publicField(this, "CodePoint");
    __publicField(this, "FontFamily");
    __publicField(this, "AssemblyName");
    __publicField(this, "AssetPath");
    this.CodePoint = codePoint;
    this.FontFamily = fontFamily;
    this.AssemblyName = assemblyName;
    this.AssetPath = assetPath;
  }
  Clone() {
    return new IconData(this.CodePoint, this.FontFamily, this.AssemblyName, this.AssetPath);
  }
}
const _MaterialIcons = class {
  get N10k() {
    return new IconData(59729, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N10mp() {
    return new IconData(59730, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N11mp() {
    return new IconData(59731, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N123() {
    return new IconData(60301, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N12mp() {
    return new IconData(59732, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N13mp() {
    return new IconData(59733, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N14mp() {
    return new IconData(59734, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N15mp() {
    return new IconData(59735, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N16mp() {
    return new IconData(59736, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N17mp() {
    return new IconData(59737, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N18mp() {
    return new IconData(59738, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N19mp() {
    return new IconData(59739, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N1k() {
    return new IconData(59740, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N1kPlus() {
    return new IconData(59741, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N1xMobiledata() {
    return new IconData(61389, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N20mp() {
    return new IconData(59742, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N21mp() {
    return new IconData(59743, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N22mp() {
    return new IconData(59744, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N23mp() {
    return new IconData(59745, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N24mp() {
    return new IconData(59746, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N2k() {
    return new IconData(59747, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N2kPlus() {
    return new IconData(59748, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N2mp() {
    return new IconData(59749, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N30fps() {
    return new IconData(61390, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N30fpsSelect() {
    return new IconData(61391, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N360() {
    return new IconData(58743, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N3dRotation() {
    return new IconData(59469, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N3gMobiledata() {
    return new IconData(61392, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N3k() {
    return new IconData(59750, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N3kPlus() {
    return new IconData(59751, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N3mp() {
    return new IconData(59752, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N3p() {
    return new IconData(61393, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N4gMobiledata() {
    return new IconData(61394, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N4gPlusMobiledata() {
    return new IconData(61395, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N4k() {
    return new IconData(57458, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N4kPlus() {
    return new IconData(59753, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N4mp() {
    return new IconData(59754, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N5g() {
    return new IconData(61240, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N5k() {
    return new IconData(59755, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N5kPlus() {
    return new IconData(59756, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N5mp() {
    return new IconData(59757, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N60fps() {
    return new IconData(61396, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N60fpsSelect() {
    return new IconData(61397, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N6FtApart() {
    return new IconData(61982, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N6k() {
    return new IconData(59758, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N6kPlus() {
    return new IconData(59759, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N6mp() {
    return new IconData(59760, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N7k() {
    return new IconData(59761, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N7kPlus() {
    return new IconData(59762, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N7mp() {
    return new IconData(59763, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N8k() {
    return new IconData(59764, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N8kPlus() {
    return new IconData(59765, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N8mp() {
    return new IconData(59766, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N9k() {
    return new IconData(59767, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N9kPlus() {
    return new IconData(59768, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get N9mp() {
    return new IconData(59769, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Abc() {
    return new IconData(60308, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AcUnit() {
    return new IconData(60219, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AccessAlarm() {
    return new IconData(57744, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AccessAlarms() {
    return new IconData(57745, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AccessTime() {
    return new IconData(57746, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AccessTimeFilled() {
    return new IconData(61398, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Accessibility() {
    return new IconData(59470, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AccessibilityNew() {
    return new IconData(59692, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Accessible() {
    return new IconData(59668, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AccessibleForward() {
    return new IconData(59700, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AccountBalance() {
    return new IconData(59471, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AccountBalanceWallet() {
    return new IconData(59472, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AccountBox() {
    return new IconData(59473, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AccountCircle() {
    return new IconData(59475, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AccountTree() {
    return new IconData(59770, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AdUnits() {
    return new IconData(61241, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Adb() {
    return new IconData(58894, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Add() {
    return new IconData(57669, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddAPhoto() {
    return new IconData(58425, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddAlarm() {
    return new IconData(57747, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddAlert() {
    return new IconData(57347, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddBox() {
    return new IconData(57670, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddBusiness() {
    return new IconData(59177, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddCall() {
    return new IconData(57576, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddCard() {
    return new IconData(60294, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddChart() {
    return new IconData(59771, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddCircle() {
    return new IconData(57671, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddCircleOutline() {
    return new IconData(57672, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddComment() {
    return new IconData(57958, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddIcCall() {
    return new IconData(59772, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddLink() {
    return new IconData(57720, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddLocation() {
    return new IconData(58727, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddLocationAlt() {
    return new IconData(61242, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddModerator() {
    return new IconData(59773, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddPhotoAlternate() {
    return new IconData(58430, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddReaction() {
    return new IconData(57811, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddRoad() {
    return new IconData(61243, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddShoppingCart() {
    return new IconData(59476, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddTask() {
    return new IconData(62010, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddToDrive() {
    return new IconData(58972, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddToHomeScreen() {
    return new IconData(57854, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddToPhotos() {
    return new IconData(58269, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AddToQueue() {
    return new IconData(57436, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Addchart() {
    return new IconData(61244, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AdfScanner() {
    return new IconData(60122, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Adjust() {
    return new IconData(58270, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AdminPanelSettings() {
    return new IconData(61245, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Adobe() {
    return new IconData(60054, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AdsClick() {
    return new IconData(59234, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Agriculture() {
    return new IconData(60025, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Air() {
    return new IconData(61400, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AirlineSeatFlat() {
    return new IconData(58928, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AirlineSeatFlatAngled() {
    return new IconData(58929, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AirlineSeatIndividualSuite() {
    return new IconData(58930, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AirlineSeatLegroomExtra() {
    return new IconData(58931, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AirlineSeatLegroomNormal() {
    return new IconData(58932, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AirlineSeatLegroomReduced() {
    return new IconData(58933, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AirlineSeatReclineExtra() {
    return new IconData(58934, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AirlineSeatReclineNormal() {
    return new IconData(58935, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AirlineStops() {
    return new IconData(59344, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Airlines() {
    return new IconData(59338, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AirplaneTicket() {
    return new IconData(61401, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AirplanemodeActive() {
    return new IconData(57749, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AirplanemodeInactive() {
    return new IconData(57748, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AirplanemodeOff() {
    return new IconData(57748, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AirplanemodeOn() {
    return new IconData(57749, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Airplay() {
    return new IconData(57429, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AirportShuttle() {
    return new IconData(60220, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Alarm() {
    return new IconData(59477, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AlarmAdd() {
    return new IconData(59478, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AlarmOff() {
    return new IconData(59479, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AlarmOn() {
    return new IconData(59480, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Album() {
    return new IconData(57369, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AlignHorizontalCenter() {
    return new IconData(57359, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AlignHorizontalLeft() {
    return new IconData(57357, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AlignHorizontalRight() {
    return new IconData(57360, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AlignVerticalBottom() {
    return new IconData(57365, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AlignVerticalCenter() {
    return new IconData(57361, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AlignVerticalTop() {
    return new IconData(57356, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AllInbox() {
    return new IconData(59775, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AllInclusive() {
    return new IconData(60221, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AllOut() {
    return new IconData(59659, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AltRoute() {
    return new IconData(61828, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AlternateEmail() {
    return new IconData(57574, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AmpStories() {
    return new IconData(59923, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Analytics() {
    return new IconData(61246, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Anchor() {
    return new IconData(61901, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Android() {
    return new IconData(59481, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Animation() {
    return new IconData(59164, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Announcement() {
    return new IconData(59482, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Aod() {
    return new IconData(61402, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Apartment() {
    return new IconData(59968, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Api() {
    return new IconData(61879, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AppBlocking() {
    return new IconData(61247, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AppRegistration() {
    return new IconData(61248, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AppSettingsAlt() {
    return new IconData(61249, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AppShortcut() {
    return new IconData(60132, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Apple() {
    return new IconData(60032, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Approval() {
    return new IconData(59778, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Apps() {
    return new IconData(58819, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AppsOutage() {
    return new IconData(59340, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Architecture() {
    return new IconData(59963, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Archive() {
    return new IconData(57673, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AreaChart() {
    return new IconData(59248, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowBack() {
    return new IconData(58820, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowBackIos() {
    return new IconData(58848, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowBackIosNew() {
    return new IconData(58090, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowCircleDown() {
    return new IconData(61825, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowCircleLeft() {
    return new IconData(60071, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowCircleRight() {
    return new IconData(60074, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowCircleUp() {
    return new IconData(61826, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowDownward() {
    return new IconData(58843, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowDropDown() {
    return new IconData(58821, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowDropDownCircle() {
    return new IconData(58822, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowDropUp() {
    return new IconData(58823, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowForward() {
    return new IconData(58824, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowForwardIos() {
    return new IconData(58849, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowLeft() {
    return new IconData(58846, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowRight() {
    return new IconData(58847, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowRightAlt() {
    return new IconData(59713, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArrowUpward() {
    return new IconData(58840, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ArtTrack() {
    return new IconData(57440, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Article() {
    return new IconData(61250, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AspectRatio() {
    return new IconData(59483, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Assessment() {
    return new IconData(59484, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Assignment() {
    return new IconData(59485, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AssignmentInd() {
    return new IconData(59486, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AssignmentLate() {
    return new IconData(59487, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AssignmentReturn() {
    return new IconData(59488, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AssignmentReturned() {
    return new IconData(59489, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AssignmentTurnedIn() {
    return new IconData(59490, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Assistant() {
    return new IconData(58271, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AssistantDirection() {
    return new IconData(59784, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AssistantNavigation() {
    return new IconData(59785, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AssistantPhoto() {
    return new IconData(58272, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AssuredWorkload() {
    return new IconData(60271, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Atm() {
    return new IconData(58739, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AttachEmail() {
    return new IconData(59998, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AttachFile() {
    return new IconData(57894, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AttachMoney() {
    return new IconData(57895, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Attachment() {
    return new IconData(58044, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Attractions() {
    return new IconData(59986, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Attribution() {
    return new IconData(61403, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AudioFile() {
    return new IconData(60290, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Audiotrack() {
    return new IconData(58273, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AutoAwesome() {
    return new IconData(58975, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AutoAwesomeMosaic() {
    return new IconData(58976, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AutoAwesomeMotion() {
    return new IconData(58977, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AutoDelete() {
    return new IconData(59980, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AutoFixHigh() {
    return new IconData(58979, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AutoFixNormal() {
    return new IconData(58980, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AutoFixOff() {
    return new IconData(58981, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AutoGraph() {
    return new IconData(58619, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AutoStories() {
    return new IconData(58982, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AutofpsSelect() {
    return new IconData(61404, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Autorenew() {
    return new IconData(59491, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get AvTimer() {
    return new IconData(57371, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BabyChangingStation() {
    return new IconData(61851, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BackHand() {
    return new IconData(59236, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Backpack() {
    return new IconData(61852, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Backspace() {
    return new IconData(57674, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Backup() {
    return new IconData(59492, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BackupTable() {
    return new IconData(61251, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Badge() {
    return new IconData(60007, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BakeryDining() {
    return new IconData(59987, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Balance() {
    return new IconData(60150, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Balcony() {
    return new IconData(58767, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Ballot() {
    return new IconData(57714, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BarChart() {
    return new IconData(57963, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BatchPrediction() {
    return new IconData(61685, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Bathroom() {
    return new IconData(61405, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Bathtub() {
    return new IconData(59969, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Battery0Bar() {
    return new IconData(60380, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Battery1Bar() {
    return new IconData(60377, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Battery2Bar() {
    return new IconData(60384, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Battery3Bar() {
    return new IconData(60381, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Battery4Bar() {
    return new IconData(60386, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Battery5Bar() {
    return new IconData(60372, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Battery6Bar() {
    return new IconData(60370, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BatteryAlert() {
    return new IconData(57756, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BatteryChargingFull() {
    return new IconData(57763, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BatteryFull() {
    return new IconData(57764, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BatterySaver() {
    return new IconData(61406, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BatteryStd() {
    return new IconData(57765, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BatteryUnknown() {
    return new IconData(57766, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BeachAccess() {
    return new IconData(60222, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Bed() {
    return new IconData(61407, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BedroomBaby() {
    return new IconData(61408, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BedroomChild() {
    return new IconData(61409, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BedroomParent() {
    return new IconData(61410, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Bedtime() {
    return new IconData(61252, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BedtimeOff() {
    return new IconData(60278, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Beenhere() {
    return new IconData(58669, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Bento() {
    return new IconData(61940, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BikeScooter() {
    return new IconData(61253, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Biotech() {
    return new IconData(59962, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Blender() {
    return new IconData(61411, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Block() {
    return new IconData(57675, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BlockFlipped() {
    return new IconData(61254, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Bloodtype() {
    return new IconData(61412, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Bluetooth() {
    return new IconData(57767, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BluetoothAudio() {
    return new IconData(58895, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BluetoothConnected() {
    return new IconData(57768, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BluetoothDisabled() {
    return new IconData(57769, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BluetoothDrive() {
    return new IconData(61413, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BluetoothSearching() {
    return new IconData(57770, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BlurCircular() {
    return new IconData(58274, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BlurLinear() {
    return new IconData(58275, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BlurOff() {
    return new IconData(58276, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BlurOn() {
    return new IconData(58277, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Bolt() {
    return new IconData(59915, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Book() {
    return new IconData(59493, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BookOnline() {
    return new IconData(61975, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Bookmark() {
    return new IconData(59494, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BookmarkAdd() {
    return new IconData(58776, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BookmarkAdded() {
    return new IconData(58777, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BookmarkBorder() {
    return new IconData(59495, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BookmarkOutline() {
    return new IconData(59495, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BookmarkRemove() {
    return new IconData(58778, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Bookmarks() {
    return new IconData(59787, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BorderAll() {
    return new IconData(57896, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BorderBottom() {
    return new IconData(57897, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BorderClear() {
    return new IconData(57898, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BorderColor() {
    return new IconData(57899, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BorderHorizontal() {
    return new IconData(57900, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BorderInner() {
    return new IconData(57901, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BorderLeft() {
    return new IconData(57902, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BorderOuter() {
    return new IconData(57903, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BorderRight() {
    return new IconData(57904, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BorderStyle() {
    return new IconData(57905, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BorderTop() {
    return new IconData(57906, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BorderVertical() {
    return new IconData(57907, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Boy() {
    return new IconData(60263, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BrandingWatermark() {
    return new IconData(57451, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BreakfastDining() {
    return new IconData(59988, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Brightness1() {
    return new IconData(58278, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Brightness2() {
    return new IconData(58279, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Brightness3() {
    return new IconData(58280, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Brightness4() {
    return new IconData(58281, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Brightness5() {
    return new IconData(58282, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Brightness6() {
    return new IconData(58283, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Brightness7() {
    return new IconData(58284, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BrightnessAuto() {
    return new IconData(57771, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BrightnessHigh() {
    return new IconData(57772, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BrightnessLow() {
    return new IconData(57773, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BrightnessMedium() {
    return new IconData(57774, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BrokenImage() {
    return new IconData(58285, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BrowseGallery() {
    return new IconData(60369, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BrowserNotSupported() {
    return new IconData(61255, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BrowserUpdated() {
    return new IconData(59343, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BrunchDining() {
    return new IconData(60019, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Brush() {
    return new IconData(58286, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BubbleChart() {
    return new IconData(59101, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BugReport() {
    return new IconData(59496, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Build() {
    return new IconData(59497, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BuildCircle() {
    return new IconData(61256, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Bungalow() {
    return new IconData(58769, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BurstMode() {
    return new IconData(58428, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BusAlert() {
    return new IconData(59791, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Business() {
    return new IconData(57519, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get BusinessCenter() {
    return new IconData(60223, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Cabin() {
    return new IconData(58761, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Cable() {
    return new IconData(61414, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Cached() {
    return new IconData(59498, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Cake() {
    return new IconData(59369, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Calculate() {
    return new IconData(59999, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CalendarMonth() {
    return new IconData(60364, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CalendarToday() {
    return new IconData(59701, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CalendarViewDay() {
    return new IconData(59702, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CalendarViewMonth() {
    return new IconData(61415, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CalendarViewWeek() {
    return new IconData(61416, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Call() {
    return new IconData(57520, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CallEnd() {
    return new IconData(57521, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CallMade() {
    return new IconData(57522, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CallMerge() {
    return new IconData(57523, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CallMissed() {
    return new IconData(57524, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CallMissedOutgoing() {
    return new IconData(57572, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CallReceived() {
    return new IconData(57525, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CallSplit() {
    return new IconData(57526, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CallToAction() {
    return new IconData(57452, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Camera() {
    return new IconData(58287, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CameraAlt() {
    return new IconData(58288, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CameraEnhance() {
    return new IconData(59644, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CameraFront() {
    return new IconData(58289, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CameraIndoor() {
    return new IconData(61417, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CameraOutdoor() {
    return new IconData(61418, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CameraRear() {
    return new IconData(58290, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CameraRoll() {
    return new IconData(58291, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Cameraswitch() {
    return new IconData(61419, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Campaign() {
    return new IconData(61257, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Cancel() {
    return new IconData(58825, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CancelPresentation() {
    return new IconData(57577, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CancelScheduleSend() {
    return new IconData(59961, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CandlestickChart() {
    return new IconData(60116, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CarCrash() {
    return new IconData(60402, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CarRental() {
    return new IconData(59989, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CarRepair() {
    return new IconData(59990, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CardGiftcard() {
    return new IconData(59638, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CardMembership() {
    return new IconData(59639, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CardTravel() {
    return new IconData(59640, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Carpenter() {
    return new IconData(61944, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Cases() {
    return new IconData(59794, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Casino() {
    return new IconData(60224, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Cast() {
    return new IconData(58119, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CastConnected() {
    return new IconData(58120, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CastForEducation() {
    return new IconData(61420, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Castle() {
    return new IconData(60081, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CatchingPokemon() {
    return new IconData(58632, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Category() {
    return new IconData(58740, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Celebration() {
    return new IconData(60005, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CellTower() {
    return new IconData(60346, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CellWifi() {
    return new IconData(57580, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CenterFocusStrong() {
    return new IconData(58292, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CenterFocusWeak() {
    return new IconData(58293, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Chair() {
    return new IconData(61421, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ChairAlt() {
    return new IconData(61422, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Chalet() {
    return new IconData(58757, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ChangeCircle() {
    return new IconData(58087, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ChangeHistory() {
    return new IconData(59499, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ChargingStation() {
    return new IconData(61853, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Chat() {
    return new IconData(57527, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ChatBubble() {
    return new IconData(57546, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ChatBubbleOutline() {
    return new IconData(57547, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Check() {
    return new IconData(58826, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CheckBox() {
    return new IconData(59444, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CheckBoxOutlineBlank() {
    return new IconData(59445, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CheckCircle() {
    return new IconData(59500, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CheckCircleOutline() {
    return new IconData(59693, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Checklist() {
    return new IconData(59057, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ChecklistRtl() {
    return new IconData(59059, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Checkroom() {
    return new IconData(61854, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ChevronLeft() {
    return new IconData(58827, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ChevronRight() {
    return new IconData(58828, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ChildCare() {
    return new IconData(60225, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ChildFriendly() {
    return new IconData(60226, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ChromeReaderMode() {
    return new IconData(59501, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Church() {
    return new IconData(60078, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Circle() {
    return new IconData(61258, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CircleNotifications() {
    return new IconData(59796, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Class() {
    return new IconData(59502, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CleanHands() {
    return new IconData(61983, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CleaningServices() {
    return new IconData(61695, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Clear() {
    return new IconData(57676, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ClearAll() {
    return new IconData(57528, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Close() {
    return new IconData(58829, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CloseFullscreen() {
    return new IconData(61903, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ClosedCaption() {
    return new IconData(57372, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ClosedCaptionDisabled() {
    return new IconData(61916, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ClosedCaptionOff() {
    return new IconData(59798, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Cloud() {
    return new IconData(58045, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CloudCircle() {
    return new IconData(58046, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CloudDone() {
    return new IconData(58047, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CloudDownload() {
    return new IconData(58048, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CloudOff() {
    return new IconData(58049, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CloudQueue() {
    return new IconData(58050, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CloudSync() {
    return new IconData(60250, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CloudUpload() {
    return new IconData(58051, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CloudySnowing() {
    return new IconData(59408, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Co2() {
    return new IconData(59312, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CoPresent() {
    return new IconData(60144, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Code() {
    return new IconData(59503, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CodeOff() {
    return new IconData(58611, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Coffee() {
    return new IconData(61423, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CoffeeMaker() {
    return new IconData(61424, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Collections() {
    return new IconData(58294, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CollectionsBookmark() {
    return new IconData(58417, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ColorLens() {
    return new IconData(58295, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Colorize() {
    return new IconData(58296, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Comment() {
    return new IconData(57529, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CommentBank() {
    return new IconData(59982, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CommentsDisabled() {
    return new IconData(59298, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Commit() {
    return new IconData(60149, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Commute() {
    return new IconData(59712, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Compare() {
    return new IconData(58297, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CompareArrows() {
    return new IconData(59669, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CompassCalibration() {
    return new IconData(58748, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Compost() {
    return new IconData(59233, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Compress() {
    return new IconData(59725, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Computer() {
    return new IconData(58122, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ConfirmationNum() {
    return new IconData(58936, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ConfirmationNumber() {
    return new IconData(58936, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ConnectWithoutContact() {
    return new IconData(61987, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ConnectedTv() {
    return new IconData(59800, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ConnectingAirports() {
    return new IconData(59337, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Construction() {
    return new IconData(59964, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ContactMail() {
    return new IconData(57552, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ContactPage() {
    return new IconData(61998, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ContactPhone() {
    return new IconData(57551, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ContactSupport() {
    return new IconData(59724, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Contactless() {
    return new IconData(60017, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Contacts() {
    return new IconData(57530, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ContentCopy() {
    return new IconData(57677, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ContentCut() {
    return new IconData(57678, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ContentPaste() {
    return new IconData(57679, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ContentPasteGo() {
    return new IconData(60046, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ContentPasteOff() {
    return new IconData(58616, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ContentPasteSearch() {
    return new IconData(60059, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Contrast() {
    return new IconData(60215, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ControlCamera() {
    return new IconData(57460, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ControlPoint() {
    return new IconData(58298, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ControlPointDuplicate() {
    return new IconData(58299, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Cookie() {
    return new IconData(60076, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CopyAll() {
    return new IconData(58092, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Copyright() {
    return new IconData(59660, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Coronavirus() {
    return new IconData(61985, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CorporateFare() {
    return new IconData(61904, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Cottage() {
    return new IconData(58759, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Countertops() {
    return new IconData(61943, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Create() {
    return new IconData(57680, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CreateNewFolder() {
    return new IconData(58060, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CreditCard() {
    return new IconData(59504, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CreditCardOff() {
    return new IconData(58612, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CreditScore() {
    return new IconData(61425, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Crib() {
    return new IconData(58760, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CrisisAlert() {
    return new IconData(60393, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Crop() {
    return new IconData(58302, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Crop169() {
    return new IconData(58300, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Crop32() {
    return new IconData(58301, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Crop54() {
    return new IconData(58303, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Crop75() {
    return new IconData(58304, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CropDin() {
    return new IconData(58305, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CropFree() {
    return new IconData(58306, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CropLandscape() {
    return new IconData(58307, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CropOriginal() {
    return new IconData(58308, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CropPortrait() {
    return new IconData(58309, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CropRotate() {
    return new IconData(58423, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CropSquare() {
    return new IconData(58310, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CrueltyFree() {
    return new IconData(59289, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Css() {
    return new IconData(60307, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CurrencyBitcoin() {
    return new IconData(60357, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CurrencyExchange() {
    return new IconData(60272, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CurrencyFranc() {
    return new IconData(60154, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CurrencyLira() {
    return new IconData(60143, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CurrencyPound() {
    return new IconData(60145, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CurrencyRuble() {
    return new IconData(60140, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CurrencyRupee() {
    return new IconData(60151, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CurrencyYen() {
    return new IconData(60155, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get CurrencyYuan() {
    return new IconData(60153, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Cyclone() {
    return new IconData(60373, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Dangerous() {
    return new IconData(59802, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DarkMode() {
    return new IconData(58652, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Dashboard() {
    return new IconData(59505, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DashboardCustomize() {
    return new IconData(59803, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DataArray() {
    return new IconData(60113, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DataExploration() {
    return new IconData(59247, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DataObject() {
    return new IconData(60115, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DataSaverOff() {
    return new IconData(61426, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DataSaverOn() {
    return new IconData(61427, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DataThresholding() {
    return new IconData(60319, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DataUsage() {
    return new IconData(57775, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DateRange() {
    return new IconData(59670, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Deblur() {
    return new IconData(60279, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Deck() {
    return new IconData(59970, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Dehaze() {
    return new IconData(58311, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Delete() {
    return new IconData(59506, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DeleteForever() {
    return new IconData(59691, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DeleteOutline() {
    return new IconData(59694, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DeleteSweep() {
    return new IconData(57708, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DeliveryDining() {
    return new IconData(60018, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DensityLarge() {
    return new IconData(60329, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DensityMedium() {
    return new IconData(60318, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DensitySmall() {
    return new IconData(60328, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DepartureBoard() {
    return new IconData(58742, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Description() {
    return new IconData(59507, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Deselect() {
    return new IconData(60342, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DesignServices() {
    return new IconData(61706, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DesktopAccessDisabled() {
    return new IconData(59805, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DesktopMac() {
    return new IconData(58123, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DesktopWindows() {
    return new IconData(58124, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Details() {
    return new IconData(58312, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DeveloperBoard() {
    return new IconData(58125, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DeveloperBoardOff() {
    return new IconData(58623, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DeveloperMode() {
    return new IconData(57776, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DeviceHub() {
    return new IconData(58165, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DeviceThermostat() {
    return new IconData(57855, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DeviceUnknown() {
    return new IconData(58169, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Devices() {
    return new IconData(57777, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DevicesFold() {
    return new IconData(60382, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DevicesOther() {
    return new IconData(58167, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DialerSip() {
    return new IconData(57531, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Dialpad() {
    return new IconData(57532, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Diamond() {
    return new IconData(60117, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Difference() {
    return new IconData(60285, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Dining() {
    return new IconData(61428, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DinnerDining() {
    return new IconData(59991, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Directions() {
    return new IconData(58670, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsBike() {
    return new IconData(58671, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsBoat() {
    return new IconData(58674, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsBoatFilled() {
    return new IconData(61429, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsBus() {
    return new IconData(58672, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsBusFilled() {
    return new IconData(61430, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsCar() {
    return new IconData(58673, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsCarFilled() {
    return new IconData(61431, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsFerry() {
    return new IconData(58674, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsOff() {
    return new IconData(61711, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsRailway() {
    return new IconData(58676, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsRailwayFilled() {
    return new IconData(61432, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsRun() {
    return new IconData(58726, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsSubway() {
    return new IconData(58675, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsSubwayFilled() {
    return new IconData(61433, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsTrain() {
    return new IconData(58676, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsTransit() {
    return new IconData(58677, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsTransitFilled() {
    return new IconData(61434, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirectionsWalk() {
    return new IconData(58678, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DirtyLens() {
    return new IconData(61259, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DisabledByDefault() {
    return new IconData(62e3, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DisabledVisible() {
    return new IconData(59246, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DiscFull() {
    return new IconData(58896, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Discord() {
    return new IconData(60012, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Discount() {
    return new IconData(60361, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DisplaySettings() {
    return new IconData(60311, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DndForwardslash() {
    return new IconData(58897, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Dns() {
    return new IconData(59509, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoDisturb() {
    return new IconData(61580, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoDisturbAlt() {
    return new IconData(61581, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoDisturbOff() {
    return new IconData(61582, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoDisturbOn() {
    return new IconData(61583, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoNotDisturb() {
    return new IconData(58898, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoNotDisturbAlt() {
    return new IconData(58897, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoNotDisturbOff() {
    return new IconData(58947, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoNotDisturbOn() {
    return new IconData(58948, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoNotDisturbOnTotalSilence() {
    return new IconData(61435, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoNotStep() {
    return new IconData(61855, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoNotTouch() {
    return new IconData(61872, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Dock() {
    return new IconData(58126, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DocumentScanner() {
    return new IconData(58874, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Domain() {
    return new IconData(59374, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DomainAdd() {
    return new IconData(60258, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DomainDisabled() {
    return new IconData(57583, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DomainVerification() {
    return new IconData(61260, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Done() {
    return new IconData(59510, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoneAll() {
    return new IconData(59511, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoneOutline() {
    return new IconData(59695, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DonutLarge() {
    return new IconData(59671, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DonutSmall() {
    return new IconData(59672, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoorBack() {
    return new IconData(61436, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoorFront() {
    return new IconData(61437, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoorSliding() {
    return new IconData(61438, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Doorbell() {
    return new IconData(61439, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DoubleArrow() {
    return new IconData(59984, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DownhillSkiing() {
    return new IconData(58633, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Download() {
    return new IconData(61584, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DownloadDone() {
    return new IconData(61585, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DownloadForOffline() {
    return new IconData(61440, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Downloading() {
    return new IconData(61441, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Drafts() {
    return new IconData(57681, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DragHandle() {
    return new IconData(57949, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DragIndicator() {
    return new IconData(59717, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Draw() {
    return new IconData(59206, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DriveEta() {
    return new IconData(58899, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DriveFileMove() {
    return new IconData(58997, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DriveFileMoveOutline() {
    return new IconData(59809, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DriveFileMoveRtl() {
    return new IconData(59245, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DriveFileRenameOutline() {
    return new IconData(59810, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DriveFolderUpload() {
    return new IconData(59811, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Dry() {
    return new IconData(61875, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DryCleaning() {
    return new IconData(59992, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Duo() {
    return new IconData(59813, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Dvr() {
    return new IconData(57778, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DynamicFeed() {
    return new IconData(59924, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get DynamicForm() {
    return new IconData(61887, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EMobiledata() {
    return new IconData(61442, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Earbuds() {
    return new IconData(61443, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EarbudsBattery() {
    return new IconData(61444, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get East() {
    return new IconData(61919, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Eco() {
    return new IconData(59957, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EdgesensorHigh() {
    return new IconData(61445, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EdgesensorLow() {
    return new IconData(61446, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Edit() {
    return new IconData(58313, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EditAttributes() {
    return new IconData(58744, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EditCalendar() {
    return new IconData(59202, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EditLocation() {
    return new IconData(58728, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EditLocationAlt() {
    return new IconData(57797, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EditNote() {
    return new IconData(59205, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EditNotifications() {
    return new IconData(58661, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EditOff() {
    return new IconData(59728, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EditRoad() {
    return new IconData(61261, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Egg() {
    return new IconData(60108, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EggAlt() {
    return new IconData(60104, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Eject() {
    return new IconData(59643, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Elderly() {
    return new IconData(61978, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ElderlyWoman() {
    return new IconData(60265, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ElectricBike() {
    return new IconData(60187, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ElectricCar() {
    return new IconData(60188, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ElectricMoped() {
    return new IconData(60189, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ElectricRickshaw() {
    return new IconData(60190, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ElectricScooter() {
    return new IconData(60191, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ElectricalServices() {
    return new IconData(61698, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Elevator() {
    return new IconData(61856, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Email() {
    return new IconData(57534, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Emergency() {
    return new IconData(57835, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EmergencyRecording() {
    return new IconData(60404, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EmergencyShare() {
    return new IconData(60406, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EmojiEmotions() {
    return new IconData(59938, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EmojiEvents() {
    return new IconData(59939, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EmojiFlags() {
    return new IconData(59930, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EmojiFoodBeverage() {
    return new IconData(59931, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EmojiNature() {
    return new IconData(59932, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EmojiObjects() {
    return new IconData(59940, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EmojiPeople() {
    return new IconData(59933, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EmojiSymbols() {
    return new IconData(59934, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EmojiTransportation() {
    return new IconData(59935, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Engineering() {
    return new IconData(59965, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EnhancePhotoTranslate() {
    return new IconData(59644, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EnhancedEncryption() {
    return new IconData(58943, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Equalizer() {
    return new IconData(57373, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Error() {
    return new IconData(57344, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ErrorOutline() {
    return new IconData(57345, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Escalator() {
    return new IconData(61857, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EscalatorWarning() {
    return new IconData(61868, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Euro() {
    return new IconData(59925, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EuroSymbol() {
    return new IconData(59686, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EvStation() {
    return new IconData(58733, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Event() {
    return new IconData(59512, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EventAvailable() {
    return new IconData(58900, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EventBusy() {
    return new IconData(58901, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EventNote() {
    return new IconData(58902, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EventRepeat() {
    return new IconData(60283, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get EventSeat() {
    return new IconData(59651, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ExitToApp() {
    return new IconData(59513, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Expand() {
    return new IconData(59727, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ExpandCircleDown() {
    return new IconData(59341, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ExpandLess() {
    return new IconData(58830, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ExpandMore() {
    return new IconData(58831, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Explicit() {
    return new IconData(57374, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Explore() {
    return new IconData(59514, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ExploreOff() {
    return new IconData(59816, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Exposure() {
    return new IconData(58314, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ExposureMinus1() {
    return new IconData(58315, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ExposureMinus2() {
    return new IconData(58316, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ExposureNeg1() {
    return new IconData(58315, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ExposureNeg2() {
    return new IconData(58316, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ExposurePlus1() {
    return new IconData(58317, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ExposurePlus2() {
    return new IconData(58318, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ExposureZero() {
    return new IconData(58319, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Extension() {
    return new IconData(59515, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ExtensionOff() {
    return new IconData(58613, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Face() {
    return new IconData(59516, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FaceRetouchingNatural() {
    return new IconData(61262, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FaceRetouchingOff() {
    return new IconData(61447, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Facebook() {
    return new IconData(62004, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FactCheck() {
    return new IconData(61637, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Factory() {
    return new IconData(60348, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FamilyRestroom() {
    return new IconData(61858, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FastForward() {
    return new IconData(57375, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FastRewind() {
    return new IconData(57376, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Fastfood() {
    return new IconData(58746, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Favorite() {
    return new IconData(59517, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FavoriteBorder() {
    return new IconData(59518, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FavoriteOutline() {
    return new IconData(59518, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Fax() {
    return new IconData(60120, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FeaturedPlayList() {
    return new IconData(57453, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FeaturedVideo() {
    return new IconData(57454, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Feed() {
    return new IconData(61449, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Feedback() {
    return new IconData(59519, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Female() {
    return new IconData(58768, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Fence() {
    return new IconData(61942, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Festival() {
    return new IconData(60008, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FiberDvr() {
    return new IconData(57437, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FiberManualRecord() {
    return new IconData(57441, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FiberNew() {
    return new IconData(57438, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FiberPin() {
    return new IconData(57450, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FiberSmartRecord() {
    return new IconData(57442, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FileCopy() {
    return new IconData(57715, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FileDownload() {
    return new IconData(58052, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FileDownloadDone() {
    return new IconData(59818, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FileDownloadOff() {
    return new IconData(58622, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FileOpen() {
    return new IconData(60147, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FilePresent() {
    return new IconData(59918, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FileUpload() {
    return new IconData(58054, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Filter() {
    return new IconData(58323, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Filter1() {
    return new IconData(58320, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Filter2() {
    return new IconData(58321, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Filter3() {
    return new IconData(58322, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Filter4() {
    return new IconData(58324, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Filter5() {
    return new IconData(58325, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Filter6() {
    return new IconData(58326, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Filter7() {
    return new IconData(58327, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Filter8() {
    return new IconData(58328, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Filter9() {
    return new IconData(58329, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Filter9Plus() {
    return new IconData(58330, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FilterAlt() {
    return new IconData(61263, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FilterAltOff() {
    return new IconData(60210, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FilterBAndW() {
    return new IconData(58331, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FilterCenterFocus() {
    return new IconData(58332, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FilterDrama() {
    return new IconData(58333, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FilterFrames() {
    return new IconData(58334, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FilterHdr() {
    return new IconData(58335, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FilterList() {
    return new IconData(57682, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FilterListAlt() {
    return new IconData(59726, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FilterListOff() {
    return new IconData(60247, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FilterNone() {
    return new IconData(58336, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FilterTiltShift() {
    return new IconData(58338, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FilterVintage() {
    return new IconData(58339, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FindInPage() {
    return new IconData(59520, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FindReplace() {
    return new IconData(59521, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Fingerprint() {
    return new IconData(59661, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FireExtinguisher() {
    return new IconData(61912, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FireHydrant() {
    return new IconData(61859, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Fireplace() {
    return new IconData(59971, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FirstPage() {
    return new IconData(58844, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FitScreen() {
    return new IconData(59920, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Fitbit() {
    return new IconData(59435, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FitnessCenter() {
    return new IconData(60227, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Flag() {
    return new IconData(57683, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FlagCircle() {
    return new IconData(60152, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Flaky() {
    return new IconData(61264, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Flare() {
    return new IconData(58340, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FlashAuto() {
    return new IconData(58341, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FlashOff() {
    return new IconData(58342, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FlashOn() {
    return new IconData(58343, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FlashlightOff() {
    return new IconData(61450, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FlashlightOn() {
    return new IconData(61451, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Flatware() {
    return new IconData(61452, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Flight() {
    return new IconData(58681, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FlightClass() {
    return new IconData(59339, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FlightLand() {
    return new IconData(59652, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FlightTakeoff() {
    return new IconData(59653, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Flip() {
    return new IconData(58344, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FlipCameraAndroid() {
    return new IconData(59959, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FlipCameraIos() {
    return new IconData(59960, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FlipToBack() {
    return new IconData(59522, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FlipToFront() {
    return new IconData(59523, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Flood() {
    return new IconData(60390, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Flourescent() {
    return new IconData(61453, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FlutterDash() {
    return new IconData(57355, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FmdBad() {
    return new IconData(61454, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FmdGood() {
    return new IconData(61455, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Foggy() {
    return new IconData(59416, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Folder() {
    return new IconData(58055, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FolderCopy() {
    return new IconData(60349, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FolderDelete() {
    return new IconData(60212, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FolderOff() {
    return new IconData(60291, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FolderOpen() {
    return new IconData(58056, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FolderShared() {
    return new IconData(58057, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FolderSpecial() {
    return new IconData(58903, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FolderZip() {
    return new IconData(60204, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FollowTheSigns() {
    return new IconData(61986, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FontDownload() {
    return new IconData(57703, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FontDownloadOff() {
    return new IconData(58617, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FoodBank() {
    return new IconData(61938, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Forest() {
    return new IconData(60057, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ForkLeft() {
    return new IconData(60320, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ForkRight() {
    return new IconData(60332, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatAlignCenter() {
    return new IconData(57908, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatAlignJustify() {
    return new IconData(57909, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatAlignLeft() {
    return new IconData(57910, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatAlignRight() {
    return new IconData(57911, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatBold() {
    return new IconData(57912, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatClear() {
    return new IconData(57913, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatColorFill() {
    return new IconData(57914, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatColorReset() {
    return new IconData(57915, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatColorText() {
    return new IconData(57916, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatIndentDecrease() {
    return new IconData(57917, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatIndentIncrease() {
    return new IconData(57918, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatItalic() {
    return new IconData(57919, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatLineSpacing() {
    return new IconData(57920, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatListBulleted() {
    return new IconData(57921, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatListNumbered() {
    return new IconData(57922, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatListNumberedRtl() {
    return new IconData(57959, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatOverline() {
    return new IconData(60261, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatPaint() {
    return new IconData(57923, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatQuote() {
    return new IconData(57924, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatShapes() {
    return new IconData(57950, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatSize() {
    return new IconData(57925, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatStrikethrough() {
    return new IconData(57926, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatTextdirectionLToR() {
    return new IconData(57927, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatTextdirectionRToL() {
    return new IconData(57928, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatUnderline() {
    return new IconData(57929, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FormatUnderlined() {
    return new IconData(57929, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Fort() {
    return new IconData(60077, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Forum() {
    return new IconData(57535, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Forward() {
    return new IconData(57684, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Forward10() {
    return new IconData(57430, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Forward30() {
    return new IconData(57431, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Forward5() {
    return new IconData(57432, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ForwardToInbox() {
    return new IconData(61831, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Foundation() {
    return new IconData(61952, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FreeBreakfast() {
    return new IconData(60228, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FreeCancellation() {
    return new IconData(59208, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FrontHand() {
    return new IconData(59241, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Fullscreen() {
    return new IconData(58832, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get FullscreenExit() {
    return new IconData(58833, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Functions() {
    return new IconData(57930, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GMobiledata() {
    return new IconData(61456, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GTranslate() {
    return new IconData(59687, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Gamepad() {
    return new IconData(58127, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Games() {
    return new IconData(57377, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Garage() {
    return new IconData(61457, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Gavel() {
    return new IconData(59662, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GeneratingTokens() {
    return new IconData(59209, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Gesture() {
    return new IconData(57685, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GetApp() {
    return new IconData(59524, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Gif() {
    return new IconData(59656, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GifBox() {
    return new IconData(59299, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Girl() {
    return new IconData(60264, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Gite() {
    return new IconData(58763, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Goat() {
    return new IconData(1114109, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GolfCourse() {
    return new IconData(60229, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GppBad() {
    return new IconData(61458, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GppGood() {
    return new IconData(61459, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GppMaybe() {
    return new IconData(61460, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GpsFixed() {
    return new IconData(57779, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GpsNotFixed() {
    return new IconData(57780, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GpsOff() {
    return new IconData(57781, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Grade() {
    return new IconData(59525, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Gradient() {
    return new IconData(58345, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Grading() {
    return new IconData(59983, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Grain() {
    return new IconData(58346, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GraphicEq() {
    return new IconData(57784, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Grass() {
    return new IconData(61957, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Grid3x3() {
    return new IconData(61461, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Grid4x4() {
    return new IconData(61462, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GridGoldenratio() {
    return new IconData(61463, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GridOff() {
    return new IconData(58347, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GridOn() {
    return new IconData(58348, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GridView() {
    return new IconData(59824, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Group() {
    return new IconData(59375, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GroupAdd() {
    return new IconData(59376, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GroupOff() {
    return new IconData(59207, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GroupRemove() {
    return new IconData(59309, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get GroupWork() {
    return new IconData(59526, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Groups() {
    return new IconData(62003, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HMobiledata() {
    return new IconData(61464, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HPlusMobiledata() {
    return new IconData(61465, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Hail() {
    return new IconData(59825, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Handshake() {
    return new IconData(60363, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Handyman() {
    return new IconData(61707, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Hardware() {
    return new IconData(59993, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Hd() {
    return new IconData(57426, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HdrAuto() {
    return new IconData(61466, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HdrAutoSelect() {
    return new IconData(61467, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HdrEnhancedSelect() {
    return new IconData(61265, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HdrOff() {
    return new IconData(58349, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HdrOffSelect() {
    return new IconData(61468, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HdrOn() {
    return new IconData(58350, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HdrOnSelect() {
    return new IconData(61469, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HdrPlus() {
    return new IconData(61470, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HdrStrong() {
    return new IconData(58353, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HdrWeak() {
    return new IconData(58354, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Headphones() {
    return new IconData(61471, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HeadphonesBattery() {
    return new IconData(61472, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Headset() {
    return new IconData(58128, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HeadsetMic() {
    return new IconData(58129, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HeadsetOff() {
    return new IconData(58170, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Healing() {
    return new IconData(58355, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HealthAndSafety() {
    return new IconData(57813, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Hearing() {
    return new IconData(57379, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HearingDisabled() {
    return new IconData(61700, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HeartBroken() {
    return new IconData(60098, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Height() {
    return new IconData(59926, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Help() {
    return new IconData(59527, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HelpCenter() {
    return new IconData(61888, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HelpOutline() {
    return new IconData(59645, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Hevc() {
    return new IconData(61473, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Hexagon() {
    return new IconData(60217, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HideImage() {
    return new IconData(61474, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HideSource() {
    return new IconData(61475, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HighQuality() {
    return new IconData(57380, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Highlight() {
    return new IconData(57951, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HighlightAlt() {
    return new IconData(61266, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HighlightOff() {
    return new IconData(59528, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HighlightRemove() {
    return new IconData(59528, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Hiking() {
    return new IconData(58634, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get History() {
    return new IconData(59529, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HistoryEdu() {
    return new IconData(59966, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HistoryToggleOff() {
    return new IconData(61821, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Hive() {
    return new IconData(60070, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Hls() {
    return new IconData(60298, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HlsOff() {
    return new IconData(60300, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HolidayVillage() {
    return new IconData(58762, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Home() {
    return new IconData(59530, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HomeFilled() {
    return new IconData(59826, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HomeMax() {
    return new IconData(61476, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HomeMini() {
    return new IconData(61477, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HomeRepairService() {
    return new IconData(61696, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HomeWork() {
    return new IconData(59913, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HorizontalDistribute() {
    return new IconData(57364, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HorizontalRule() {
    return new IconData(61704, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HorizontalSplit() {
    return new IconData(59719, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HotTub() {
    return new IconData(60230, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Hotel() {
    return new IconData(58682, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HotelClass() {
    return new IconData(59203, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HourglassBottom() {
    return new IconData(59996, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HourglassDisabled() {
    return new IconData(61267, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HourglassEmpty() {
    return new IconData(59531, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HourglassFull() {
    return new IconData(59532, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HourglassTop() {
    return new IconData(59995, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get House() {
    return new IconData(59972, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HouseSiding() {
    return new IconData(61954, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Houseboat() {
    return new IconData(58756, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HowToReg() {
    return new IconData(57716, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get HowToVote() {
    return new IconData(57717, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Html() {
    return new IconData(60286, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Http() {
    return new IconData(59650, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Https() {
    return new IconData(59533, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Hub() {
    return new IconData(59892, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Hvac() {
    return new IconData(61710, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get IceSkating() {
    return new IconData(58635, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Icecream() {
    return new IconData(60009, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Image() {
    return new IconData(58356, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ImageAspectRatio() {
    return new IconData(58357, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ImageNotSupported() {
    return new IconData(61718, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ImageSearch() {
    return new IconData(58431, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ImagesearchRoller() {
    return new IconData(59828, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ImportContacts() {
    return new IconData(57568, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ImportExport() {
    return new IconData(57539, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ImportantDevices() {
    return new IconData(59666, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Inbox() {
    return new IconData(57686, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get IncompleteCircle() {
    return new IconData(59291, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get IndeterminateCheckBox() {
    return new IconData(59657, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Info() {
    return new IconData(59534, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get InfoOutline() {
    return new IconData(59535, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Input() {
    return new IconData(59536, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get InsertChart() {
    return new IconData(57931, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get InsertChartOutlined() {
    return new IconData(57962, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get InsertComment() {
    return new IconData(57932, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get InsertDriveFile() {
    return new IconData(57933, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get InsertEmoticon() {
    return new IconData(57934, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get InsertInvitation() {
    return new IconData(57935, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get InsertLink() {
    return new IconData(57936, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get InsertPageBreak() {
    return new IconData(60106, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get InsertPhoto() {
    return new IconData(57937, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Insights() {
    return new IconData(61586, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get InstallDesktop() {
    return new IconData(60273, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get InstallMobile() {
    return new IconData(60274, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get IntegrationInstructions() {
    return new IconData(61268, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Interests() {
    return new IconData(59336, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get InterpreterMode() {
    return new IconData(59451, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Inventory() {
    return new IconData(57721, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Inventory2() {
    return new IconData(57761, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get InvertColors() {
    return new IconData(59537, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get InvertColorsOff() {
    return new IconData(57540, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get InvertColorsOn() {
    return new IconData(59537, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get IosShare() {
    return new IconData(59064, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Iron() {
    return new IconData(58755, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Iso() {
    return new IconData(58358, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Javascript() {
    return new IconData(60284, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get JoinFull() {
    return new IconData(60139, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get JoinInner() {
    return new IconData(60148, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get JoinLeft() {
    return new IconData(60146, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get JoinRight() {
    return new IconData(60138, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Kayaking() {
    return new IconData(58636, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KebabDining() {
    return new IconData(59458, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Key() {
    return new IconData(59196, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyOff() {
    return new IconData(60292, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Keyboard() {
    return new IconData(58130, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardAlt() {
    return new IconData(61480, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardArrowDown() {
    return new IconData(58131, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardArrowLeft() {
    return new IconData(58132, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardArrowRight() {
    return new IconData(58133, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardArrowUp() {
    return new IconData(58134, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardBackspace() {
    return new IconData(58135, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardCapslock() {
    return new IconData(58136, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardCommand() {
    return new IconData(60128, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardCommandKey() {
    return new IconData(60135, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardControl() {
    return new IconData(58835, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardControlKey() {
    return new IconData(60134, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardDoubleArrowDown() {
    return new IconData(60112, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardDoubleArrowLeft() {
    return new IconData(60099, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardDoubleArrowRight() {
    return new IconData(60105, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardDoubleArrowUp() {
    return new IconData(60111, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardHide() {
    return new IconData(58138, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardOption() {
    return new IconData(60127, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardOptionKey() {
    return new IconData(60136, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardReturn() {
    return new IconData(58139, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardTab() {
    return new IconData(58140, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KeyboardVoice() {
    return new IconData(58141, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get KingBed() {
    return new IconData(59973, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Kitchen() {
    return new IconData(60231, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Kitesurfing() {
    return new IconData(58637, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Label() {
    return new IconData(59538, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LabelImportant() {
    return new IconData(59703, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LabelImportantOutline() {
    return new IconData(59720, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LabelOff() {
    return new IconData(59830, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LabelOutline() {
    return new IconData(59539, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Lan() {
    return new IconData(60207, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Landscape() {
    return new IconData(58359, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Landslide() {
    return new IconData(60375, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Language() {
    return new IconData(59540, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Laptop() {
    return new IconData(58142, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LaptopChromebook() {
    return new IconData(58143, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LaptopMac() {
    return new IconData(58144, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LaptopWindows() {
    return new IconData(58145, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LastPage() {
    return new IconData(58845, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Launch() {
    return new IconData(59541, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Layers() {
    return new IconData(58683, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LayersClear() {
    return new IconData(58684, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Leaderboard() {
    return new IconData(61964, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LeakAdd() {
    return new IconData(58360, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LeakRemove() {
    return new IconData(58361, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LeaveBagsAtHome() {
    return new IconData(61979, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LegendToggle() {
    return new IconData(61723, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Lens() {
    return new IconData(58362, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LensBlur() {
    return new IconData(61481, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LibraryAdd() {
    return new IconData(57390, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LibraryAddCheck() {
    return new IconData(59831, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LibraryBooks() {
    return new IconData(57391, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LibraryMusic() {
    return new IconData(57392, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Light() {
    return new IconData(61482, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LightMode() {
    return new IconData(58648, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Lightbulb() {
    return new IconData(57584, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LightbulbOutline() {
    return new IconData(59663, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LineAxis() {
    return new IconData(60058, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LineStyle() {
    return new IconData(59673, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LineWeight() {
    return new IconData(59674, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LinearScale() {
    return new IconData(57952, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Link() {
    return new IconData(57687, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LinkOff() {
    return new IconData(57711, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LinkedCamera() {
    return new IconData(58424, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Liquor() {
    return new IconData(6e4, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get List() {
    return new IconData(59542, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ListAlt() {
    return new IconData(57582, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LiveHelp() {
    return new IconData(57542, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LiveTv() {
    return new IconData(58937, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Living() {
    return new IconData(61483, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalActivity() {
    return new IconData(58687, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalAirport() {
    return new IconData(58685, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalAtm() {
    return new IconData(58686, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalAttraction() {
    return new IconData(58687, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalBar() {
    return new IconData(58688, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalCafe() {
    return new IconData(58689, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalCarWash() {
    return new IconData(58690, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalConvenienceStore() {
    return new IconData(58691, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalDining() {
    return new IconData(58710, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalDrink() {
    return new IconData(58692, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalFireDepartment() {
    return new IconData(61269, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalFlorist() {
    return new IconData(58693, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalGasStation() {
    return new IconData(58694, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalGroceryStore() {
    return new IconData(58695, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalHospital() {
    return new IconData(58696, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalHotel() {
    return new IconData(58697, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalLaundryService() {
    return new IconData(58698, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalLibrary() {
    return new IconData(58699, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalMall() {
    return new IconData(58700, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalMovies() {
    return new IconData(58701, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalOffer() {
    return new IconData(58702, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalParking() {
    return new IconData(58703, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalPharmacy() {
    return new IconData(58704, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalPhone() {
    return new IconData(58705, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalPizza() {
    return new IconData(58706, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalPlay() {
    return new IconData(58707, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalPolice() {
    return new IconData(61270, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalPostOffice() {
    return new IconData(58708, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalPrintShop() {
    return new IconData(58709, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalPrintshop() {
    return new IconData(58709, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalRestaurant() {
    return new IconData(58710, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalSee() {
    return new IconData(58711, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalShipping() {
    return new IconData(58712, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocalTaxi() {
    return new IconData(58713, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocationCity() {
    return new IconData(59377, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocationDisabled() {
    return new IconData(57782, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocationHistory() {
    return new IconData(58714, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocationOff() {
    return new IconData(57543, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocationOn() {
    return new IconData(57544, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocationPin() {
    return new IconData(61915, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LocationSearching() {
    return new IconData(57783, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Lock() {
    return new IconData(59543, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LockClock() {
    return new IconData(61271, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LockOpen() {
    return new IconData(59544, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LockOutline() {
    return new IconData(59545, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LockReset() {
    return new IconData(60126, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Login() {
    return new IconData(60023, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LogoDev() {
    return new IconData(60118, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Logout() {
    return new IconData(59834, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Looks() {
    return new IconData(58364, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Looks3() {
    return new IconData(58363, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Looks4() {
    return new IconData(58365, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Looks5() {
    return new IconData(58366, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Looks6() {
    return new IconData(58367, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LooksOne() {
    return new IconData(58368, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LooksTwo() {
    return new IconData(58369, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Loop() {
    return new IconData(57384, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Loupe() {
    return new IconData(58370, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LowPriority() {
    return new IconData(57709, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Loyalty() {
    return new IconData(59546, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LteMobiledata() {
    return new IconData(61484, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LtePlusMobiledata() {
    return new IconData(61485, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Luggage() {
    return new IconData(62005, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get LunchDining() {
    return new IconData(60001, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Mail() {
    return new IconData(57688, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MailOutline() {
    return new IconData(57569, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Male() {
    return new IconData(58766, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Man() {
    return new IconData(58603, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ManageAccounts() {
    return new IconData(61486, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ManageHistory() {
    return new IconData(60391, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ManageSearch() {
    return new IconData(61487, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Map() {
    return new IconData(58715, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MapsHomeWork() {
    return new IconData(61488, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MapsUgc() {
    return new IconData(61272, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Margin() {
    return new IconData(59835, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MarkAsUnread() {
    return new IconData(59836, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MarkChatRead() {
    return new IconData(61835, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MarkChatUnread() {
    return new IconData(61833, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MarkEmailRead() {
    return new IconData(61836, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MarkEmailUnread() {
    return new IconData(61834, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MarkUnreadChatAlt() {
    return new IconData(60317, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Markunread() {
    return new IconData(57689, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MarkunreadMailbox() {
    return new IconData(59547, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Masks() {
    return new IconData(61976, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Maximize() {
    return new IconData(59696, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MediaBluetoothOff() {
    return new IconData(61489, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MediaBluetoothOn() {
    return new IconData(61490, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Mediation() {
    return new IconData(61351, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MedicalInformation() {
    return new IconData(60397, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MedicalServices() {
    return new IconData(61705, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Medication() {
    return new IconData(61491, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MedicationLiquid() {
    return new IconData(60039, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MeetingRoom() {
    return new IconData(60239, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Memory() {
    return new IconData(58146, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Menu() {
    return new IconData(58834, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MenuBook() {
    return new IconData(59929, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MenuOpen() {
    return new IconData(59837, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Merge() {
    return new IconData(60312, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MergeType() {
    return new IconData(57938, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Message() {
    return new IconData(57545, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Messenger() {
    return new IconData(57546, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MessengerOutline() {
    return new IconData(57547, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Mic() {
    return new IconData(57385, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MicExternalOff() {
    return new IconData(61273, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MicExternalOn() {
    return new IconData(61274, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MicNone() {
    return new IconData(57386, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MicOff() {
    return new IconData(57387, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Microwave() {
    return new IconData(61956, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MilitaryTech() {
    return new IconData(59967, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Minimize() {
    return new IconData(59697, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MinorCrash() {
    return new IconData(60401, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MiscellaneousServices() {
    return new IconData(61708, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MissedVideoCall() {
    return new IconData(57459, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Mms() {
    return new IconData(58904, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MobileFriendly() {
    return new IconData(57856, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MobileOff() {
    return new IconData(57857, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MobileScreenShare() {
    return new IconData(57575, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MobiledataOff() {
    return new IconData(61492, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Mode() {
    return new IconData(61591, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ModeComment() {
    return new IconData(57939, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ModeEdit() {
    return new IconData(57940, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ModeEditOutline() {
    return new IconData(61493, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ModeNight() {
    return new IconData(61494, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ModeOfTravel() {
    return new IconData(59342, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ModeStandby() {
    return new IconData(61495, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ModelTraining() {
    return new IconData(61647, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MonetizationOn() {
    return new IconData(57955, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Money() {
    return new IconData(58749, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MoneyOff() {
    return new IconData(57948, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MoneyOffCsred() {
    return new IconData(61496, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Monitor() {
    return new IconData(61275, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MonitorHeart() {
    return new IconData(60066, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MonitorWeight() {
    return new IconData(61497, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MonochromePhotos() {
    return new IconData(58371, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Mood() {
    return new IconData(59378, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MoodBad() {
    return new IconData(59379, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Moped() {
    return new IconData(60200, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get More() {
    return new IconData(58905, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MoreHoriz() {
    return new IconData(58835, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MoreTime() {
    return new IconData(59997, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MoreVert() {
    return new IconData(58836, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Mosque() {
    return new IconData(60082, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MotionPhotosAuto() {
    return new IconData(61498, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MotionPhotosOff() {
    return new IconData(59840, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MotionPhotosOn() {
    return new IconData(59841, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MotionPhotosPause() {
    return new IconData(61991, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MotionPhotosPaused() {
    return new IconData(59842, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Motorcycle() {
    return new IconData(59675, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Mouse() {
    return new IconData(58147, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MoveDown() {
    return new IconData(60257, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MoveToInbox() {
    return new IconData(57704, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MoveUp() {
    return new IconData(60260, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Movie() {
    return new IconData(57388, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MovieCreation() {
    return new IconData(58372, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MovieFilter() {
    return new IconData(58426, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Moving() {
    return new IconData(58625, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Mp() {
    return new IconData(59843, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MultilineChart() {
    return new IconData(59103, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MultipleStop() {
    return new IconData(61881, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MultitrackAudio() {
    return new IconData(57784, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Museum() {
    return new IconData(59958, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MusicNote() {
    return new IconData(58373, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MusicOff() {
    return new IconData(58432, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MusicVideo() {
    return new IconData(57443, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MyLibraryAdd() {
    return new IconData(57390, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MyLibraryBooks() {
    return new IconData(57391, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MyLibraryMusic() {
    return new IconData(57392, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get MyLocation() {
    return new IconData(58716, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Nat() {
    return new IconData(61276, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Nature() {
    return new IconData(58374, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NaturePeople() {
    return new IconData(58375, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NavigateBefore() {
    return new IconData(58376, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NavigateNext() {
    return new IconData(58377, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Navigation() {
    return new IconData(58717, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NearMe() {
    return new IconData(58729, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NearMeDisabled() {
    return new IconData(61935, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NearbyError() {
    return new IconData(61499, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NearbyOff() {
    return new IconData(61500, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NetworkCell() {
    return new IconData(57785, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NetworkCheck() {
    return new IconData(58944, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NetworkLocked() {
    return new IconData(58906, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NetworkPing() {
    return new IconData(60362, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NetworkWifi() {
    return new IconData(57786, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NetworkWifi1Bar() {
    return new IconData(60388, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NetworkWifi2Bar() {
    return new IconData(60374, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NetworkWifi3Bar() {
    return new IconData(60385, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NewLabel() {
    return new IconData(58889, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NewReleases() {
    return new IconData(57393, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Newspaper() {
    return new IconData(60289, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NextPlan() {
    return new IconData(61277, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NextWeek() {
    return new IconData(57706, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Nfc() {
    return new IconData(57787, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NightShelter() {
    return new IconData(61937, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Nightlife() {
    return new IconData(60002, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Nightlight() {
    return new IconData(61501, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NightlightRound() {
    return new IconData(61278, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NightsStay() {
    return new IconData(59974, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoAccounts() {
    return new IconData(61502, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoBackpack() {
    return new IconData(62007, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoCell() {
    return new IconData(61860, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoCrash() {
    return new IconData(60400, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoDrinks() {
    return new IconData(61861, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoEncryption() {
    return new IconData(58945, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoEncryptionGmailerrorred() {
    return new IconData(61503, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoFlash() {
    return new IconData(61862, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoFood() {
    return new IconData(61863, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoLuggage() {
    return new IconData(62011, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoMeals() {
    return new IconData(61910, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoMealsOuline() {
    return new IconData(61993, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoMeetingRoom() {
    return new IconData(60238, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoPhotography() {
    return new IconData(61864, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoSim() {
    return new IconData(57548, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoStroller() {
    return new IconData(61871, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoTransfer() {
    return new IconData(61909, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoiseAware() {
    return new IconData(60396, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoiseControlOff() {
    return new IconData(60403, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NordicWalking() {
    return new IconData(58638, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get North() {
    return new IconData(61920, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NorthEast() {
    return new IconData(61921, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NorthWest() {
    return new IconData(61922, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NotAccessible() {
    return new IconData(61694, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NotInterested() {
    return new IconData(57395, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NotListedLocation() {
    return new IconData(58741, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NotStarted() {
    return new IconData(61649, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Note() {
    return new IconData(57455, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoteAdd() {
    return new IconData(59548, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NoteAlt() {
    return new IconData(61504, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Notes() {
    return new IconData(57964, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NotificationAdd() {
    return new IconData(58265, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NotificationImportant() {
    return new IconData(57348, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Notifications() {
    return new IconData(59380, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NotificationsActive() {
    return new IconData(59383, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NotificationsNone() {
    return new IconData(59381, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NotificationsOff() {
    return new IconData(59382, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NotificationsOn() {
    return new IconData(59383, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NotificationsPaused() {
    return new IconData(59384, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NowWallpaper() {
    return new IconData(57788, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get NowWidgets() {
    return new IconData(57789, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Numbers() {
    return new IconData(60103, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get OfflineBolt() {
    return new IconData(59698, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get OfflinePin() {
    return new IconData(59658, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get OfflineShare() {
    return new IconData(59845, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get OndemandVideo() {
    return new IconData(58938, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get OnlinePrediction() {
    return new IconData(61675, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Opacity() {
    return new IconData(59676, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get OpenInBrowser() {
    return new IconData(59549, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get OpenInFull() {
    return new IconData(61902, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get OpenInNew() {
    return new IconData(59550, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get OpenInNewOff() {
    return new IconData(58614, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get OpenWith() {
    return new IconData(59551, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get OtherHouses() {
    return new IconData(58764, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Outbond() {
    return new IconData(61992, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Outbound() {
    return new IconData(57802, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Outbox() {
    return new IconData(61279, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get OutdoorGrill() {
    return new IconData(59975, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get OutgoingMail() {
    return new IconData(61650, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Outlet() {
    return new IconData(61908, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get OutlinedFlag() {
    return new IconData(57710, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Output() {
    return new IconData(60350, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Padding() {
    return new IconData(59848, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Pages() {
    return new IconData(59385, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Pageview() {
    return new IconData(59552, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Paid() {
    return new IconData(61505, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Palette() {
    return new IconData(58378, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PanTool() {
    return new IconData(59685, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PanToolAlt() {
    return new IconData(60345, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Panorama() {
    return new IconData(58379, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PanoramaFishEye() {
    return new IconData(58380, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PanoramaFisheye() {
    return new IconData(58380, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PanoramaHorizontal() {
    return new IconData(58381, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PanoramaHorizontalSelect() {
    return new IconData(61280, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PanoramaPhotosphere() {
    return new IconData(59849, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PanoramaPhotosphereSelect() {
    return new IconData(59850, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PanoramaVertical() {
    return new IconData(58382, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PanoramaVerticalSelect() {
    return new IconData(61281, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PanoramaWideAngle() {
    return new IconData(58383, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PanoramaWideAngleSelect() {
    return new IconData(61282, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Paragliding() {
    return new IconData(58639, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Park() {
    return new IconData(60003, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PartyMode() {
    return new IconData(59386, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Password() {
    return new IconData(61506, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Pattern() {
    return new IconData(61507, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Pause() {
    return new IconData(57396, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PauseCircle() {
    return new IconData(57762, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PauseCircleFilled() {
    return new IconData(57397, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PauseCircleOutline() {
    return new IconData(57398, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PausePresentation() {
    return new IconData(57578, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Payment() {
    return new IconData(59553, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Payments() {
    return new IconData(61283, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Paypal() {
    return new IconData(60045, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PedalBike() {
    return new IconData(60201, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Pending() {
    return new IconData(61284, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PendingActions() {
    return new IconData(61883, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Pentagon() {
    return new IconData(60240, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get People() {
    return new IconData(59387, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PeopleAlt() {
    return new IconData(59937, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PeopleOutline() {
    return new IconData(59388, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Percent() {
    return new IconData(60248, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PermCameraMic() {
    return new IconData(59554, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PermContactCal() {
    return new IconData(59555, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PermContactCalendar() {
    return new IconData(59555, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PermDataSetting() {
    return new IconData(59556, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PermDeviceInfo() {
    return new IconData(59557, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PermDeviceInformation() {
    return new IconData(59557, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PermIdentity() {
    return new IconData(59558, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PermMedia() {
    return new IconData(59559, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PermPhoneMsg() {
    return new IconData(59560, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PermScanWifi() {
    return new IconData(59561, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Person() {
    return new IconData(59389, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PersonAdd() {
    return new IconData(59390, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PersonAddAlt() {
    return new IconData(59981, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PersonAddAlt1() {
    return new IconData(61285, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PersonAddDisabled() {
    return new IconData(59851, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PersonOff() {
    return new IconData(58640, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PersonOutline() {
    return new IconData(59391, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PersonPin() {
    return new IconData(58714, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PersonPinCircle() {
    return new IconData(58730, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PersonRemove() {
    return new IconData(61286, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PersonRemoveAlt1() {
    return new IconData(61287, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PersonSearch() {
    return new IconData(61702, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PersonalInjury() {
    return new IconData(59098, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PersonalVideo() {
    return new IconData(58939, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PestControl() {
    return new IconData(61690, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PestControlRodent() {
    return new IconData(61693, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Pets() {
    return new IconData(59677, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Phishing() {
    return new IconData(60119, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Phone() {
    return new IconData(57549, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhoneAndroid() {
    return new IconData(58148, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhoneBluetoothSpeaker() {
    return new IconData(58907, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhoneCallback() {
    return new IconData(58953, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhoneDisabled() {
    return new IconData(59852, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhoneEnabled() {
    return new IconData(59853, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhoneForwarded() {
    return new IconData(58908, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhoneInTalk() {
    return new IconData(58909, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhoneIphone() {
    return new IconData(58149, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhoneLocked() {
    return new IconData(58910, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhoneMissed() {
    return new IconData(58911, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhonePaused() {
    return new IconData(58912, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Phonelink() {
    return new IconData(58150, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhonelinkErase() {
    return new IconData(57563, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhonelinkLock() {
    return new IconData(57564, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhonelinkOff() {
    return new IconData(58151, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhonelinkRing() {
    return new IconData(57565, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhonelinkSetup() {
    return new IconData(57566, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Photo() {
    return new IconData(58384, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhotoAlbum() {
    return new IconData(58385, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhotoCamera() {
    return new IconData(58386, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhotoCameraBack() {
    return new IconData(61288, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhotoCameraFront() {
    return new IconData(61289, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhotoFilter() {
    return new IconData(58427, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhotoLibrary() {
    return new IconData(58387, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhotoSizeSelectActual() {
    return new IconData(58418, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhotoSizeSelectLarge() {
    return new IconData(58419, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PhotoSizeSelectSmall() {
    return new IconData(58420, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Php() {
    return new IconData(60303, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Piano() {
    return new IconData(58657, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PianoOff() {
    return new IconData(58656, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PictureAsPdf() {
    return new IconData(58389, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PictureInPicture() {
    return new IconData(59562, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PictureInPictureAlt() {
    return new IconData(59665, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PieChart() {
    return new IconData(59076, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PieChartOutline() {
    return new IconData(61508, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PieChartOutlined() {
    return new IconData(59077, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Pin() {
    return new IconData(61509, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PinDrop() {
    return new IconData(58718, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PinEnd() {
    return new IconData(59239, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PinInvoke() {
    return new IconData(59235, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Pinch() {
    return new IconData(60216, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PivotTableChart() {
    return new IconData(59854, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Pix() {
    return new IconData(60067, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Place() {
    return new IconData(58719, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Plagiarism() {
    return new IconData(59994, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PlayArrow() {
    return new IconData(57399, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PlayCircle() {
    return new IconData(57796, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PlayCircleFill() {
    return new IconData(57400, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PlayCircleFilled() {
    return new IconData(57400, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PlayCircleOutline() {
    return new IconData(57401, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PlayDisabled() {
    return new IconData(61290, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PlayForWork() {
    return new IconData(59654, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PlayLesson() {
    return new IconData(61511, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PlaylistAdd() {
    return new IconData(57403, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PlaylistAddCheck() {
    return new IconData(57445, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PlaylistAddCheckCircle() {
    return new IconData(59366, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PlaylistAddCircle() {
    return new IconData(59365, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PlaylistPlay() {
    return new IconData(57439, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PlaylistRemove() {
    return new IconData(60288, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Plumbing() {
    return new IconData(61703, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PlusOne() {
    return new IconData(59392, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Podcasts() {
    return new IconData(61512, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PointOfSale() {
    return new IconData(61822, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Policy() {
    return new IconData(59927, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Poll() {
    return new IconData(59393, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Polyline() {
    return new IconData(60347, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Polymer() {
    return new IconData(59563, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Pool() {
    return new IconData(60232, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PortableWifiOff() {
    return new IconData(57550, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Portrait() {
    return new IconData(58390, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PostAdd() {
    return new IconData(59936, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Power() {
    return new IconData(58940, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PowerInput() {
    return new IconData(58166, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PowerOff() {
    return new IconData(58950, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PowerSettingsNew() {
    return new IconData(59564, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PrecisionManufacturing() {
    return new IconData(61513, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PregnantWoman() {
    return new IconData(59678, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PresentToAll() {
    return new IconData(57567, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Preview() {
    return new IconData(61893, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PriceChange() {
    return new IconData(61514, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PriceCheck() {
    return new IconData(61515, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Print() {
    return new IconData(59565, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PrintDisabled() {
    return new IconData(59855, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PriorityHigh() {
    return new IconData(58949, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PrivacyTip() {
    return new IconData(61660, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PrivateConnectivity() {
    return new IconData(59204, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ProductionQuantityLimits() {
    return new IconData(57809, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Psychology() {
    return new IconData(59978, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Public() {
    return new IconData(59403, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PublicOff() {
    return new IconData(61898, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Publish() {
    return new IconData(57941, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PublishedWithChanges() {
    return new IconData(62002, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PunchClock() {
    return new IconData(60072, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get PushPin() {
    return new IconData(61709, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get QrCode() {
    return new IconData(61291, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get QrCode2() {
    return new IconData(57354, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get QrCodeScanner() {
    return new IconData(61958, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get QueryBuilder() {
    return new IconData(59566, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get QueryStats() {
    return new IconData(58620, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get QuestionAnswer() {
    return new IconData(59567, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get QuestionMark() {
    return new IconData(60299, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Queue() {
    return new IconData(57404, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get QueueMusic() {
    return new IconData(57405, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get QueuePlayNext() {
    return new IconData(57446, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get QuickContactsDialer() {
    return new IconData(57551, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get QuickContactsMail() {
    return new IconData(57552, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Quickreply() {
    return new IconData(61292, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Quiz() {
    return new IconData(61516, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Quora() {
    return new IconData(60056, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RMobiledata() {
    return new IconData(61517, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Radar() {
    return new IconData(61518, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Radio() {
    return new IconData(57406, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RadioButtonChecked() {
    return new IconData(59447, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RadioButtonOff() {
    return new IconData(59446, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RadioButtonOn() {
    return new IconData(59447, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RadioButtonUnchecked() {
    return new IconData(59446, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RailwayAlert() {
    return new IconData(59857, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RamenDining() {
    return new IconData(60004, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RampLeft() {
    return new IconData(60316, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RampRight() {
    return new IconData(60310, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RateReview() {
    return new IconData(58720, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RawOff() {
    return new IconData(61519, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RawOn() {
    return new IconData(61520, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ReadMore() {
    return new IconData(61293, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RealEstateAgent() {
    return new IconData(59194, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Receipt() {
    return new IconData(59568, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ReceiptLong() {
    return new IconData(61294, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RecentActors() {
    return new IconData(57407, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Recommend() {
    return new IconData(59858, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RecordVoiceOver() {
    return new IconData(59679, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Rectangle() {
    return new IconData(60244, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Recycling() {
    return new IconData(59232, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Reddit() {
    return new IconData(60064, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Redeem() {
    return new IconData(59569, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Redo() {
    return new IconData(57690, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ReduceCapacity() {
    return new IconData(61980, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Refresh() {
    return new IconData(58837, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RememberMe() {
    return new IconData(61521, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Remove() {
    return new IconData(57691, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RemoveCircle() {
    return new IconData(57692, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RemoveCircleOutline() {
    return new IconData(57693, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RemoveDone() {
    return new IconData(59859, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RemoveFromQueue() {
    return new IconData(57447, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RemoveModerator() {
    return new IconData(59860, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RemoveRedEye() {
    return new IconData(58391, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RemoveShoppingCart() {
    return new IconData(59688, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Reorder() {
    return new IconData(59646, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Repeat() {
    return new IconData(57408, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RepeatOn() {
    return new IconData(59862, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RepeatOne() {
    return new IconData(57409, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RepeatOneOn() {
    return new IconData(59863, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Replay() {
    return new IconData(57410, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Replay10() {
    return new IconData(57433, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Replay30() {
    return new IconData(57434, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Replay5() {
    return new IconData(57435, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ReplayCircleFilled() {
    return new IconData(59864, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Reply() {
    return new IconData(57694, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ReplyAll() {
    return new IconData(57695, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Report() {
    return new IconData(57696, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ReportGmailerrorred() {
    return new IconData(61522, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ReportOff() {
    return new IconData(57712, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ReportProblem() {
    return new IconData(59570, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RequestPage() {
    return new IconData(61996, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RequestQuote() {
    return new IconData(61878, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ResetTv() {
    return new IconData(59865, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RestartAlt() {
    return new IconData(61523, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Restaurant() {
    return new IconData(58732, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RestaurantMenu() {
    return new IconData(58721, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Restore() {
    return new IconData(59571, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RestoreFromTrash() {
    return new IconData(59704, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RestorePage() {
    return new IconData(59689, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Reviews() {
    return new IconData(61524, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RiceBowl() {
    return new IconData(61941, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RingVolume() {
    return new IconData(57553, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Rocket() {
    return new IconData(60325, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RocketLaunch() {
    return new IconData(60315, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RollerSkating() {
    return new IconData(60365, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Roofing() {
    return new IconData(61953, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Room() {
    return new IconData(59572, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RoomPreferences() {
    return new IconData(61880, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RoomService() {
    return new IconData(60233, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Rotate90DegreesCcw() {
    return new IconData(58392, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Rotate90DegreesCw() {
    return new IconData(60075, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RotateLeft() {
    return new IconData(58393, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RotateRight() {
    return new IconData(58394, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RoundaboutLeft() {
    return new IconData(60313, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RoundaboutRight() {
    return new IconData(60323, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RoundedCorner() {
    return new IconData(59680, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Route() {
    return new IconData(60109, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Router() {
    return new IconData(58152, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Rowing() {
    return new IconData(59681, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RssFeed() {
    return new IconData(57573, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Rsvp() {
    return new IconData(61525, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Rtt() {
    return new IconData(59821, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Rule() {
    return new IconData(61890, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RuleFolder() {
    return new IconData(61897, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RunCircle() {
    return new IconData(61295, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RunningWithErrors() {
    return new IconData(58653, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get RvHookup() {
    return new IconData(58946, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SafetyCheck() {
    return new IconData(60399, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SafetyDivider() {
    return new IconData(57804, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Sailing() {
    return new IconData(58626, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Sanitizer() {
    return new IconData(61981, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Satellite() {
    return new IconData(58722, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SatelliteAlt() {
    return new IconData(60218, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Save() {
    return new IconData(57697, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SaveAlt() {
    return new IconData(57713, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SaveAs() {
    return new IconData(60256, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SavedSearch() {
    return new IconData(59921, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Savings() {
    return new IconData(58091, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Scale() {
    return new IconData(60255, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Scanner() {
    return new IconData(58153, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ScatterPlot() {
    return new IconData(57960, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Schedule() {
    return new IconData(59573, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ScheduleSend() {
    return new IconData(59914, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Schema() {
    return new IconData(58621, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get School() {
    return new IconData(59404, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Science() {
    return new IconData(59979, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Score() {
    return new IconData(57961, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Scoreboard() {
    return new IconData(60368, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ScreenLockLandscape() {
    return new IconData(57790, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ScreenLockPortrait() {
    return new IconData(57791, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ScreenLockRotation() {
    return new IconData(57792, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ScreenRotation() {
    return new IconData(57793, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ScreenRotationAlt() {
    return new IconData(60398, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ScreenSearchDesktop() {
    return new IconData(61296, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ScreenShare() {
    return new IconData(57570, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Screenshot() {
    return new IconData(61526, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ScubaDiving() {
    return new IconData(60366, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Sd() {
    return new IconData(59869, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SdCard() {
    return new IconData(58915, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SdCardAlert() {
    return new IconData(61527, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SdStorage() {
    return new IconData(57794, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Search() {
    return new IconData(59574, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SearchOff() {
    return new IconData(60022, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Security() {
    return new IconData(58154, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SecurityUpdate() {
    return new IconData(61528, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SecurityUpdateGood() {
    return new IconData(61529, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SecurityUpdateWarning() {
    return new IconData(61530, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Segment() {
    return new IconData(59723, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SelectAll() {
    return new IconData(57698, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SelfImprovement() {
    return new IconData(60024, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Sell() {
    return new IconData(61531, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Send() {
    return new IconData(57699, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SendAndArchive() {
    return new IconData(59916, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SendTimeExtension() {
    return new IconData(60123, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SendToMobile() {
    return new IconData(61532, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SensorDoor() {
    return new IconData(61877, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SensorWindow() {
    return new IconData(61876, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Sensors() {
    return new IconData(58654, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SensorsOff() {
    return new IconData(58655, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SentimentDissatisfied() {
    return new IconData(59409, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SentimentNeutral() {
    return new IconData(59410, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SentimentSatisfied() {
    return new IconData(59411, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SentimentSatisfiedAlt() {
    return new IconData(57581, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SentimentVeryDissatisfied() {
    return new IconData(59412, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SentimentVerySatisfied() {
    return new IconData(59413, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SetMeal() {
    return new IconData(61930, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Settings() {
    return new IconData(59576, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsAccessibility() {
    return new IconData(61533, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsApplications() {
    return new IconData(59577, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsBackupRestore() {
    return new IconData(59578, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsBluetooth() {
    return new IconData(59579, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsBrightness() {
    return new IconData(59581, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsCell() {
    return new IconData(59580, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsDisplay() {
    return new IconData(59581, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsEthernet() {
    return new IconData(59582, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsInputAntenna() {
    return new IconData(59583, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsInputComponent() {
    return new IconData(59584, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsInputComposite() {
    return new IconData(59585, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsInputHdmi() {
    return new IconData(59586, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsInputSvideo() {
    return new IconData(59587, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsOverscan() {
    return new IconData(59588, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsPhone() {
    return new IconData(59589, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsPower() {
    return new IconData(59590, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsRemote() {
    return new IconData(59591, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsSuggest() {
    return new IconData(61534, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsSystemDaydream() {
    return new IconData(57795, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SettingsVoice() {
    return new IconData(59592, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SevereCold() {
    return new IconData(60371, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Share() {
    return new IconData(59405, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ShareArrivalTime() {
    return new IconData(58660, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ShareLocation() {
    return new IconData(61535, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Shield() {
    return new IconData(59872, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ShieldMoon() {
    return new IconData(60073, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Shop() {
    return new IconData(59593, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Shop2() {
    return new IconData(57758, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ShopTwo() {
    return new IconData(59594, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Shopify() {
    return new IconData(60061, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ShoppingBag() {
    return new IconData(61900, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ShoppingBasket() {
    return new IconData(59595, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ShoppingCart() {
    return new IconData(59596, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ShoppingCartCheckout() {
    return new IconData(60296, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ShortText() {
    return new IconData(57953, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Shortcut() {
    return new IconData(61536, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ShowChart() {
    return new IconData(59105, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Shower() {
    return new IconData(61537, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Shuffle() {
    return new IconData(57411, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ShuffleOn() {
    return new IconData(59873, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ShutterSpeed() {
    return new IconData(58429, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Sick() {
    return new IconData(61984, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignLanguage() {
    return new IconData(60389, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalCellular0Bar() {
    return new IconData(61608, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalCellular4Bar() {
    return new IconData(57800, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalCellularAlt() {
    return new IconData(57858, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalCellularAlt1Bar() {
    return new IconData(60383, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalCellularAlt2Bar() {
    return new IconData(60387, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalCellularConnectedNoInternet0Bar() {
    return new IconData(61612, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalCellularConnectedNoInternet4Bar() {
    return new IconData(57805, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalCellularNoSim() {
    return new IconData(57806, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalCellularNodata() {
    return new IconData(61538, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalCellularNull() {
    return new IconData(57807, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalCellularOff() {
    return new IconData(57808, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalWifi0Bar() {
    return new IconData(61616, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalWifi4Bar() {
    return new IconData(57816, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalWifi4BarLock() {
    return new IconData(57817, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalWifiBad() {
    return new IconData(61539, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalWifiConnectedNoInternet4() {
    return new IconData(61540, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalWifiOff() {
    return new IconData(57818, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalWifiStatusbar4Bar() {
    return new IconData(61541, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalWifiStatusbarConnectedNoInternet4() {
    return new IconData(61542, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SignalWifiStatusbarNull() {
    return new IconData(61543, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Signpost() {
    return new IconData(60305, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SimCard() {
    return new IconData(58155, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SimCardAlert() {
    return new IconData(58916, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SimCardDownload() {
    return new IconData(61544, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SingleBed() {
    return new IconData(59976, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Sip() {
    return new IconData(61545, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Skateboarding() {
    return new IconData(58641, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SkipNext() {
    return new IconData(57412, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SkipPrevious() {
    return new IconData(57413, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Sledding() {
    return new IconData(58642, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Slideshow() {
    return new IconData(58395, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SlowMotionVideo() {
    return new IconData(57448, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SmartButton() {
    return new IconData(61889, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SmartDisplay() {
    return new IconData(61546, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SmartScreen() {
    return new IconData(61547, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SmartToy() {
    return new IconData(61548, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Smartphone() {
    return new IconData(58156, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SmokeFree() {
    return new IconData(60234, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SmokingRooms() {
    return new IconData(60235, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Sms() {
    return new IconData(58917, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SmsFailed() {
    return new IconData(58918, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Snapchat() {
    return new IconData(60014, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SnippetFolder() {
    return new IconData(61895, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Snooze() {
    return new IconData(57414, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Snowboarding() {
    return new IconData(58643, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Snowing() {
    return new IconData(59407, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Snowmobile() {
    return new IconData(58627, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Snowshoeing() {
    return new IconData(58644, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Soap() {
    return new IconData(61874, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SocialDistance() {
    return new IconData(57803, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Sort() {
    return new IconData(57700, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SortByAlpha() {
    return new IconData(57427, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Sos() {
    return new IconData(60407, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SoupKitchen() {
    return new IconData(59347, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Source() {
    return new IconData(61892, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get South() {
    return new IconData(61923, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SouthAmerica() {
    return new IconData(59364, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SouthEast() {
    return new IconData(61924, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SouthWest() {
    return new IconData(61925, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Spa() {
    return new IconData(60236, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SpaceBar() {
    return new IconData(57942, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SpaceDashboard() {
    return new IconData(58987, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SpatialAudio() {
    return new IconData(60395, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SpatialAudioOff() {
    return new IconData(60392, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SpatialTracking() {
    return new IconData(60394, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Speaker() {
    return new IconData(58157, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SpeakerGroup() {
    return new IconData(58158, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SpeakerNotes() {
    return new IconData(59597, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SpeakerNotesOff() {
    return new IconData(59690, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SpeakerPhone() {
    return new IconData(57554, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Speed() {
    return new IconData(59876, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Spellcheck() {
    return new IconData(59598, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Splitscreen() {
    return new IconData(61549, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Spoke() {
    return new IconData(59815, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Sports() {
    return new IconData(59952, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsBar() {
    return new IconData(61939, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsBaseball() {
    return new IconData(59985, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsBasketball() {
    return new IconData(59942, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsCricket() {
    return new IconData(59943, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsEsports() {
    return new IconData(59944, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsFootball() {
    return new IconData(59945, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsGolf() {
    return new IconData(59946, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsGymnastics() {
    return new IconData(60356, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsHandball() {
    return new IconData(59955, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsHockey() {
    return new IconData(59947, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsKabaddi() {
    return new IconData(59956, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsMartialArts() {
    return new IconData(60137, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsMma() {
    return new IconData(59948, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsMotorsports() {
    return new IconData(59949, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsRugby() {
    return new IconData(59950, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsScore() {
    return new IconData(61550, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsSoccer() {
    return new IconData(59951, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsTennis() {
    return new IconData(59954, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SportsVolleyball() {
    return new IconData(59953, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Square() {
    return new IconData(60214, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SquareFoot() {
    return new IconData(59977, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SsidChart() {
    return new IconData(60262, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StackedBarChart() {
    return new IconData(59878, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StackedLineChart() {
    return new IconData(61995, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Stadium() {
    return new IconData(60304, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Stairs() {
    return new IconData(61865, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Star() {
    return new IconData(59448, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StarBorder() {
    return new IconData(59450, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StarBorderPurple500() {
    return new IconData(61593, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StarHalf() {
    return new IconData(59449, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StarOutline() {
    return new IconData(61551, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StarPurple500() {
    return new IconData(61594, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StarRate() {
    return new IconData(61676, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Stars() {
    return new IconData(59600, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Start() {
    return new IconData(57481, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StayCurrentLandscape() {
    return new IconData(57555, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StayCurrentPortrait() {
    return new IconData(57556, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StayPrimaryLandscape() {
    return new IconData(57557, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StayPrimaryPortrait() {
    return new IconData(57558, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StickyNote2() {
    return new IconData(61948, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Stop() {
    return new IconData(57415, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StopCircle() {
    return new IconData(61297, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StopScreenShare() {
    return new IconData(57571, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Storage() {
    return new IconData(57819, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Store() {
    return new IconData(59601, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StoreMallDirectory() {
    return new IconData(58723, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Storefront() {
    return new IconData(59922, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Storm() {
    return new IconData(61552, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Straight() {
    return new IconData(60309, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Straighten() {
    return new IconData(58396, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Stream() {
    return new IconData(59881, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Streetview() {
    return new IconData(58734, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get StrikethroughS() {
    return new IconData(57943, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Stroller() {
    return new IconData(61870, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Style() {
    return new IconData(58397, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SubdirectoryArrowLeft() {
    return new IconData(58841, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SubdirectoryArrowRight() {
    return new IconData(58842, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Subject() {
    return new IconData(59602, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Subscript() {
    return new IconData(61713, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Subscriptions() {
    return new IconData(57444, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Subtitles() {
    return new IconData(57416, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SubtitlesOff() {
    return new IconData(61298, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Subway() {
    return new IconData(58735, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Summarize() {
    return new IconData(61553, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Sunny() {
    return new IconData(59418, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SunnySnowing() {
    return new IconData(59417, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Superscript() {
    return new IconData(61714, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SupervisedUserCircle() {
    return new IconData(59705, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SupervisorAccount() {
    return new IconData(59603, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Support() {
    return new IconData(61299, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SupportAgent() {
    return new IconData(61666, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Surfing() {
    return new IconData(58645, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SurroundSound() {
    return new IconData(57417, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwapCalls() {
    return new IconData(57559, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwapHoriz() {
    return new IconData(59604, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwapHorizontalCircle() {
    return new IconData(59699, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwapVert() {
    return new IconData(59605, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwapVertCircle() {
    return new IconData(59606, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwapVerticalCircle() {
    return new IconData(59606, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Swipe() {
    return new IconData(59884, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwipeDown() {
    return new IconData(60243, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwipeDownAlt() {
    return new IconData(60208, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwipeLeft() {
    return new IconData(60249, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwipeLeftAlt() {
    return new IconData(60211, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwipeRight() {
    return new IconData(60242, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwipeRightAlt() {
    return new IconData(60246, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwipeUp() {
    return new IconData(60206, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwipeUpAlt() {
    return new IconData(60213, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwipeVertical() {
    return new IconData(60241, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwitchAccessShortcut() {
    return new IconData(59361, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwitchAccessShortcutAdd() {
    return new IconData(59362, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwitchAccount() {
    return new IconData(59885, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwitchCamera() {
    return new IconData(58398, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwitchLeft() {
    return new IconData(61905, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwitchRight() {
    return new IconData(61906, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SwitchVideo() {
    return new IconData(58399, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Synagogue() {
    return new IconData(60080, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Sync() {
    return new IconData(58919, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SyncAlt() {
    return new IconData(59928, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SyncDisabled() {
    return new IconData(58920, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SyncLock() {
    return new IconData(60142, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SyncProblem() {
    return new IconData(58921, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SystemSecurityUpdate() {
    return new IconData(61554, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SystemSecurityUpdateGood() {
    return new IconData(61555, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SystemSecurityUpdateWarning() {
    return new IconData(61556, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SystemUpdate() {
    return new IconData(58922, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SystemUpdateAlt() {
    return new IconData(59607, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get SystemUpdateTv() {
    return new IconData(59607, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Tab() {
    return new IconData(59608, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TabUnselected() {
    return new IconData(59609, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TableBar() {
    return new IconData(60114, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TableChart() {
    return new IconData(57957, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TableRestaurant() {
    return new IconData(60102, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TableRows() {
    return new IconData(61697, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TableView() {
    return new IconData(61886, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Tablet() {
    return new IconData(58159, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TabletAndroid() {
    return new IconData(58160, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TabletMac() {
    return new IconData(58161, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Tag() {
    return new IconData(59887, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TagFaces() {
    return new IconData(58400, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TakeoutDining() {
    return new IconData(60020, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TapAndPlay() {
    return new IconData(58923, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Tapas() {
    return new IconData(61929, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Task() {
    return new IconData(61557, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TaskAlt() {
    return new IconData(58086, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TaxiAlert() {
    return new IconData(61300, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Telegram() {
    return new IconData(60011, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TempleBuddhist() {
    return new IconData(60083, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TempleHindu() {
    return new IconData(60079, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Terminal() {
    return new IconData(60302, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Terrain() {
    return new IconData(58724, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TextDecrease() {
    return new IconData(60125, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TextFields() {
    return new IconData(57954, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TextFormat() {
    return new IconData(57701, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TextIncrease() {
    return new IconData(60130, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TextRotateUp() {
    return new IconData(59706, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TextRotateVertical() {
    return new IconData(59707, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TextRotationAngledown() {
    return new IconData(59708, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TextRotationAngleup() {
    return new IconData(59709, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TextRotationDown() {
    return new IconData(59710, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TextRotationNone() {
    return new IconData(59711, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TextSnippet() {
    return new IconData(61894, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Textsms() {
    return new IconData(57560, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Texture() {
    return new IconData(58401, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TheaterComedy() {
    return new IconData(60006, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Theaters() {
    return new IconData(59610, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Thermostat() {
    return new IconData(61558, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ThermostatAuto() {
    return new IconData(61559, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ThumbDown() {
    return new IconData(59611, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ThumbDownAlt() {
    return new IconData(59414, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ThumbDownOffAlt() {
    return new IconData(59890, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ThumbUp() {
    return new IconData(59612, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ThumbUpAlt() {
    return new IconData(59415, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ThumbUpOffAlt() {
    return new IconData(59891, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ThumbsUpDown() {
    return new IconData(59613, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Thunderstorm() {
    return new IconData(60379, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Tiktok() {
    return new IconData(60030, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TimeToLeave() {
    return new IconData(58924, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Timelapse() {
    return new IconData(58402, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Timeline() {
    return new IconData(59682, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Timer() {
    return new IconData(58405, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Timer10() {
    return new IconData(58403, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Timer10Select() {
    return new IconData(61562, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Timer3() {
    return new IconData(58404, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Timer3Select() {
    return new IconData(61563, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TimerOff() {
    return new IconData(58406, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TipsAndUpdates() {
    return new IconData(59290, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TireRepair() {
    return new IconData(60360, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Title() {
    return new IconData(57956, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Toc() {
    return new IconData(59614, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Today() {
    return new IconData(59615, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ToggleOff() {
    return new IconData(59893, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ToggleOn() {
    return new IconData(59894, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Token() {
    return new IconData(59941, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Toll() {
    return new IconData(59616, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Tonality() {
    return new IconData(58407, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Topic() {
    return new IconData(61896, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TouchApp() {
    return new IconData(59667, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Tour() {
    return new IconData(61301, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Toys() {
    return new IconData(58162, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TrackChanges() {
    return new IconData(59617, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Traffic() {
    return new IconData(58725, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Train() {
    return new IconData(58736, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Tram() {
    return new IconData(58737, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TransferWithinAStation() {
    return new IconData(58738, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Transform() {
    return new IconData(58408, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Transgender() {
    return new IconData(58765, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TransitEnterexit() {
    return new IconData(58745, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Translate() {
    return new IconData(59618, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TravelExplore() {
    return new IconData(58075, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TrendingDown() {
    return new IconData(59619, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TrendingFlat() {
    return new IconData(59620, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TrendingNeutral() {
    return new IconData(59620, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TrendingUp() {
    return new IconData(59621, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TripOrigin() {
    return new IconData(58747, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Try() {
    return new IconData(61564, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Tsunami() {
    return new IconData(60376, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Tty() {
    return new IconData(61866, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Tune() {
    return new IconData(58409, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Tungsten() {
    return new IconData(61565, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TurnLeft() {
    return new IconData(60326, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TurnRight() {
    return new IconData(60331, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TurnSharpLeft() {
    return new IconData(60327, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TurnSharpRight() {
    return new IconData(60330, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TurnSlightLeft() {
    return new IconData(60324, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TurnSlightRight() {
    return new IconData(60314, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TurnedIn() {
    return new IconData(59622, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TurnedInNot() {
    return new IconData(59623, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Tv() {
    return new IconData(58163, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TvOff() {
    return new IconData(58951, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get TwoWheeler() {
    return new IconData(59897, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get UTurnLeft() {
    return new IconData(60321, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get UTurnRight() {
    return new IconData(60322, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Umbrella() {
    return new IconData(61869, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Unarchive() {
    return new IconData(57705, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Undo() {
    return new IconData(57702, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get UnfoldLess() {
    return new IconData(58838, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get UnfoldMore() {
    return new IconData(58839, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Unpublished() {
    return new IconData(62006, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Unsubscribe() {
    return new IconData(57579, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Upcoming() {
    return new IconData(61566, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Update() {
    return new IconData(59683, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get UpdateDisabled() {
    return new IconData(57461, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Upgrade() {
    return new IconData(61691, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Upload() {
    return new IconData(61595, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get UploadFile() {
    return new IconData(59900, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Usb() {
    return new IconData(57824, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get UsbOff() {
    return new IconData(58618, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Vaccines() {
    return new IconData(57656, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VapeFree() {
    return new IconData(60358, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VapingRooms() {
    return new IconData(60367, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Verified() {
    return new IconData(61302, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VerifiedUser() {
    return new IconData(59624, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VerticalAlignBottom() {
    return new IconData(57944, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VerticalAlignCenter() {
    return new IconData(57945, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VerticalAlignTop() {
    return new IconData(57946, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VerticalDistribute() {
    return new IconData(57462, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VerticalSplit() {
    return new IconData(59721, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Vibration() {
    return new IconData(58925, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VideoCall() {
    return new IconData(57456, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VideoCameraBack() {
    return new IconData(61567, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VideoCameraFront() {
    return new IconData(61568, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VideoCollection() {
    return new IconData(57418, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VideoFile() {
    return new IconData(60295, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VideoLabel() {
    return new IconData(57457, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VideoLibrary() {
    return new IconData(57418, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VideoSettings() {
    return new IconData(60021, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VideoStable() {
    return new IconData(61569, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Videocam() {
    return new IconData(57419, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VideocamOff() {
    return new IconData(57420, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VideogameAsset() {
    return new IconData(58168, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VideogameAssetOff() {
    return new IconData(58624, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewAgenda() {
    return new IconData(59625, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewArray() {
    return new IconData(59626, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewCarousel() {
    return new IconData(59627, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewColumn() {
    return new IconData(59628, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewComfortable() {
    return new IconData(58410, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewComfy() {
    return new IconData(58410, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewComfyAlt() {
    return new IconData(60275, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewCompact() {
    return new IconData(58411, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewCompactAlt() {
    return new IconData(60276, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewCozy() {
    return new IconData(60277, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewDay() {
    return new IconData(59629, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewHeadline() {
    return new IconData(59630, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewInAr() {
    return new IconData(59902, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewKanban() {
    return new IconData(60287, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewList() {
    return new IconData(59631, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewModule() {
    return new IconData(59632, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewQuilt() {
    return new IconData(59633, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewSidebar() {
    return new IconData(61716, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewStream() {
    return new IconData(59634, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewTimeline() {
    return new IconData(60293, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ViewWeek() {
    return new IconData(59635, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Vignette() {
    return new IconData(58421, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Villa() {
    return new IconData(58758, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Visibility() {
    return new IconData(59636, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VisibilityOff() {
    return new IconData(59637, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VoiceChat() {
    return new IconData(58926, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VoiceOverOff() {
    return new IconData(59722, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Voicemail() {
    return new IconData(57561, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Volcano() {
    return new IconData(60378, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VolumeDown() {
    return new IconData(57421, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VolumeDownAlt() {
    return new IconData(59292, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VolumeMute() {
    return new IconData(57422, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VolumeOff() {
    return new IconData(57423, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VolumeUp() {
    return new IconData(57424, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VolunteerActivism() {
    return new IconData(60016, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VpnKey() {
    return new IconData(57562, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VpnKeyOff() {
    return new IconData(60282, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get VpnLock() {
    return new IconData(58927, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Vrpano() {
    return new IconData(61570, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WalletGiftcard() {
    return new IconData(59638, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WalletMembership() {
    return new IconData(59639, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WalletTravel() {
    return new IconData(59640, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Wallpaper() {
    return new IconData(57788, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Warehouse() {
    return new IconData(60344, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Warning() {
    return new IconData(57346, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WarningAmber() {
    return new IconData(61571, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Wash() {
    return new IconData(61873, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Watch() {
    return new IconData(58164, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WatchLater() {
    return new IconData(59684, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WatchOff() {
    return new IconData(60131, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Water() {
    return new IconData(61572, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WaterDamage() {
    return new IconData(61955, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WaterDrop() {
    return new IconData(59288, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WaterfallChart() {
    return new IconData(59904, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Waves() {
    return new IconData(57718, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WavingHand() {
    return new IconData(59238, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WbAuto() {
    return new IconData(58412, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WbCloudy() {
    return new IconData(58413, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WbIncandescent() {
    return new IconData(58414, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WbIridescent() {
    return new IconData(58422, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WbShade() {
    return new IconData(59905, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WbSunny() {
    return new IconData(58416, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WbTwighlight() {
    return new IconData(59906, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WbTwilight() {
    return new IconData(57798, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Wc() {
    return new IconData(58941, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Web() {
    return new IconData(57425, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WebAsset() {
    return new IconData(57449, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WebAssetOff() {
    return new IconData(58615, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WebStories() {
    return new IconData(58773, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Webhook() {
    return new IconData(60306, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Wechat() {
    return new IconData(60033, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Weekend() {
    return new IconData(57707, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get West() {
    return new IconData(61926, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Whatsapp() {
    return new IconData(60060, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Whatshot() {
    return new IconData(59406, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WheelchairPickup() {
    return new IconData(61867, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WhereToVote() {
    return new IconData(57719, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Widgets() {
    return new IconData(57789, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Wifi() {
    return new IconData(58942, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Wifi1Bar() {
    return new IconData(58570, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Wifi2Bar() {
    return new IconData(58585, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WifiCalling() {
    return new IconData(61303, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WifiCalling3() {
    return new IconData(61573, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WifiChannel() {
    return new IconData(60266, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WifiFind() {
    return new IconData(60209, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WifiLock() {
    return new IconData(57825, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WifiOff() {
    return new IconData(58952, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WifiPassword() {
    return new IconData(60267, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WifiProtectedSetup() {
    return new IconData(61692, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WifiTethering() {
    return new IconData(57826, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WifiTetheringError() {
    return new IconData(60121, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WifiTetheringErrorRounded() {
    return new IconData(61574, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WifiTetheringOff() {
    return new IconData(61575, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Window() {
    return new IconData(61576, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WineBar() {
    return new IconData(61928, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Woman() {
    return new IconData(57662, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WooCommerce() {
    return new IconData(60013, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Wordpress() {
    return new IconData(60063, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Work() {
    return new IconData(59641, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WorkOff() {
    return new IconData(59714, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WorkOutline() {
    return new IconData(59715, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WorkspacePremium() {
    return new IconData(59311, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Workspaces() {
    return new IconData(57760, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WorkspacesFilled() {
    return new IconData(59917, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WorkspacesOutline() {
    return new IconData(59919, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WrapText() {
    return new IconData(57947, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get WrongLocation() {
    return new IconData(61304, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Wysiwyg() {
    return new IconData(61891, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get Yard() {
    return new IconData(61577, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get YoutubeSearchedFor() {
    return new IconData(59642, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ZoomIn() {
    return new IconData(59647, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ZoomInMap() {
    return new IconData(60205, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ZoomOut() {
    return new IconData(59648, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
  get ZoomOutMap() {
    return new IconData(58731, _MaterialIcons.FontFamily, _MaterialIcons.AssemblyName, _MaterialIcons.AssetPath);
  }
};
let MaterialIcons = _MaterialIcons;
__publicField(MaterialIcons, "FontFamily", "Material Icons");
__publicField(MaterialIcons, "AssemblyName", "PixUI");
__publicField(MaterialIcons, "AssetPath", "MaterialIcons.woff2");
const _MaterialIconsOutlined = class {
  get N10k() {
    return new IconData(59729, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N10mp() {
    return new IconData(59730, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N11mp() {
    return new IconData(59731, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N123() {
    return new IconData(60301, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N12mp() {
    return new IconData(59732, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N13mp() {
    return new IconData(59733, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N14mp() {
    return new IconData(59734, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N15mp() {
    return new IconData(59735, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N16mp() {
    return new IconData(59736, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N17mp() {
    return new IconData(59737, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N18mp() {
    return new IconData(59738, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N19mp() {
    return new IconData(59739, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N1k() {
    return new IconData(59740, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N1kPlus() {
    return new IconData(59741, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N1xMobiledata() {
    return new IconData(61389, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N20mp() {
    return new IconData(59742, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N21mp() {
    return new IconData(59743, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N22mp() {
    return new IconData(59744, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N23mp() {
    return new IconData(59745, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N24mp() {
    return new IconData(59746, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N2k() {
    return new IconData(59747, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N2kPlus() {
    return new IconData(59748, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N2mp() {
    return new IconData(59749, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N30fps() {
    return new IconData(61390, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N30fpsSelect() {
    return new IconData(61391, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N360() {
    return new IconData(58743, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N3dRotation() {
    return new IconData(59469, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N3gMobiledata() {
    return new IconData(61392, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N3k() {
    return new IconData(59750, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N3kPlus() {
    return new IconData(59751, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N3mp() {
    return new IconData(59752, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N3p() {
    return new IconData(61393, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N4gMobiledata() {
    return new IconData(61394, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N4gPlusMobiledata() {
    return new IconData(61395, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N4k() {
    return new IconData(57458, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N4kPlus() {
    return new IconData(59753, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N4mp() {
    return new IconData(59754, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N5g() {
    return new IconData(61240, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N5k() {
    return new IconData(59755, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N5kPlus() {
    return new IconData(59756, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N5mp() {
    return new IconData(59757, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N60fps() {
    return new IconData(61396, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N60fpsSelect() {
    return new IconData(61397, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N6FtApart() {
    return new IconData(61982, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N6k() {
    return new IconData(59758, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N6kPlus() {
    return new IconData(59759, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N6mp() {
    return new IconData(59760, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N7k() {
    return new IconData(59761, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N7kPlus() {
    return new IconData(59762, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N7mp() {
    return new IconData(59763, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N8k() {
    return new IconData(59764, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N8kPlus() {
    return new IconData(59765, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N8mp() {
    return new IconData(59766, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N9k() {
    return new IconData(59767, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N9kPlus() {
    return new IconData(59768, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get N9mp() {
    return new IconData(59769, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Abc() {
    return new IconData(60308, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AcUnit() {
    return new IconData(60219, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AccessAlarm() {
    return new IconData(57744, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AccessAlarms() {
    return new IconData(57745, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AccessTime() {
    return new IconData(57746, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AccessTimeFilled() {
    return new IconData(61398, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Accessibility() {
    return new IconData(59470, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AccessibilityNew() {
    return new IconData(59692, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Accessible() {
    return new IconData(59668, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AccessibleForward() {
    return new IconData(59700, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AccountBalance() {
    return new IconData(59471, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AccountBalanceWallet() {
    return new IconData(59472, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AccountBox() {
    return new IconData(59473, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AccountCircle() {
    return new IconData(59475, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AccountTree() {
    return new IconData(59770, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AdUnits() {
    return new IconData(61241, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Adb() {
    return new IconData(58894, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Add() {
    return new IconData(57669, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddAPhoto() {
    return new IconData(58425, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddAlarm() {
    return new IconData(57747, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddAlert() {
    return new IconData(57347, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddBox() {
    return new IconData(57670, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddBusiness() {
    return new IconData(59177, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddCard() {
    return new IconData(60294, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddChart() {
    return new IconData(59771, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddCircle() {
    return new IconData(57671, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddCircleOutline() {
    return new IconData(57672, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddComment() {
    return new IconData(57958, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddIcCall() {
    return new IconData(59772, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddLink() {
    return new IconData(57720, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddLocation() {
    return new IconData(58727, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddLocationAlt() {
    return new IconData(61242, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddModerator() {
    return new IconData(59773, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddPhotoAlternate() {
    return new IconData(58430, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddReaction() {
    return new IconData(57811, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddRoad() {
    return new IconData(61243, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddShoppingCart() {
    return new IconData(59476, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddTask() {
    return new IconData(62010, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddToDrive() {
    return new IconData(58972, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddToHomeScreen() {
    return new IconData(57854, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddToPhotos() {
    return new IconData(58269, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AddToQueue() {
    return new IconData(57436, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Addchart() {
    return new IconData(61244, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AdfScanner() {
    return new IconData(60122, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Adjust() {
    return new IconData(58270, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AdminPanelSettings() {
    return new IconData(61245, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Adobe() {
    return new IconData(60054, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AdsClick() {
    return new IconData(59234, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Agriculture() {
    return new IconData(60025, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Air() {
    return new IconData(61400, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AirlineSeatFlat() {
    return new IconData(58928, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AirlineSeatFlatAngled() {
    return new IconData(58929, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AirlineSeatIndividualSuite() {
    return new IconData(58930, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AirlineSeatLegroomExtra() {
    return new IconData(58931, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AirlineSeatLegroomNormal() {
    return new IconData(58932, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AirlineSeatLegroomReduced() {
    return new IconData(58933, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AirlineSeatReclineExtra() {
    return new IconData(58934, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AirlineSeatReclineNormal() {
    return new IconData(58935, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AirlineStops() {
    return new IconData(59344, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Airlines() {
    return new IconData(59338, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AirplaneTicket() {
    return new IconData(61401, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AirplanemodeActive() {
    return new IconData(57749, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AirplanemodeInactive() {
    return new IconData(57748, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AirplanemodeOff() {
    return new IconData(57748, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AirplanemodeOn() {
    return new IconData(57749, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Airplay() {
    return new IconData(57429, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AirportShuttle() {
    return new IconData(60220, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Alarm() {
    return new IconData(59477, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AlarmAdd() {
    return new IconData(59478, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AlarmOff() {
    return new IconData(59479, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AlarmOn() {
    return new IconData(59480, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Album() {
    return new IconData(57369, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AlignHorizontalCenter() {
    return new IconData(57359, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AlignHorizontalLeft() {
    return new IconData(57357, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AlignHorizontalRight() {
    return new IconData(57360, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AlignVerticalBottom() {
    return new IconData(57365, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AlignVerticalCenter() {
    return new IconData(57361, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AlignVerticalTop() {
    return new IconData(57356, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AllInbox() {
    return new IconData(59775, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AllInclusive() {
    return new IconData(60221, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AllOut() {
    return new IconData(59659, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AltRoute() {
    return new IconData(61828, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AlternateEmail() {
    return new IconData(57574, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AmpStories() {
    return new IconData(59923, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Analytics() {
    return new IconData(61246, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Anchor() {
    return new IconData(61901, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Android() {
    return new IconData(59481, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Animation() {
    return new IconData(59164, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Announcement() {
    return new IconData(59482, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Aod() {
    return new IconData(61402, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Apartment() {
    return new IconData(59968, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Api() {
    return new IconData(61879, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AppBlocking() {
    return new IconData(61247, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AppRegistration() {
    return new IconData(61248, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AppSettingsAlt() {
    return new IconData(61249, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AppShortcut() {
    return new IconData(60132, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Apple() {
    return new IconData(60032, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Approval() {
    return new IconData(59778, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Apps() {
    return new IconData(58819, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AppsOutage() {
    return new IconData(59340, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Architecture() {
    return new IconData(59963, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Archive() {
    return new IconData(57673, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AreaChart() {
    return new IconData(59248, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowBack() {
    return new IconData(58820, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowBackIos() {
    return new IconData(58848, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowBackIosNew() {
    return new IconData(58090, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowCircleDown() {
    return new IconData(61825, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowCircleLeft() {
    return new IconData(60071, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowCircleRight() {
    return new IconData(60074, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowCircleUp() {
    return new IconData(61826, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowDownward() {
    return new IconData(58843, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowDropDown() {
    return new IconData(58821, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowDropDownCircle() {
    return new IconData(58822, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowDropUp() {
    return new IconData(58823, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowForward() {
    return new IconData(58824, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowForwardIos() {
    return new IconData(58849, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowLeft() {
    return new IconData(58846, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowRight() {
    return new IconData(58847, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowRightAlt() {
    return new IconData(59713, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArrowUpward() {
    return new IconData(58840, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ArtTrack() {
    return new IconData(57440, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Article() {
    return new IconData(61250, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AspectRatio() {
    return new IconData(59483, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Assessment() {
    return new IconData(59484, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Assignment() {
    return new IconData(59485, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AssignmentInd() {
    return new IconData(59486, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AssignmentLate() {
    return new IconData(59487, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AssignmentReturn() {
    return new IconData(59488, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AssignmentReturned() {
    return new IconData(59489, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AssignmentTurnedIn() {
    return new IconData(59490, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Assistant() {
    return new IconData(58271, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AssistantDirection() {
    return new IconData(59784, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AssistantPhoto() {
    return new IconData(58272, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AssuredWorkload() {
    return new IconData(60271, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Atm() {
    return new IconData(58739, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AttachEmail() {
    return new IconData(59998, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AttachFile() {
    return new IconData(57894, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AttachMoney() {
    return new IconData(57895, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Attachment() {
    return new IconData(58044, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Attractions() {
    return new IconData(59986, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Attribution() {
    return new IconData(61403, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AudioFile() {
    return new IconData(60290, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Audiotrack() {
    return new IconData(58273, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AutoAwesome() {
    return new IconData(58975, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AutoAwesomeMosaic() {
    return new IconData(58976, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AutoAwesomeMotion() {
    return new IconData(58977, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AutoDelete() {
    return new IconData(59980, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AutoFixHigh() {
    return new IconData(58979, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AutoFixNormal() {
    return new IconData(58980, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AutoFixOff() {
    return new IconData(58981, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AutoGraph() {
    return new IconData(58619, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AutoStories() {
    return new IconData(58982, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AutofpsSelect() {
    return new IconData(61404, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Autorenew() {
    return new IconData(59491, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get AvTimer() {
    return new IconData(57371, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BabyChangingStation() {
    return new IconData(61851, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BackHand() {
    return new IconData(59236, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Backpack() {
    return new IconData(61852, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Backspace() {
    return new IconData(57674, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Backup() {
    return new IconData(59492, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BackupTable() {
    return new IconData(61251, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Badge() {
    return new IconData(60007, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BakeryDining() {
    return new IconData(59987, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Balance() {
    return new IconData(60150, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Balcony() {
    return new IconData(58767, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Ballot() {
    return new IconData(57714, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BarChart() {
    return new IconData(57963, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BatchPrediction() {
    return new IconData(61685, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Bathroom() {
    return new IconData(61405, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Bathtub() {
    return new IconData(59969, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Battery0Bar() {
    return new IconData(60380, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Battery1Bar() {
    return new IconData(60377, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Battery2Bar() {
    return new IconData(60384, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Battery3Bar() {
    return new IconData(60381, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Battery4Bar() {
    return new IconData(60386, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Battery5Bar() {
    return new IconData(60372, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Battery6Bar() {
    return new IconData(60370, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BatteryAlert() {
    return new IconData(57756, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BatteryChargingFull() {
    return new IconData(57763, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BatteryFull() {
    return new IconData(57764, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BatterySaver() {
    return new IconData(61406, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BatteryStd() {
    return new IconData(57765, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BatteryUnknown() {
    return new IconData(57766, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BeachAccess() {
    return new IconData(60222, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Bed() {
    return new IconData(61407, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BedroomBaby() {
    return new IconData(61408, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BedroomChild() {
    return new IconData(61409, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BedroomParent() {
    return new IconData(61410, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Bedtime() {
    return new IconData(61252, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BedtimeOff() {
    return new IconData(60278, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Beenhere() {
    return new IconData(58669, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Bento() {
    return new IconData(61940, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BikeScooter() {
    return new IconData(61253, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Biotech() {
    return new IconData(59962, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Blender() {
    return new IconData(61411, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Block() {
    return new IconData(57675, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Bloodtype() {
    return new IconData(61412, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Bluetooth() {
    return new IconData(57767, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BluetoothAudio() {
    return new IconData(58895, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BluetoothConnected() {
    return new IconData(57768, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BluetoothDisabled() {
    return new IconData(57769, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BluetoothDrive() {
    return new IconData(61413, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BluetoothSearching() {
    return new IconData(57770, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BlurCircular() {
    return new IconData(58274, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BlurLinear() {
    return new IconData(58275, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BlurOff() {
    return new IconData(58276, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BlurOn() {
    return new IconData(58277, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Bolt() {
    return new IconData(59915, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Book() {
    return new IconData(59493, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BookOnline() {
    return new IconData(61975, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Bookmark() {
    return new IconData(59494, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BookmarkAdd() {
    return new IconData(58776, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BookmarkAdded() {
    return new IconData(58777, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BookmarkBorder() {
    return new IconData(59495, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BookmarkOutline() {
    return new IconData(59495, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BookmarkRemove() {
    return new IconData(58778, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Bookmarks() {
    return new IconData(59787, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BorderAll() {
    return new IconData(57896, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BorderBottom() {
    return new IconData(57897, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BorderClear() {
    return new IconData(57898, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BorderColor() {
    return new IconData(57899, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BorderHorizontal() {
    return new IconData(57900, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BorderInner() {
    return new IconData(57901, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BorderLeft() {
    return new IconData(57902, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BorderOuter() {
    return new IconData(57903, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BorderRight() {
    return new IconData(57904, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BorderStyle() {
    return new IconData(57905, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BorderTop() {
    return new IconData(57906, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BorderVertical() {
    return new IconData(57907, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Boy() {
    return new IconData(60263, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BrandingWatermark() {
    return new IconData(57451, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BreakfastDining() {
    return new IconData(59988, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Brightness1() {
    return new IconData(58278, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Brightness2() {
    return new IconData(58279, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Brightness3() {
    return new IconData(58280, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Brightness4() {
    return new IconData(58281, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Brightness5() {
    return new IconData(58282, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Brightness6() {
    return new IconData(58283, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Brightness7() {
    return new IconData(58284, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BrightnessAuto() {
    return new IconData(57771, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BrightnessHigh() {
    return new IconData(57772, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BrightnessLow() {
    return new IconData(57773, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BrightnessMedium() {
    return new IconData(57774, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BrokenImage() {
    return new IconData(58285, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BrowseGallery() {
    return new IconData(60369, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BrowserNotSupported() {
    return new IconData(61255, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BrowserUpdated() {
    return new IconData(59343, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BrunchDining() {
    return new IconData(60019, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Brush() {
    return new IconData(58286, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BubbleChart() {
    return new IconData(59101, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BugReport() {
    return new IconData(59496, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Build() {
    return new IconData(59497, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BuildCircle() {
    return new IconData(61256, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Bungalow() {
    return new IconData(58769, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BurstMode() {
    return new IconData(58428, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BusAlert() {
    return new IconData(59791, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Business() {
    return new IconData(57519, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get BusinessCenter() {
    return new IconData(60223, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Cabin() {
    return new IconData(58761, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Cable() {
    return new IconData(61414, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Cached() {
    return new IconData(59498, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Cake() {
    return new IconData(59369, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Calculate() {
    return new IconData(59999, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CalendarMonth() {
    return new IconData(60364, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CalendarToday() {
    return new IconData(59701, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CalendarViewDay() {
    return new IconData(59702, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CalendarViewMonth() {
    return new IconData(61415, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CalendarViewWeek() {
    return new IconData(61416, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Call() {
    return new IconData(57520, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CallEnd() {
    return new IconData(57521, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CallMade() {
    return new IconData(57522, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CallMerge() {
    return new IconData(57523, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CallMissed() {
    return new IconData(57524, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CallMissedOutgoing() {
    return new IconData(57572, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CallReceived() {
    return new IconData(57525, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CallSplit() {
    return new IconData(57526, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CallToAction() {
    return new IconData(57452, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Camera() {
    return new IconData(58287, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CameraAlt() {
    return new IconData(58288, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CameraEnhance() {
    return new IconData(59644, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CameraFront() {
    return new IconData(58289, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CameraIndoor() {
    return new IconData(61417, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CameraOutdoor() {
    return new IconData(61418, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CameraRear() {
    return new IconData(58290, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CameraRoll() {
    return new IconData(58291, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Cameraswitch() {
    return new IconData(61419, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Campaign() {
    return new IconData(61257, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Cancel() {
    return new IconData(58825, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CancelPresentation() {
    return new IconData(57577, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CancelScheduleSend() {
    return new IconData(59961, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CandlestickChart() {
    return new IconData(60116, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CarCrash() {
    return new IconData(60402, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CarRental() {
    return new IconData(59989, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CarRepair() {
    return new IconData(59990, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CardGiftcard() {
    return new IconData(59638, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CardMembership() {
    return new IconData(59639, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CardTravel() {
    return new IconData(59640, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Carpenter() {
    return new IconData(61944, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Cases() {
    return new IconData(59794, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Casino() {
    return new IconData(60224, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Cast() {
    return new IconData(58119, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CastConnected() {
    return new IconData(58120, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CastForEducation() {
    return new IconData(61420, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Castle() {
    return new IconData(60081, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CatchingPokemon() {
    return new IconData(58632, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Category() {
    return new IconData(58740, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Celebration() {
    return new IconData(60005, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CellTower() {
    return new IconData(60346, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CellWifi() {
    return new IconData(57580, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CenterFocusStrong() {
    return new IconData(58292, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CenterFocusWeak() {
    return new IconData(58293, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Chair() {
    return new IconData(61421, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ChairAlt() {
    return new IconData(61422, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Chalet() {
    return new IconData(58757, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ChangeCircle() {
    return new IconData(58087, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ChangeHistory() {
    return new IconData(59499, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ChargingStation() {
    return new IconData(61853, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Chat() {
    return new IconData(57527, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ChatBubble() {
    return new IconData(57546, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ChatBubbleOutline() {
    return new IconData(57547, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Check() {
    return new IconData(58826, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CheckBox() {
    return new IconData(59444, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CheckBoxOutlineBlank() {
    return new IconData(59445, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CheckCircle() {
    return new IconData(59500, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CheckCircleOutline() {
    return new IconData(59693, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Checklist() {
    return new IconData(59057, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ChecklistRtl() {
    return new IconData(59059, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Checkroom() {
    return new IconData(61854, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ChevronLeft() {
    return new IconData(58827, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ChevronRight() {
    return new IconData(58828, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ChildCare() {
    return new IconData(60225, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ChildFriendly() {
    return new IconData(60226, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ChromeReaderMode() {
    return new IconData(59501, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Church() {
    return new IconData(60078, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Circle() {
    return new IconData(61258, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CircleNotifications() {
    return new IconData(59796, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Class() {
    return new IconData(59502, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CleanHands() {
    return new IconData(61983, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CleaningServices() {
    return new IconData(61695, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Clear() {
    return new IconData(57676, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ClearAll() {
    return new IconData(57528, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Close() {
    return new IconData(58829, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CloseFullscreen() {
    return new IconData(61903, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ClosedCaption() {
    return new IconData(57372, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ClosedCaptionDisabled() {
    return new IconData(61916, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ClosedCaptionOff() {
    return new IconData(59798, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Cloud() {
    return new IconData(58045, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CloudCircle() {
    return new IconData(58046, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CloudDone() {
    return new IconData(58047, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CloudDownload() {
    return new IconData(58048, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CloudOff() {
    return new IconData(58049, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CloudQueue() {
    return new IconData(58050, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CloudSync() {
    return new IconData(60250, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CloudUpload() {
    return new IconData(58051, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Co2() {
    return new IconData(59312, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CoPresent() {
    return new IconData(60144, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Code() {
    return new IconData(59503, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CodeOff() {
    return new IconData(58611, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Coffee() {
    return new IconData(61423, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CoffeeMaker() {
    return new IconData(61424, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Collections() {
    return new IconData(58294, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CollectionsBookmark() {
    return new IconData(58417, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ColorLens() {
    return new IconData(58295, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Colorize() {
    return new IconData(58296, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Comment() {
    return new IconData(57529, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CommentBank() {
    return new IconData(59982, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CommentsDisabled() {
    return new IconData(59298, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Commit() {
    return new IconData(60149, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Commute() {
    return new IconData(59712, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Compare() {
    return new IconData(58297, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CompareArrows() {
    return new IconData(59669, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CompassCalibration() {
    return new IconData(58748, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Compost() {
    return new IconData(59233, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Compress() {
    return new IconData(59725, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Computer() {
    return new IconData(58122, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ConfirmationNum() {
    return new IconData(58936, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ConfirmationNumber() {
    return new IconData(58936, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ConnectWithoutContact() {
    return new IconData(61987, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ConnectedTv() {
    return new IconData(59800, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ConnectingAirports() {
    return new IconData(59337, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Construction() {
    return new IconData(59964, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ContactMail() {
    return new IconData(57552, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ContactPage() {
    return new IconData(61998, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ContactPhone() {
    return new IconData(57551, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ContactSupport() {
    return new IconData(59724, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Contactless() {
    return new IconData(60017, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Contacts() {
    return new IconData(57530, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ContentCopy() {
    return new IconData(61578, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ContentCut() {
    return new IconData(61579, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ContentPaste() {
    return new IconData(61592, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ContentPasteGo() {
    return new IconData(60046, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ContentPasteOff() {
    return new IconData(58616, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ContentPasteSearch() {
    return new IconData(60059, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Contrast() {
    return new IconData(60215, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ControlCamera() {
    return new IconData(57460, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ControlPoint() {
    return new IconData(58298, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ControlPointDuplicate() {
    return new IconData(58299, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Cookie() {
    return new IconData(60076, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Copy() {
    return new IconData(61578, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CopyAll() {
    return new IconData(58092, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Copyright() {
    return new IconData(59660, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Coronavirus() {
    return new IconData(61985, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CorporateFare() {
    return new IconData(61904, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Cottage() {
    return new IconData(58759, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Countertops() {
    return new IconData(61943, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Create() {
    return new IconData(57680, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CreateNewFolder() {
    return new IconData(58060, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CreditCard() {
    return new IconData(59504, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CreditCardOff() {
    return new IconData(58612, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CreditScore() {
    return new IconData(61425, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Crib() {
    return new IconData(58760, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CrisisAlert() {
    return new IconData(60393, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Crop() {
    return new IconData(58302, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Crop169() {
    return new IconData(58300, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Crop32() {
    return new IconData(58301, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Crop54() {
    return new IconData(58303, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Crop75() {
    return new IconData(58304, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CropDin() {
    return new IconData(58305, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CropFree() {
    return new IconData(58306, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CropLandscape() {
    return new IconData(58307, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CropOriginal() {
    return new IconData(58308, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CropPortrait() {
    return new IconData(58309, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CropRotate() {
    return new IconData(58423, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CropSquare() {
    return new IconData(58310, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CrueltyFree() {
    return new IconData(59289, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Css() {
    return new IconData(60307, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CurrencyBitcoin() {
    return new IconData(60357, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CurrencyExchange() {
    return new IconData(60272, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CurrencyFranc() {
    return new IconData(60154, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CurrencyLira() {
    return new IconData(60143, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CurrencyPound() {
    return new IconData(60145, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CurrencyRuble() {
    return new IconData(60140, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CurrencyRupee() {
    return new IconData(60151, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CurrencyYen() {
    return new IconData(60155, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get CurrencyYuan() {
    return new IconData(60153, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Cut() {
    return new IconData(61579, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Cyclone() {
    return new IconData(60373, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Dangerous() {
    return new IconData(59802, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DarkMode() {
    return new IconData(58652, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Dashboard() {
    return new IconData(59505, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DashboardCustomize() {
    return new IconData(59803, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DataArray() {
    return new IconData(60113, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DataExploration() {
    return new IconData(59247, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DataObject() {
    return new IconData(60115, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DataSaverOff() {
    return new IconData(61426, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DataSaverOn() {
    return new IconData(61427, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DataThresholding() {
    return new IconData(60319, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DataUsage() {
    return new IconData(57775, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DateRange() {
    return new IconData(59670, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Deblur() {
    return new IconData(60279, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Deck() {
    return new IconData(59970, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Dehaze() {
    return new IconData(58311, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Delete() {
    return new IconData(59506, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DeleteForever() {
    return new IconData(59691, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DeleteOutline() {
    return new IconData(59694, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DeleteSweep() {
    return new IconData(57708, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DeliveryDining() {
    return new IconData(60018, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DensityLarge() {
    return new IconData(60329, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DensityMedium() {
    return new IconData(60318, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DensitySmall() {
    return new IconData(60328, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DepartureBoard() {
    return new IconData(58742, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Description() {
    return new IconData(59507, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Deselect() {
    return new IconData(60342, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DesignServices() {
    return new IconData(61706, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DesktopAccessDisabled() {
    return new IconData(59805, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DesktopMac() {
    return new IconData(58123, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DesktopWindows() {
    return new IconData(58124, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Details() {
    return new IconData(58312, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DeveloperBoard() {
    return new IconData(58125, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DeveloperBoardOff() {
    return new IconData(58623, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DeveloperMode() {
    return new IconData(57776, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DeviceHub() {
    return new IconData(58165, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DeviceThermostat() {
    return new IconData(57855, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DeviceUnknown() {
    return new IconData(58169, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Devices() {
    return new IconData(57777, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DevicesFold() {
    return new IconData(60382, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DevicesOther() {
    return new IconData(58167, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DialerSip() {
    return new IconData(57531, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Dialpad() {
    return new IconData(57532, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Diamond() {
    return new IconData(60117, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Difference() {
    return new IconData(60285, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Dining() {
    return new IconData(61428, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DinnerDining() {
    return new IconData(59991, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Directions() {
    return new IconData(58670, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsBike() {
    return new IconData(58671, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsBoat() {
    return new IconData(58674, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsBoatFilled() {
    return new IconData(61429, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsBus() {
    return new IconData(58672, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsBusFilled() {
    return new IconData(61430, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsCar() {
    return new IconData(58673, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsCarFilled() {
    return new IconData(61431, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsFerry() {
    return new IconData(58674, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsOff() {
    return new IconData(61711, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsRailway() {
    return new IconData(58676, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsRailwayFilled() {
    return new IconData(61432, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsRun() {
    return new IconData(58726, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsSubway() {
    return new IconData(58675, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsSubwayFilled() {
    return new IconData(61433, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsTrain() {
    return new IconData(58676, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsTransit() {
    return new IconData(58677, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsTransitFilled() {
    return new IconData(61434, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirectionsWalk() {
    return new IconData(58678, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DirtyLens() {
    return new IconData(61259, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DisabledByDefault() {
    return new IconData(62e3, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DisabledVisible() {
    return new IconData(59246, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DiscFull() {
    return new IconData(58896, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Discord() {
    return new IconData(60012, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Discount() {
    return new IconData(60361, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DisplaySettings() {
    return new IconData(60311, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DndForwardslash() {
    return new IconData(58897, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Dns() {
    return new IconData(59509, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoDisturb() {
    return new IconData(61580, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoDisturbAlt() {
    return new IconData(61581, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoDisturbOff() {
    return new IconData(61582, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoDisturbOn() {
    return new IconData(61583, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoNotDisturb() {
    return new IconData(58898, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoNotDisturbAlt() {
    return new IconData(58897, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoNotDisturbOff() {
    return new IconData(58947, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoNotDisturbOn() {
    return new IconData(58948, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoNotDisturbOnTotalSilence() {
    return new IconData(61435, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoNotStep() {
    return new IconData(61855, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoNotTouch() {
    return new IconData(61872, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Dock() {
    return new IconData(58126, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DocumentScanner() {
    return new IconData(58874, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Domain() {
    return new IconData(59374, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DomainAdd() {
    return new IconData(60258, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DomainDisabled() {
    return new IconData(57583, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DomainVerification() {
    return new IconData(61260, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Done() {
    return new IconData(59510, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoneAll() {
    return new IconData(59511, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoneOutline() {
    return new IconData(59695, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DonutLarge() {
    return new IconData(59671, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DonutSmall() {
    return new IconData(59672, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoorBack() {
    return new IconData(61436, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoorFront() {
    return new IconData(61437, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoorSliding() {
    return new IconData(61438, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Doorbell() {
    return new IconData(61439, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DoubleArrow() {
    return new IconData(59984, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DownhillSkiing() {
    return new IconData(58633, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Download() {
    return new IconData(61584, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DownloadDone() {
    return new IconData(61585, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DownloadForOffline() {
    return new IconData(61440, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Downloading() {
    return new IconData(61441, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Drafts() {
    return new IconData(57681, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DragHandle() {
    return new IconData(57949, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DragIndicator() {
    return new IconData(59717, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Draw() {
    return new IconData(59206, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DriveEta() {
    return new IconData(58899, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DriveFileMove() {
    return new IconData(58997, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DriveFileMoveRtl() {
    return new IconData(59245, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DriveFileRenameOutline() {
    return new IconData(59810, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DriveFolderUpload() {
    return new IconData(59811, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Dry() {
    return new IconData(61875, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DryCleaning() {
    return new IconData(59992, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Duo() {
    return new IconData(59813, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Dvr() {
    return new IconData(57778, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DynamicFeed() {
    return new IconData(59924, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get DynamicForm() {
    return new IconData(61887, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EMobiledata() {
    return new IconData(61442, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Earbuds() {
    return new IconData(61443, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EarbudsBattery() {
    return new IconData(61444, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get East() {
    return new IconData(61919, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Eco() {
    return new IconData(59957, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EdgesensorHigh() {
    return new IconData(61445, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EdgesensorLow() {
    return new IconData(61446, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Edit() {
    return new IconData(58313, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EditAttributes() {
    return new IconData(58744, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EditCalendar() {
    return new IconData(59202, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EditLocation() {
    return new IconData(58728, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EditLocationAlt() {
    return new IconData(57797, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EditNote() {
    return new IconData(59205, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EditNotifications() {
    return new IconData(58661, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EditOff() {
    return new IconData(59728, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EditRoad() {
    return new IconData(61261, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Egg() {
    return new IconData(60108, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EggAlt() {
    return new IconData(60104, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Eject() {
    return new IconData(59643, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Elderly() {
    return new IconData(61978, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ElderlyWoman() {
    return new IconData(60265, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ElectricBike() {
    return new IconData(60187, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ElectricCar() {
    return new IconData(60188, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ElectricMoped() {
    return new IconData(60189, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ElectricRickshaw() {
    return new IconData(60190, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ElectricScooter() {
    return new IconData(60191, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ElectricalServices() {
    return new IconData(61698, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Elevator() {
    return new IconData(61856, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Email() {
    return new IconData(57534, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Emergency() {
    return new IconData(57835, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EmergencyRecording() {
    return new IconData(60404, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EmergencyShare() {
    return new IconData(60406, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EmojiEmotions() {
    return new IconData(59938, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EmojiEvents() {
    return new IconData(59939, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EmojiFlags() {
    return new IconData(59930, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EmojiFoodBeverage() {
    return new IconData(59931, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EmojiNature() {
    return new IconData(59932, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EmojiObjects() {
    return new IconData(59940, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EmojiPeople() {
    return new IconData(59933, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EmojiSymbols() {
    return new IconData(59934, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EmojiTransportation() {
    return new IconData(59935, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Engineering() {
    return new IconData(59965, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EnhancePhotoTranslate() {
    return new IconData(59644, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EnhancedEncryption() {
    return new IconData(58943, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Equalizer() {
    return new IconData(57373, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Error() {
    return new IconData(57344, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ErrorOutline() {
    return new IconData(57345, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Escalator() {
    return new IconData(61857, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EscalatorWarning() {
    return new IconData(61868, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Euro() {
    return new IconData(59925, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EuroSymbol() {
    return new IconData(59686, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EvStation() {
    return new IconData(58733, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Event() {
    return new IconData(59512, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EventAvailable() {
    return new IconData(58900, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EventBusy() {
    return new IconData(58901, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EventNote() {
    return new IconData(58902, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EventRepeat() {
    return new IconData(60283, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get EventSeat() {
    return new IconData(59651, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ExitToApp() {
    return new IconData(59513, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Expand() {
    return new IconData(59727, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ExpandCircleDown() {
    return new IconData(59341, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ExpandLess() {
    return new IconData(58830, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ExpandMore() {
    return new IconData(58831, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Explicit() {
    return new IconData(57374, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Explore() {
    return new IconData(59514, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ExploreOff() {
    return new IconData(59816, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Exposure() {
    return new IconData(58314, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ExposureMinus1() {
    return new IconData(58315, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ExposureMinus2() {
    return new IconData(58316, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ExposureNeg1() {
    return new IconData(58315, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ExposureNeg2() {
    return new IconData(58316, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ExposurePlus1() {
    return new IconData(58317, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ExposurePlus2() {
    return new IconData(58318, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ExposureZero() {
    return new IconData(58319, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Extension() {
    return new IconData(59515, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ExtensionOff() {
    return new IconData(58613, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Face() {
    return new IconData(59516, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FaceRetouchingNatural() {
    return new IconData(61262, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FaceRetouchingOff() {
    return new IconData(61447, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FaceUnlock() {
    return new IconData(61448, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Facebook() {
    return new IconData(62004, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FactCheck() {
    return new IconData(61637, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Factory() {
    return new IconData(60348, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FamilyRestroom() {
    return new IconData(61858, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FastForward() {
    return new IconData(57375, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FastRewind() {
    return new IconData(57376, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Fastfood() {
    return new IconData(58746, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Favorite() {
    return new IconData(59517, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FavoriteBorder() {
    return new IconData(59518, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FavoriteOutline() {
    return new IconData(59518, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Fax() {
    return new IconData(60120, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FeaturedPlayList() {
    return new IconData(57453, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FeaturedVideo() {
    return new IconData(57454, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Feed() {
    return new IconData(61449, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Feedback() {
    return new IconData(59519, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Female() {
    return new IconData(58768, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Fence() {
    return new IconData(61942, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Festival() {
    return new IconData(60008, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FiberDvr() {
    return new IconData(57437, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FiberManualRecord() {
    return new IconData(57441, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FiberNew() {
    return new IconData(57438, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FiberPin() {
    return new IconData(57450, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FiberSmartRecord() {
    return new IconData(57442, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FileCopy() {
    return new IconData(57715, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FileDownload() {
    return new IconData(58052, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FileDownloadDone() {
    return new IconData(59818, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FileDownloadOff() {
    return new IconData(58622, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FileOpen() {
    return new IconData(60147, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FilePresent() {
    return new IconData(59918, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FileUpload() {
    return new IconData(58054, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Filter() {
    return new IconData(58323, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Filter1() {
    return new IconData(58320, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Filter2() {
    return new IconData(58321, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Filter3() {
    return new IconData(58322, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Filter4() {
    return new IconData(58324, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Filter5() {
    return new IconData(58325, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Filter6() {
    return new IconData(58326, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Filter7() {
    return new IconData(58327, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Filter8() {
    return new IconData(58328, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Filter9() {
    return new IconData(58329, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Filter9Plus() {
    return new IconData(58330, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FilterAlt() {
    return new IconData(61263, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FilterAltOff() {
    return new IconData(60210, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FilterBAndW() {
    return new IconData(58331, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FilterCenterFocus() {
    return new IconData(58332, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FilterDrama() {
    return new IconData(58333, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FilterFrames() {
    return new IconData(58334, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FilterHdr() {
    return new IconData(58335, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FilterList() {
    return new IconData(57682, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FilterListOff() {
    return new IconData(60247, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FilterNone() {
    return new IconData(58336, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FilterTiltShift() {
    return new IconData(58338, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FilterVintage() {
    return new IconData(58339, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FindInPage() {
    return new IconData(59520, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FindReplace() {
    return new IconData(59521, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Fingerprint() {
    return new IconData(59661, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FireExtinguisher() {
    return new IconData(61912, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Fireplace() {
    return new IconData(59971, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FirstPage() {
    return new IconData(58844, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FitScreen() {
    return new IconData(59920, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Fitbit() {
    return new IconData(59435, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FitnessCenter() {
    return new IconData(60227, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Flag() {
    return new IconData(57683, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FlagCircle() {
    return new IconData(60152, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Flaky() {
    return new IconData(61264, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Flare() {
    return new IconData(58340, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FlashAuto() {
    return new IconData(58341, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FlashOff() {
    return new IconData(58342, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FlashOn() {
    return new IconData(58343, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FlashlightOff() {
    return new IconData(61450, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FlashlightOn() {
    return new IconData(61451, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Flatware() {
    return new IconData(61452, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Flight() {
    return new IconData(58681, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FlightClass() {
    return new IconData(59339, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FlightLand() {
    return new IconData(59652, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FlightTakeoff() {
    return new IconData(59653, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Flip() {
    return new IconData(58344, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FlipCameraAndroid() {
    return new IconData(59959, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FlipCameraIos() {
    return new IconData(59960, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FlipToBack() {
    return new IconData(59522, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FlipToFront() {
    return new IconData(59523, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Flood() {
    return new IconData(60390, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Flourescent() {
    return new IconData(61453, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FlutterDash() {
    return new IconData(57355, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FmdBad() {
    return new IconData(61454, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FmdGood() {
    return new IconData(61455, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Folder() {
    return new IconData(58055, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FolderCopy() {
    return new IconData(60349, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FolderDelete() {
    return new IconData(60212, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FolderOff() {
    return new IconData(60291, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FolderOpen() {
    return new IconData(58056, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FolderShared() {
    return new IconData(58057, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FolderSpecial() {
    return new IconData(58903, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FolderZip() {
    return new IconData(60204, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FollowTheSigns() {
    return new IconData(61986, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FontDownload() {
    return new IconData(57703, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FontDownloadOff() {
    return new IconData(58617, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FoodBank() {
    return new IconData(61938, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Forest() {
    return new IconData(60057, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ForkLeft() {
    return new IconData(60320, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ForkRight() {
    return new IconData(60332, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatAlignCenter() {
    return new IconData(57908, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatAlignJustify() {
    return new IconData(57909, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatAlignLeft() {
    return new IconData(57910, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatAlignRight() {
    return new IconData(57911, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatBold() {
    return new IconData(57912, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatClear() {
    return new IconData(57913, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatColorFill() {
    return new IconData(57914, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatColorReset() {
    return new IconData(57915, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatColorText() {
    return new IconData(57916, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatIndentDecrease() {
    return new IconData(57917, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatIndentIncrease() {
    return new IconData(57918, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatItalic() {
    return new IconData(57919, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatLineSpacing() {
    return new IconData(57920, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatListBulleted() {
    return new IconData(57921, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatListNumbered() {
    return new IconData(57922, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatListNumberedRtl() {
    return new IconData(57959, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatOverline() {
    return new IconData(60261, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatPaint() {
    return new IconData(57923, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatQuote() {
    return new IconData(57924, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatShapes() {
    return new IconData(57950, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatSize() {
    return new IconData(57925, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatStrikethrough() {
    return new IconData(57926, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatTextdirectionLToR() {
    return new IconData(57927, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatTextdirectionRToL() {
    return new IconData(57928, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatUnderline() {
    return new IconData(59237, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FormatUnderlined() {
    return new IconData(59237, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Fort() {
    return new IconData(60077, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Forum() {
    return new IconData(57535, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Forward() {
    return new IconData(57684, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Forward10() {
    return new IconData(57430, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Forward30() {
    return new IconData(57431, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Forward5() {
    return new IconData(57432, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ForwardToInbox() {
    return new IconData(61831, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Foundation() {
    return new IconData(61952, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FreeBreakfast() {
    return new IconData(60228, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FreeCancellation() {
    return new IconData(59208, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FrontHand() {
    return new IconData(59241, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Fullscreen() {
    return new IconData(58832, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get FullscreenExit() {
    return new IconData(58833, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Functions() {
    return new IconData(57930, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GMobiledata() {
    return new IconData(61456, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GTranslate() {
    return new IconData(59687, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Gamepad() {
    return new IconData(58127, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Games() {
    return new IconData(57377, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Garage() {
    return new IconData(61457, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Gavel() {
    return new IconData(59662, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GeneratingTokens() {
    return new IconData(59209, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Gesture() {
    return new IconData(57685, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GetApp() {
    return new IconData(59524, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Gif() {
    return new IconData(59656, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GifBox() {
    return new IconData(59299, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Girl() {
    return new IconData(60264, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Gite() {
    return new IconData(58763, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GolfCourse() {
    return new IconData(60229, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GppBad() {
    return new IconData(61458, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GppGood() {
    return new IconData(61459, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GppMaybe() {
    return new IconData(61460, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GpsFixed() {
    return new IconData(57779, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GpsNotFixed() {
    return new IconData(57780, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GpsOff() {
    return new IconData(57781, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Grade() {
    return new IconData(59525, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Gradient() {
    return new IconData(58345, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Grading() {
    return new IconData(59983, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Grain() {
    return new IconData(58346, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GraphicEq() {
    return new IconData(57784, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Grass() {
    return new IconData(61957, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Grid3x3() {
    return new IconData(61461, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Grid4x4() {
    return new IconData(61462, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GridGoldenratio() {
    return new IconData(61463, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GridOff() {
    return new IconData(58347, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GridOn() {
    return new IconData(58348, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GridView() {
    return new IconData(59824, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Group() {
    return new IconData(59375, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GroupAdd() {
    return new IconData(59376, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GroupOff() {
    return new IconData(59207, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GroupRemove() {
    return new IconData(59309, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get GroupWork() {
    return new IconData(59526, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Groups() {
    return new IconData(62003, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HMobiledata() {
    return new IconData(61464, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HPlusMobiledata() {
    return new IconData(61465, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Hail() {
    return new IconData(59825, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Handshake() {
    return new IconData(60363, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Handyman() {
    return new IconData(61707, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Hardware() {
    return new IconData(59993, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Hd() {
    return new IconData(57426, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HdrAuto() {
    return new IconData(61466, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HdrAutoSelect() {
    return new IconData(61467, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HdrEnhancedSelect() {
    return new IconData(61265, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HdrOff() {
    return new IconData(58349, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HdrOffSelect() {
    return new IconData(61468, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HdrOn() {
    return new IconData(58350, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HdrOnSelect() {
    return new IconData(61469, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HdrPlus() {
    return new IconData(61470, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HdrStrong() {
    return new IconData(58353, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HdrWeak() {
    return new IconData(58354, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Headphones() {
    return new IconData(61471, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HeadphonesBattery() {
    return new IconData(61472, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Headset() {
    return new IconData(58128, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HeadsetMic() {
    return new IconData(58129, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HeadsetOff() {
    return new IconData(58170, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Healing() {
    return new IconData(58355, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HealthAndSafety() {
    return new IconData(57813, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Hearing() {
    return new IconData(57379, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HearingDisabled() {
    return new IconData(61700, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HeartBroken() {
    return new IconData(60098, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Height() {
    return new IconData(59926, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Help() {
    return new IconData(59527, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HelpCenter() {
    return new IconData(61888, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HelpOutline() {
    return new IconData(59645, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Hevc() {
    return new IconData(61473, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Hexagon() {
    return new IconData(60217, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HideImage() {
    return new IconData(61474, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HideSource() {
    return new IconData(61475, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HighQuality() {
    return new IconData(57380, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Highlight() {
    return new IconData(57951, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HighlightAlt() {
    return new IconData(61266, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HighlightOff() {
    return new IconData(59528, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HighlightRemove() {
    return new IconData(59528, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Hiking() {
    return new IconData(58634, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get History() {
    return new IconData(59529, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HistoryEdu() {
    return new IconData(59966, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HistoryToggleOff() {
    return new IconData(61821, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Hive() {
    return new IconData(60070, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Hls() {
    return new IconData(60298, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HlsOff() {
    return new IconData(60300, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HolidayVillage() {
    return new IconData(58762, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Home() {
    return new IconData(59530, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HomeMax() {
    return new IconData(61476, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HomeMini() {
    return new IconData(61477, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HomeRepairService() {
    return new IconData(61696, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HomeWork() {
    return new IconData(59913, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HorizontalDistribute() {
    return new IconData(57364, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HorizontalRule() {
    return new IconData(61704, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HorizontalSplit() {
    return new IconData(59719, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HotTub() {
    return new IconData(60230, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Hotel() {
    return new IconData(58682, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HotelClass() {
    return new IconData(59203, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HourglassBottom() {
    return new IconData(59996, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HourglassDisabled() {
    return new IconData(61267, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HourglassEmpty() {
    return new IconData(59531, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HourglassFull() {
    return new IconData(59532, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HourglassTop() {
    return new IconData(59995, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get House() {
    return new IconData(59972, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HouseSiding() {
    return new IconData(61954, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Houseboat() {
    return new IconData(58756, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HowToReg() {
    return new IconData(57716, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get HowToVote() {
    return new IconData(57717, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Html() {
    return new IconData(60286, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Http() {
    return new IconData(59650, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Https() {
    return new IconData(59533, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Hub() {
    return new IconData(59892, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Hvac() {
    return new IconData(61710, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get IceSkating() {
    return new IconData(58635, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Icecream() {
    return new IconData(60009, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Image() {
    return new IconData(58356, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ImageAspectRatio() {
    return new IconData(58357, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ImageNotSupported() {
    return new IconData(61718, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ImageSearch() {
    return new IconData(58431, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ImagesearchRoller() {
    return new IconData(59828, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ImportContacts() {
    return new IconData(57568, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ImportExport() {
    return new IconData(57539, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ImportantDevices() {
    return new IconData(59666, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Inbox() {
    return new IconData(57686, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get IncompleteCircle() {
    return new IconData(59291, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get IndeterminateCheckBox() {
    return new IconData(59657, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Info() {
    return new IconData(59534, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Input() {
    return new IconData(59536, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get InsertChart() {
    return new IconData(57931, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get InsertChartOutlined() {
    return new IconData(57962, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get InsertComment() {
    return new IconData(57932, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get InsertDriveFile() {
    return new IconData(57933, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get InsertEmoticon() {
    return new IconData(57934, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get InsertInvitation() {
    return new IconData(57935, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get InsertLink() {
    return new IconData(57936, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get InsertPageBreak() {
    return new IconData(60106, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get InsertPhoto() {
    return new IconData(57937, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Insights() {
    return new IconData(61586, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get InstallDesktop() {
    return new IconData(60273, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get InstallMobile() {
    return new IconData(60274, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get IntegrationInstructions() {
    return new IconData(61268, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Interests() {
    return new IconData(59336, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get InterpreterMode() {
    return new IconData(59451, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Inventory() {
    return new IconData(57721, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Inventory2() {
    return new IconData(57761, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get InvertColors() {
    return new IconData(59537, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get InvertColorsOff() {
    return new IconData(57540, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get InvertColorsOn() {
    return new IconData(59537, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get IosShare() {
    return new IconData(59064, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Iron() {
    return new IconData(58755, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Iso() {
    return new IconData(58358, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Javascript() {
    return new IconData(60284, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get JoinFull() {
    return new IconData(60139, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get JoinInner() {
    return new IconData(60148, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get JoinLeft() {
    return new IconData(60146, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get JoinRight() {
    return new IconData(60138, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Kayaking() {
    return new IconData(58636, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KebabDining() {
    return new IconData(59458, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Key() {
    return new IconData(59196, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyOff() {
    return new IconData(60292, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Keyboard() {
    return new IconData(58130, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardAlt() {
    return new IconData(61480, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardArrowDown() {
    return new IconData(58131, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardArrowLeft() {
    return new IconData(58132, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardArrowRight() {
    return new IconData(58133, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardArrowUp() {
    return new IconData(58134, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardBackspace() {
    return new IconData(58135, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardCapslock() {
    return new IconData(58136, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardCommandKey() {
    return new IconData(60135, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardControl() {
    return new IconData(60129, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardControlKey() {
    return new IconData(60134, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardDoubleArrowDown() {
    return new IconData(60112, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardDoubleArrowLeft() {
    return new IconData(60099, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardDoubleArrowRight() {
    return new IconData(60105, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardDoubleArrowUp() {
    return new IconData(60111, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardHide() {
    return new IconData(58138, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardOptionKey() {
    return new IconData(60136, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardReturn() {
    return new IconData(58139, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardTab() {
    return new IconData(58140, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KeyboardVoice() {
    return new IconData(58141, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get KingBed() {
    return new IconData(59973, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Kitchen() {
    return new IconData(60231, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Kitesurfing() {
    return new IconData(58637, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Label() {
    return new IconData(59538, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LabelImportant() {
    return new IconData(59703, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LabelOff() {
    return new IconData(59830, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Lan() {
    return new IconData(60207, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Landscape() {
    return new IconData(58359, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Landslide() {
    return new IconData(60375, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Language() {
    return new IconData(59540, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Laptop() {
    return new IconData(58142, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LaptopChromebook() {
    return new IconData(58143, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LaptopMac() {
    return new IconData(58144, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LaptopWindows() {
    return new IconData(58145, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LastPage() {
    return new IconData(58845, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Launch() {
    return new IconData(59541, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Layers() {
    return new IconData(58683, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LayersClear() {
    return new IconData(58684, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Leaderboard() {
    return new IconData(61964, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LeakAdd() {
    return new IconData(58360, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LeakRemove() {
    return new IconData(58361, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LeaveBagsAtHome() {
    return new IconData(62011, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LegendToggle() {
    return new IconData(61723, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Lens() {
    return new IconData(58362, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LensBlur() {
    return new IconData(61481, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LibraryAdd() {
    return new IconData(57390, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LibraryAddCheck() {
    return new IconData(59831, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LibraryBooks() {
    return new IconData(57391, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LibraryMusic() {
    return new IconData(57392, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Light() {
    return new IconData(61482, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LightMode() {
    return new IconData(58648, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Lightbulb() {
    return new IconData(57584, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LineAxis() {
    return new IconData(60058, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LineStyle() {
    return new IconData(59673, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LineWeight() {
    return new IconData(59674, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LinearScale() {
    return new IconData(57952, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Link() {
    return new IconData(57687, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LinkOff() {
    return new IconData(57711, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LinkedCamera() {
    return new IconData(58424, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Liquor() {
    return new IconData(6e4, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get List() {
    return new IconData(59542, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ListAlt() {
    return new IconData(57582, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LiveHelp() {
    return new IconData(57542, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LiveTv() {
    return new IconData(58937, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Living() {
    return new IconData(61483, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalActivity() {
    return new IconData(58687, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalAirport() {
    return new IconData(58685, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalAtm() {
    return new IconData(58686, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalAttraction() {
    return new IconData(58687, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalBar() {
    return new IconData(58688, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalCafe() {
    return new IconData(58689, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalCarWash() {
    return new IconData(58690, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalConvenienceStore() {
    return new IconData(58691, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalDining() {
    return new IconData(58710, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalDrink() {
    return new IconData(58692, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalFireDepartment() {
    return new IconData(61269, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalFlorist() {
    return new IconData(58693, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalGasStation() {
    return new IconData(58694, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalGroceryStore() {
    return new IconData(58695, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalHospital() {
    return new IconData(58696, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalHotel() {
    return new IconData(58697, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalLaundryService() {
    return new IconData(58698, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalLibrary() {
    return new IconData(58699, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalMall() {
    return new IconData(58700, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalMovies() {
    return new IconData(58701, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalOffer() {
    return new IconData(58702, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalParking() {
    return new IconData(58703, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalPharmacy() {
    return new IconData(58704, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalPhone() {
    return new IconData(58705, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalPizza() {
    return new IconData(58706, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalPlay() {
    return new IconData(58707, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalPolice() {
    return new IconData(61270, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalPostOffice() {
    return new IconData(58708, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalPrintShop() {
    return new IconData(58709, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalPrintshop() {
    return new IconData(58709, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalRestaurant() {
    return new IconData(58710, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalSee() {
    return new IconData(58711, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalShipping() {
    return new IconData(58712, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocalTaxi() {
    return new IconData(58713, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocationCity() {
    return new IconData(59377, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocationDisabled() {
    return new IconData(57782, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocationHistory() {
    return new IconData(58714, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocationOff() {
    return new IconData(57543, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocationOn() {
    return new IconData(57544, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LocationSearching() {
    return new IconData(57783, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Lock() {
    return new IconData(59543, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LockClock() {
    return new IconData(61271, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LockOpen() {
    return new IconData(59544, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LockReset() {
    return new IconData(60126, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Login() {
    return new IconData(60023, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LogoDev() {
    return new IconData(60118, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Logout() {
    return new IconData(59834, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Looks() {
    return new IconData(58364, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Looks3() {
    return new IconData(58363, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Looks4() {
    return new IconData(58365, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Looks5() {
    return new IconData(58366, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Looks6() {
    return new IconData(58367, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LooksOne() {
    return new IconData(58368, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LooksTwo() {
    return new IconData(58369, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Loop() {
    return new IconData(57384, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Loupe() {
    return new IconData(58370, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LowPriority() {
    return new IconData(57709, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Loyalty() {
    return new IconData(59546, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LteMobiledata() {
    return new IconData(61484, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LtePlusMobiledata() {
    return new IconData(61485, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Luggage() {
    return new IconData(62005, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get LunchDining() {
    return new IconData(60001, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Mail() {
    return new IconData(57688, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MailOutline() {
    return new IconData(57569, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Male() {
    return new IconData(58766, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Man() {
    return new IconData(58603, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ManageAccounts() {
    return new IconData(61486, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ManageHistory() {
    return new IconData(60391, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ManageSearch() {
    return new IconData(61487, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Map() {
    return new IconData(58715, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MapsHomeWork() {
    return new IconData(61488, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MapsUgc() {
    return new IconData(61272, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Margin() {
    return new IconData(59835, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MarkAsUnread() {
    return new IconData(59836, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MarkChatRead() {
    return new IconData(61835, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MarkChatUnread() {
    return new IconData(61833, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MarkEmailRead() {
    return new IconData(61836, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MarkEmailUnread() {
    return new IconData(61834, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MarkUnreadChatAlt() {
    return new IconData(60317, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Markunread() {
    return new IconData(57689, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MarkunreadMailbox() {
    return new IconData(59547, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Masks() {
    return new IconData(61976, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Maximize() {
    return new IconData(59696, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MediaBluetoothOff() {
    return new IconData(61489, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MediaBluetoothOn() {
    return new IconData(61490, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Mediation() {
    return new IconData(61351, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MedicalInformation() {
    return new IconData(60397, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MedicalServices() {
    return new IconData(61705, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Medication() {
    return new IconData(61491, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MedicationLiquid() {
    return new IconData(60039, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MeetingRoom() {
    return new IconData(60239, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Memory() {
    return new IconData(58146, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Menu() {
    return new IconData(58834, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MenuBook() {
    return new IconData(59929, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MenuOpen() {
    return new IconData(59837, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Merge() {
    return new IconData(60312, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MergeType() {
    return new IconData(57938, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Message() {
    return new IconData(57545, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Messenger() {
    return new IconData(57546, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MessengerOutline() {
    return new IconData(57547, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Mic() {
    return new IconData(57385, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MicExternalOff() {
    return new IconData(61273, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MicExternalOn() {
    return new IconData(61274, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MicNone() {
    return new IconData(57386, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MicOff() {
    return new IconData(57387, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Microwave() {
    return new IconData(61956, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MilitaryTech() {
    return new IconData(59967, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Minimize() {
    return new IconData(59697, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MinorCrash() {
    return new IconData(60401, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MiscellaneousServices() {
    return new IconData(61708, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MissedVideoCall() {
    return new IconData(57459, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Mms() {
    return new IconData(58904, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MobileFriendly() {
    return new IconData(57856, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MobileOff() {
    return new IconData(57857, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MobileScreenShare() {
    return new IconData(57575, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MobiledataOff() {
    return new IconData(61492, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Mode() {
    return new IconData(61591, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ModeComment() {
    return new IconData(57939, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ModeEdit() {
    return new IconData(57940, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ModeEditOutline() {
    return new IconData(61493, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ModeNight() {
    return new IconData(61494, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ModeOfTravel() {
    return new IconData(59342, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ModeStandby() {
    return new IconData(61495, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ModelTraining() {
    return new IconData(61647, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MonetizationOn() {
    return new IconData(57955, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Money() {
    return new IconData(58749, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MoneyOff() {
    return new IconData(57948, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MoneyOffCsred() {
    return new IconData(61496, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Monitor() {
    return new IconData(61275, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MonitorHeart() {
    return new IconData(60066, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MonitorWeight() {
    return new IconData(61497, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MonochromePhotos() {
    return new IconData(58371, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Mood() {
    return new IconData(59378, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MoodBad() {
    return new IconData(59379, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Moped() {
    return new IconData(60200, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get More() {
    return new IconData(58905, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MoreHoriz() {
    return new IconData(60129, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MoreTime() {
    return new IconData(59997, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MoreVert() {
    return new IconData(58836, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Mosque() {
    return new IconData(60082, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MotionPhotosAuto() {
    return new IconData(61498, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MotionPhotosOff() {
    return new IconData(59840, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MotionPhotosOn() {
    return new IconData(59841, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MotionPhotosPause() {
    return new IconData(61991, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MotionPhotosPaused() {
    return new IconData(59842, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Motorcycle() {
    return new IconData(59675, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Mouse() {
    return new IconData(58147, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MoveDown() {
    return new IconData(60257, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MoveToInbox() {
    return new IconData(57704, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MoveUp() {
    return new IconData(60260, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Movie() {
    return new IconData(57388, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MovieCreation() {
    return new IconData(58372, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MovieFilter() {
    return new IconData(58426, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Moving() {
    return new IconData(58625, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Mp() {
    return new IconData(59843, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MultilineChart() {
    return new IconData(59103, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MultipleStop() {
    return new IconData(61881, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MultitrackAudio() {
    return new IconData(57784, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Museum() {
    return new IconData(59958, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MusicNote() {
    return new IconData(58373, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MusicOff() {
    return new IconData(58432, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MusicVideo() {
    return new IconData(57443, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MyLibraryAdd() {
    return new IconData(57390, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MyLibraryBooks() {
    return new IconData(57391, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MyLibraryMusic() {
    return new IconData(57392, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get MyLocation() {
    return new IconData(58716, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Nat() {
    return new IconData(61276, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Nature() {
    return new IconData(58374, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NaturePeople() {
    return new IconData(58375, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NavigateBefore() {
    return new IconData(58376, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NavigateNext() {
    return new IconData(58377, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Navigation() {
    return new IconData(58717, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NearMe() {
    return new IconData(58729, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NearMeDisabled() {
    return new IconData(61935, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NearbyError() {
    return new IconData(61499, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NearbyOff() {
    return new IconData(61500, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NetworkCell() {
    return new IconData(57785, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NetworkCheck() {
    return new IconData(58944, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NetworkLocked() {
    return new IconData(58906, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NetworkPing() {
    return new IconData(60362, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NetworkWifi() {
    return new IconData(57786, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NetworkWifi1Bar() {
    return new IconData(60388, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NetworkWifi2Bar() {
    return new IconData(60374, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NetworkWifi3Bar() {
    return new IconData(60385, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NewLabel() {
    return new IconData(58889, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NewReleases() {
    return new IconData(57393, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Newspaper() {
    return new IconData(60289, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NextPlan() {
    return new IconData(61277, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NextWeek() {
    return new IconData(57706, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Nfc() {
    return new IconData(57787, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NightShelter() {
    return new IconData(61937, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Nightlife() {
    return new IconData(60002, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Nightlight() {
    return new IconData(61501, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NightlightRound() {
    return new IconData(61278, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NightsStay() {
    return new IconData(59974, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoAccounts() {
    return new IconData(61502, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoBackpack() {
    return new IconData(62007, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoCell() {
    return new IconData(61860, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoCrash() {
    return new IconData(60400, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoDrinks() {
    return new IconData(61861, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoEncryption() {
    return new IconData(58945, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoEncryptionGmailerrorred() {
    return new IconData(61503, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoFlash() {
    return new IconData(61862, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoFood() {
    return new IconData(61863, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoLuggage() {
    return new IconData(62011, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoMeals() {
    return new IconData(61910, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoMeetingRoom() {
    return new IconData(60238, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoPhotography() {
    return new IconData(61864, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoSim() {
    return new IconData(57548, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoStroller() {
    return new IconData(61871, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoTransfer() {
    return new IconData(61909, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoiseAware() {
    return new IconData(60396, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoiseControlOff() {
    return new IconData(60403, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NordicWalking() {
    return new IconData(58638, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get North() {
    return new IconData(61920, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NorthEast() {
    return new IconData(61921, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NorthWest() {
    return new IconData(61922, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NotAccessible() {
    return new IconData(61694, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NotInterested() {
    return new IconData(57395, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NotListedLocation() {
    return new IconData(58741, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NotStarted() {
    return new IconData(61649, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Note() {
    return new IconData(57455, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoteAdd() {
    return new IconData(59548, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NoteAlt() {
    return new IconData(61504, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Notes() {
    return new IconData(57964, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NotificationAdd() {
    return new IconData(58265, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NotificationImportant() {
    return new IconData(57348, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Notifications() {
    return new IconData(59380, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NotificationsActive() {
    return new IconData(59383, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NotificationsNone() {
    return new IconData(59381, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NotificationsOff() {
    return new IconData(59382, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NotificationsOn() {
    return new IconData(59383, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NotificationsPaused() {
    return new IconData(59384, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NowWallpaper() {
    return new IconData(59231, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get NowWidgets() {
    return new IconData(59230, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Numbers() {
    return new IconData(60103, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get OfflineBolt() {
    return new IconData(59698, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get OfflinePin() {
    return new IconData(59658, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get OfflineShare() {
    return new IconData(59845, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get OndemandVideo() {
    return new IconData(58938, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get OnlinePrediction() {
    return new IconData(61675, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Opacity() {
    return new IconData(59676, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get OpenInBrowser() {
    return new IconData(59549, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get OpenInFull() {
    return new IconData(61902, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get OpenInNew() {
    return new IconData(59550, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get OpenInNewOff() {
    return new IconData(58614, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get OpenWith() {
    return new IconData(59551, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get OtherHouses() {
    return new IconData(58764, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Outbond() {
    return new IconData(61992, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Outbound() {
    return new IconData(57802, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Outbox() {
    return new IconData(61279, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get OutdoorGrill() {
    return new IconData(59975, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Outlet() {
    return new IconData(61908, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get OutlinedFlag() {
    return new IconData(57710, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Output() {
    return new IconData(60350, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Padding() {
    return new IconData(59848, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Pages() {
    return new IconData(59385, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Pageview() {
    return new IconData(59552, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Paid() {
    return new IconData(61505, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Palette() {
    return new IconData(58378, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PanTool() {
    return new IconData(59685, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PanToolAlt() {
    return new IconData(60345, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Panorama() {
    return new IconData(58379, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PanoramaFishEye() {
    return new IconData(58380, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PanoramaFisheye() {
    return new IconData(58380, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PanoramaHorizontal() {
    return new IconData(58381, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PanoramaHorizontalSelect() {
    return new IconData(61280, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PanoramaPhotosphere() {
    return new IconData(59849, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PanoramaPhotosphereSelect() {
    return new IconData(59850, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PanoramaVertical() {
    return new IconData(58382, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PanoramaVerticalSelect() {
    return new IconData(61281, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PanoramaWideAngle() {
    return new IconData(58383, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PanoramaWideAngleSelect() {
    return new IconData(61282, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Paragliding() {
    return new IconData(58639, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Park() {
    return new IconData(60003, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PartyMode() {
    return new IconData(59386, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Password() {
    return new IconData(61506, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Paste() {
    return new IconData(61592, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Pattern() {
    return new IconData(61507, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Pause() {
    return new IconData(57396, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PauseCircle() {
    return new IconData(57762, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PauseCircleFilled() {
    return new IconData(57397, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PauseCircleOutline() {
    return new IconData(57398, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PausePresentation() {
    return new IconData(57578, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Payment() {
    return new IconData(59553, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Payments() {
    return new IconData(61283, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Paypal() {
    return new IconData(60045, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PedalBike() {
    return new IconData(60201, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Pending() {
    return new IconData(61284, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PendingActions() {
    return new IconData(61883, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Pentagon() {
    return new IconData(60240, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get People() {
    return new IconData(59387, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PeopleAlt() {
    return new IconData(59937, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PeopleOutline() {
    return new IconData(59388, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Percent() {
    return new IconData(60248, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PermCameraMic() {
    return new IconData(59554, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PermContactCal() {
    return new IconData(59555, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PermContactCalendar() {
    return new IconData(59555, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PermDataSetting() {
    return new IconData(59556, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PermDeviceInfo() {
    return new IconData(59557, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PermDeviceInformation() {
    return new IconData(59557, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PermIdentity() {
    return new IconData(59558, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PermMedia() {
    return new IconData(59559, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PermPhoneMsg() {
    return new IconData(59560, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PermScanWifi() {
    return new IconData(59561, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Person() {
    return new IconData(59389, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PersonAdd() {
    return new IconData(59390, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PersonAddAlt() {
    return new IconData(59981, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PersonAddAlt1() {
    return new IconData(61285, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PersonAddDisabled() {
    return new IconData(59851, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PersonOff() {
    return new IconData(58640, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PersonOutline() {
    return new IconData(59391, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PersonPin() {
    return new IconData(58714, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PersonPinCircle() {
    return new IconData(58730, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PersonRemove() {
    return new IconData(61286, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PersonRemoveAlt1() {
    return new IconData(61287, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PersonSearch() {
    return new IconData(61702, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PersonalInjury() {
    return new IconData(59098, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PersonalVideo() {
    return new IconData(58939, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PestControl() {
    return new IconData(61690, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PestControlRodent() {
    return new IconData(61693, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Pets() {
    return new IconData(59677, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Phishing() {
    return new IconData(60119, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Phone() {
    return new IconData(57549, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhoneAndroid() {
    return new IconData(58148, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhoneBluetoothSpeaker() {
    return new IconData(58907, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhoneCallback() {
    return new IconData(58953, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhoneDisabled() {
    return new IconData(59852, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhoneEnabled() {
    return new IconData(59853, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhoneForwarded() {
    return new IconData(58908, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhoneInTalk() {
    return new IconData(58909, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhoneIphone() {
    return new IconData(58149, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhoneLocked() {
    return new IconData(58910, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhoneMissed() {
    return new IconData(58911, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhonePaused() {
    return new IconData(58912, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Phonelink() {
    return new IconData(58150, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhonelinkErase() {
    return new IconData(57563, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhonelinkLock() {
    return new IconData(57564, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhonelinkOff() {
    return new IconData(58151, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhonelinkRing() {
    return new IconData(57565, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhonelinkSetup() {
    return new IconData(57566, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Photo() {
    return new IconData(58384, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhotoAlbum() {
    return new IconData(58385, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhotoCamera() {
    return new IconData(58386, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhotoCameraBack() {
    return new IconData(61288, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhotoCameraFront() {
    return new IconData(61289, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhotoFilter() {
    return new IconData(58427, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhotoLibrary() {
    return new IconData(58387, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhotoSizeSelectActual() {
    return new IconData(58418, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhotoSizeSelectLarge() {
    return new IconData(58419, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PhotoSizeSelectSmall() {
    return new IconData(58420, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Php() {
    return new IconData(60303, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Piano() {
    return new IconData(58657, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PianoOff() {
    return new IconData(58656, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PictureAsPdf() {
    return new IconData(58389, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PictureInPicture() {
    return new IconData(59562, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PictureInPictureAlt() {
    return new IconData(59665, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PieChart() {
    return new IconData(59076, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PieChartOutline() {
    return new IconData(61508, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Pin() {
    return new IconData(61509, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PinDrop() {
    return new IconData(58718, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PinEnd() {
    return new IconData(59239, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PinInvoke() {
    return new IconData(59235, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Pinch() {
    return new IconData(60216, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PivotTableChart() {
    return new IconData(59854, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Pix() {
    return new IconData(60067, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Place() {
    return new IconData(58719, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Plagiarism() {
    return new IconData(59994, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PlayArrow() {
    return new IconData(57399, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PlayCircle() {
    return new IconData(57796, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PlayCircleFill() {
    return new IconData(57400, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PlayCircleFilled() {
    return new IconData(57400, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PlayCircleOutline() {
    return new IconData(57401, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PlayDisabled() {
    return new IconData(61290, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PlayForWork() {
    return new IconData(59654, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PlayLesson() {
    return new IconData(61511, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PlaylistAdd() {
    return new IconData(57403, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PlaylistAddCheck() {
    return new IconData(57445, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PlaylistAddCheckCircle() {
    return new IconData(59366, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PlaylistAddCircle() {
    return new IconData(59365, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PlaylistPlay() {
    return new IconData(57439, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PlaylistRemove() {
    return new IconData(60288, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Plumbing() {
    return new IconData(61703, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PlusOne() {
    return new IconData(59392, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Podcasts() {
    return new IconData(61512, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PointOfSale() {
    return new IconData(61822, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Policy() {
    return new IconData(59927, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Poll() {
    return new IconData(59393, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Polyline() {
    return new IconData(60347, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Polymer() {
    return new IconData(59563, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Pool() {
    return new IconData(60232, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PortableWifiOff() {
    return new IconData(57550, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Portrait() {
    return new IconData(58390, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PostAdd() {
    return new IconData(59936, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Power() {
    return new IconData(58940, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PowerInput() {
    return new IconData(58166, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PowerOff() {
    return new IconData(58950, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PowerSettingsNew() {
    return new IconData(59564, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PrecisionManufacturing() {
    return new IconData(61513, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PregnantWoman() {
    return new IconData(59678, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PresentToAll() {
    return new IconData(57567, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Preview() {
    return new IconData(61893, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PriceChange() {
    return new IconData(61514, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PriceCheck() {
    return new IconData(61515, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Print() {
    return new IconData(59565, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PrintDisabled() {
    return new IconData(59855, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PriorityHigh() {
    return new IconData(58949, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PrivacyTip() {
    return new IconData(61660, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PrivateConnectivity() {
    return new IconData(59204, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ProductionQuantityLimits() {
    return new IconData(57809, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Psychology() {
    return new IconData(59978, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Public() {
    return new IconData(59403, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PublicOff() {
    return new IconData(61898, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Publish() {
    return new IconData(57941, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PublishedWithChanges() {
    return new IconData(62002, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PunchClock() {
    return new IconData(60072, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get PushPin() {
    return new IconData(61709, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get QrCode() {
    return new IconData(61291, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get QrCode2() {
    return new IconData(57354, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get QrCodeScanner() {
    return new IconData(61958, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get QueryBuilder() {
    return new IconData(59566, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get QueryStats() {
    return new IconData(58620, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get QuestionAnswer() {
    return new IconData(59567, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get QuestionMark() {
    return new IconData(60299, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Queue() {
    return new IconData(57404, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get QueueMusic() {
    return new IconData(57405, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get QueuePlayNext() {
    return new IconData(57446, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get QuickContactsDialer() {
    return new IconData(57551, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get QuickContactsMail() {
    return new IconData(57552, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Quickreply() {
    return new IconData(61292, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Quiz() {
    return new IconData(61516, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Quora() {
    return new IconData(60056, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RMobiledata() {
    return new IconData(61517, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Radar() {
    return new IconData(61518, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Radio() {
    return new IconData(57406, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RadioButtonChecked() {
    return new IconData(59447, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RadioButtonOff() {
    return new IconData(59446, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RadioButtonOn() {
    return new IconData(59447, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RadioButtonUnchecked() {
    return new IconData(59446, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RailwayAlert() {
    return new IconData(59857, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RamenDining() {
    return new IconData(60004, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RampLeft() {
    return new IconData(60316, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RampRight() {
    return new IconData(60310, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RateReview() {
    return new IconData(58720, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RawOff() {
    return new IconData(61519, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RawOn() {
    return new IconData(61520, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ReadMore() {
    return new IconData(61293, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RealEstateAgent() {
    return new IconData(59194, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Receipt() {
    return new IconData(59568, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ReceiptLong() {
    return new IconData(61294, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RecentActors() {
    return new IconData(57407, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Recommend() {
    return new IconData(59858, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RecordVoiceOver() {
    return new IconData(59679, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Rectangle() {
    return new IconData(60244, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Recycling() {
    return new IconData(59232, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Reddit() {
    return new IconData(60064, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Redeem() {
    return new IconData(59569, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Redo() {
    return new IconData(57690, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ReduceCapacity() {
    return new IconData(61980, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Refresh() {
    return new IconData(58837, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RememberMe() {
    return new IconData(61521, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Remove() {
    return new IconData(57691, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RemoveCircle() {
    return new IconData(57692, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RemoveCircleOutline() {
    return new IconData(57693, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RemoveDone() {
    return new IconData(59859, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RemoveFromQueue() {
    return new IconData(57447, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RemoveModerator() {
    return new IconData(59860, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RemoveRedEye() {
    return new IconData(58391, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RemoveShoppingCart() {
    return new IconData(59688, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Reorder() {
    return new IconData(59646, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Repeat() {
    return new IconData(57408, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RepeatOn() {
    return new IconData(59862, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RepeatOne() {
    return new IconData(57409, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RepeatOneOn() {
    return new IconData(59863, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Replay() {
    return new IconData(57410, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Replay10() {
    return new IconData(57433, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Replay30() {
    return new IconData(57434, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Replay5() {
    return new IconData(57435, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ReplayCircleFilled() {
    return new IconData(59864, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Reply() {
    return new IconData(57694, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ReplyAll() {
    return new IconData(57695, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Report() {
    return new IconData(57696, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ReportGmailerrorred() {
    return new IconData(61522, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ReportOff() {
    return new IconData(57712, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ReportProblem() {
    return new IconData(59570, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RequestPage() {
    return new IconData(61996, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RequestQuote() {
    return new IconData(61878, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ResetTv() {
    return new IconData(59865, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RestartAlt() {
    return new IconData(61523, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Restaurant() {
    return new IconData(58732, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RestaurantMenu() {
    return new IconData(58721, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Restore() {
    return new IconData(59571, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RestoreFromTrash() {
    return new IconData(59704, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RestorePage() {
    return new IconData(59689, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Reviews() {
    return new IconData(61524, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RiceBowl() {
    return new IconData(61941, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RingVolume() {
    return new IconData(57553, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Rocket() {
    return new IconData(60325, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RocketLaunch() {
    return new IconData(60315, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RollerSkating() {
    return new IconData(60365, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Roofing() {
    return new IconData(61953, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Room() {
    return new IconData(59572, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RoomPreferences() {
    return new IconData(61880, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RoomService() {
    return new IconData(60233, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Rotate90DegreesCcw() {
    return new IconData(58392, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Rotate90DegreesCw() {
    return new IconData(60075, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RotateLeft() {
    return new IconData(58393, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RotateRight() {
    return new IconData(58394, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RoundaboutLeft() {
    return new IconData(60313, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RoundaboutRight() {
    return new IconData(60323, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RoundedCorner() {
    return new IconData(59680, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Route() {
    return new IconData(60109, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Router() {
    return new IconData(58152, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Rowing() {
    return new IconData(59681, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RssFeed() {
    return new IconData(57573, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Rsvp() {
    return new IconData(61525, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Rtt() {
    return new IconData(59821, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Rule() {
    return new IconData(61890, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RuleFolder() {
    return new IconData(61897, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RunCircle() {
    return new IconData(61295, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RunningWithErrors() {
    return new IconData(58653, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get RvHookup() {
    return new IconData(58946, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SafetyCheck() {
    return new IconData(60399, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SafetyDivider() {
    return new IconData(57804, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Sailing() {
    return new IconData(58626, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Sanitizer() {
    return new IconData(61981, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Satellite() {
    return new IconData(58722, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SatelliteAlt() {
    return new IconData(60218, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Save() {
    return new IconData(57697, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SaveAlt() {
    return new IconData(57713, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SaveAs() {
    return new IconData(60256, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SavedSearch() {
    return new IconData(59921, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Savings() {
    return new IconData(58091, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Scale() {
    return new IconData(60255, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Scanner() {
    return new IconData(58153, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ScatterPlot() {
    return new IconData(57960, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Schedule() {
    return new IconData(59573, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ScheduleSend() {
    return new IconData(59914, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Schema() {
    return new IconData(58621, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get School() {
    return new IconData(59404, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Science() {
    return new IconData(59979, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Score() {
    return new IconData(57961, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Scoreboard() {
    return new IconData(60368, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ScreenLockLandscape() {
    return new IconData(57790, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ScreenLockPortrait() {
    return new IconData(57791, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ScreenLockRotation() {
    return new IconData(57792, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ScreenRotation() {
    return new IconData(57793, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ScreenRotationAlt() {
    return new IconData(60398, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ScreenSearchDesktop() {
    return new IconData(61296, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ScreenShare() {
    return new IconData(57570, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Screenshot() {
    return new IconData(61526, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ScubaDiving() {
    return new IconData(60366, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Sd() {
    return new IconData(59869, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SdCard() {
    return new IconData(58915, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SdCardAlert() {
    return new IconData(61527, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SdStorage() {
    return new IconData(57794, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Search() {
    return new IconData(59574, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SearchOff() {
    return new IconData(60022, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Security() {
    return new IconData(58154, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SecurityUpdate() {
    return new IconData(61528, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SecurityUpdateGood() {
    return new IconData(61529, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SecurityUpdateWarning() {
    return new IconData(61530, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Segment() {
    return new IconData(59723, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SelectAll() {
    return new IconData(57698, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SelfImprovement() {
    return new IconData(60024, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Sell() {
    return new IconData(61531, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Send() {
    return new IconData(57699, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SendAndArchive() {
    return new IconData(59916, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SendTimeExtension() {
    return new IconData(60123, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SendToMobile() {
    return new IconData(61532, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SensorDoor() {
    return new IconData(61877, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SensorWindow() {
    return new IconData(61876, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Sensors() {
    return new IconData(58654, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SensorsOff() {
    return new IconData(58655, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SentimentDissatisfied() {
    return new IconData(59409, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SentimentNeutral() {
    return new IconData(59410, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SentimentSatisfied() {
    return new IconData(59411, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SentimentSatisfiedAlt() {
    return new IconData(57581, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SentimentVeryDissatisfied() {
    return new IconData(59412, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SentimentVerySatisfied() {
    return new IconData(59413, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SetMeal() {
    return new IconData(61930, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Settings() {
    return new IconData(59576, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsAccessibility() {
    return new IconData(61533, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsApplications() {
    return new IconData(59577, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsBackupRestore() {
    return new IconData(59578, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsBluetooth() {
    return new IconData(59579, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsBrightness() {
    return new IconData(59581, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsCell() {
    return new IconData(59580, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsDisplay() {
    return new IconData(59581, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsEthernet() {
    return new IconData(59582, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsInputAntenna() {
    return new IconData(59583, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsInputComponent() {
    return new IconData(59584, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsInputComposite() {
    return new IconData(59585, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsInputHdmi() {
    return new IconData(59586, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsInputSvideo() {
    return new IconData(59587, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsOverscan() {
    return new IconData(59588, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsPhone() {
    return new IconData(59589, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsPower() {
    return new IconData(59590, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsRemote() {
    return new IconData(59591, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsSuggest() {
    return new IconData(61534, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsSystemDaydream() {
    return new IconData(57795, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SettingsVoice() {
    return new IconData(59592, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SevereCold() {
    return new IconData(60371, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Share() {
    return new IconData(59405, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ShareArrivalTime() {
    return new IconData(58660, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ShareLocation() {
    return new IconData(61535, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Shield() {
    return new IconData(59872, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ShieldMoon() {
    return new IconData(60073, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Shop() {
    return new IconData(59593, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Shop2() {
    return new IconData(57758, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ShopTwo() {
    return new IconData(59594, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Shopify() {
    return new IconData(60061, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ShoppingBag() {
    return new IconData(61900, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ShoppingBasket() {
    return new IconData(59595, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ShoppingCart() {
    return new IconData(59596, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ShoppingCartCheckout() {
    return new IconData(60296, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ShortText() {
    return new IconData(57953, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Shortcut() {
    return new IconData(61536, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ShowChart() {
    return new IconData(59105, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Shower() {
    return new IconData(61537, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Shuffle() {
    return new IconData(57411, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ShuffleOn() {
    return new IconData(59873, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ShutterSpeed() {
    return new IconData(58429, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Sick() {
    return new IconData(61984, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignLanguage() {
    return new IconData(60389, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalCellular0Bar() {
    return new IconData(61608, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalCellular4Bar() {
    return new IconData(57800, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalCellularAlt() {
    return new IconData(57858, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalCellularAlt1Bar() {
    return new IconData(60383, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalCellularAlt2Bar() {
    return new IconData(60387, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalCellularConnectedNoInternet0Bar() {
    return new IconData(61612, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalCellularConnectedNoInternet4Bar() {
    return new IconData(57805, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalCellularNoSim() {
    return new IconData(57806, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalCellularNodata() {
    return new IconData(61538, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalCellularNull() {
    return new IconData(57807, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalCellularOff() {
    return new IconData(57808, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalWifi0Bar() {
    return new IconData(61616, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalWifi4Bar() {
    return new IconData(57816, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalWifi4BarLock() {
    return new IconData(57817, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalWifiBad() {
    return new IconData(61539, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalWifiConnectedNoInternet4() {
    return new IconData(61540, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalWifiOff() {
    return new IconData(57818, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalWifiStatusbar4Bar() {
    return new IconData(61541, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalWifiStatusbarConnectedNoInternet4() {
    return new IconData(61542, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SignalWifiStatusbarNull() {
    return new IconData(61543, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Signpost() {
    return new IconData(60305, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SimCard() {
    return new IconData(58155, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SimCardAlert() {
    return new IconData(58916, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SimCardDownload() {
    return new IconData(61544, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SingleBed() {
    return new IconData(59976, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Sip() {
    return new IconData(61545, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Skateboarding() {
    return new IconData(58641, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SkipNext() {
    return new IconData(57412, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SkipPrevious() {
    return new IconData(57413, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Sledding() {
    return new IconData(58642, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Slideshow() {
    return new IconData(58395, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SlowMotionVideo() {
    return new IconData(57448, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SmartButton() {
    return new IconData(61889, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SmartDisplay() {
    return new IconData(61546, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SmartScreen() {
    return new IconData(61547, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SmartToy() {
    return new IconData(61548, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Smartphone() {
    return new IconData(58156, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SmokeFree() {
    return new IconData(60234, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SmokingRooms() {
    return new IconData(60235, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Sms() {
    return new IconData(58917, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SmsFailed() {
    return new IconData(58918, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Snapchat() {
    return new IconData(60014, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SnippetFolder() {
    return new IconData(61895, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Snooze() {
    return new IconData(57414, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Snowboarding() {
    return new IconData(58643, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Snowmobile() {
    return new IconData(58627, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Snowshoeing() {
    return new IconData(58644, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Soap() {
    return new IconData(61874, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SocialDistance() {
    return new IconData(57803, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Sort() {
    return new IconData(57700, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SortByAlpha() {
    return new IconData(57427, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Sos() {
    return new IconData(60407, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SoupKitchen() {
    return new IconData(59347, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Source() {
    return new IconData(61892, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get South() {
    return new IconData(61923, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SouthAmerica() {
    return new IconData(59364, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SouthEast() {
    return new IconData(61924, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SouthWest() {
    return new IconData(61925, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Spa() {
    return new IconData(60236, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SpaceBar() {
    return new IconData(57942, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SpaceDashboard() {
    return new IconData(58987, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SpatialAudio() {
    return new IconData(60395, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SpatialAudioOff() {
    return new IconData(60392, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SpatialTracking() {
    return new IconData(60394, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Speaker() {
    return new IconData(58157, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SpeakerGroup() {
    return new IconData(58158, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SpeakerNotes() {
    return new IconData(59597, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SpeakerNotesOff() {
    return new IconData(59690, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SpeakerPhone() {
    return new IconData(57554, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Speed() {
    return new IconData(59876, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Spellcheck() {
    return new IconData(59598, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Splitscreen() {
    return new IconData(61549, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Spoke() {
    return new IconData(59815, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Sports() {
    return new IconData(59952, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsBar() {
    return new IconData(61939, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsBaseball() {
    return new IconData(59985, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsBasketball() {
    return new IconData(59942, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsCricket() {
    return new IconData(59943, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsEsports() {
    return new IconData(59944, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsFootball() {
    return new IconData(59945, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsGolf() {
    return new IconData(59946, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsGymnastics() {
    return new IconData(60356, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsHandball() {
    return new IconData(59955, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsHockey() {
    return new IconData(59947, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsKabaddi() {
    return new IconData(59956, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsMartialArts() {
    return new IconData(60137, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsMma() {
    return new IconData(59948, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsMotorsports() {
    return new IconData(59949, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsRugby() {
    return new IconData(59950, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsScore() {
    return new IconData(61550, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsSoccer() {
    return new IconData(59951, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsTennis() {
    return new IconData(59954, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SportsVolleyball() {
    return new IconData(59953, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Square() {
    return new IconData(60214, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SquareFoot() {
    return new IconData(59977, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SsidChart() {
    return new IconData(60262, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StackedBarChart() {
    return new IconData(59878, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StackedLineChart() {
    return new IconData(61995, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Stadium() {
    return new IconData(60304, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Stairs() {
    return new IconData(61865, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Star() {
    return new IconData(59448, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StarBorder() {
    return new IconData(59450, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StarBorderPurple500() {
    return new IconData(61593, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StarHalf() {
    return new IconData(59449, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StarOutline() {
    return new IconData(61551, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StarPurple500() {
    return new IconData(61594, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StarRate() {
    return new IconData(61676, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Stars() {
    return new IconData(59600, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Start() {
    return new IconData(57481, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StayCurrentLandscape() {
    return new IconData(57555, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StayCurrentPortrait() {
    return new IconData(57556, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StayPrimaryLandscape() {
    return new IconData(57557, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StayPrimaryPortrait() {
    return new IconData(57558, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StickyNote2() {
    return new IconData(61948, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Stop() {
    return new IconData(57415, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StopCircle() {
    return new IconData(61297, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StopScreenShare() {
    return new IconData(57571, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Storage() {
    return new IconData(57819, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Store() {
    return new IconData(59601, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StoreMallDirectory() {
    return new IconData(58723, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Storefront() {
    return new IconData(59922, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Storm() {
    return new IconData(61552, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Straight() {
    return new IconData(60309, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Straighten() {
    return new IconData(58396, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Stream() {
    return new IconData(59881, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Streetview() {
    return new IconData(58734, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get StrikethroughS() {
    return new IconData(57943, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Stroller() {
    return new IconData(61870, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Style() {
    return new IconData(58397, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SubdirectoryArrowLeft() {
    return new IconData(58841, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SubdirectoryArrowRight() {
    return new IconData(58842, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Subject() {
    return new IconData(59602, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Subscript() {
    return new IconData(61713, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Subscriptions() {
    return new IconData(57444, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Subtitles() {
    return new IconData(57416, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SubtitlesOff() {
    return new IconData(61298, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Subway() {
    return new IconData(58735, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Summarize() {
    return new IconData(61553, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Superscript() {
    return new IconData(61714, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SupervisedUserCircle() {
    return new IconData(59705, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SupervisorAccount() {
    return new IconData(59603, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Support() {
    return new IconData(61299, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SupportAgent() {
    return new IconData(61666, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Surfing() {
    return new IconData(58645, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SurroundSound() {
    return new IconData(57417, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwapCalls() {
    return new IconData(57559, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwapHoriz() {
    return new IconData(59604, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwapHorizontalCircle() {
    return new IconData(59699, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwapVert() {
    return new IconData(59605, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwapVertCircle() {
    return new IconData(59606, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwapVerticalCircle() {
    return new IconData(59606, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Swipe() {
    return new IconData(59884, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwipeDown() {
    return new IconData(60243, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwipeDownAlt() {
    return new IconData(60208, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwipeLeft() {
    return new IconData(60249, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwipeLeftAlt() {
    return new IconData(60211, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwipeRight() {
    return new IconData(60242, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwipeRightAlt() {
    return new IconData(60246, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwipeUp() {
    return new IconData(60206, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwipeUpAlt() {
    return new IconData(60213, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwipeVertical() {
    return new IconData(60241, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwitchAccessShortcut() {
    return new IconData(59361, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwitchAccessShortcutAdd() {
    return new IconData(59362, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwitchAccount() {
    return new IconData(59885, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwitchCamera() {
    return new IconData(58398, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwitchLeft() {
    return new IconData(61905, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwitchRight() {
    return new IconData(61906, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SwitchVideo() {
    return new IconData(58399, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Synagogue() {
    return new IconData(60080, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Sync() {
    return new IconData(58919, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SyncAlt() {
    return new IconData(59928, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SyncDisabled() {
    return new IconData(58920, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SyncLock() {
    return new IconData(60142, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SyncProblem() {
    return new IconData(58921, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SystemSecurityUpdate() {
    return new IconData(61554, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SystemSecurityUpdateGood() {
    return new IconData(61555, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SystemSecurityUpdateWarning() {
    return new IconData(61556, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SystemUpdate() {
    return new IconData(58922, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SystemUpdateAlt() {
    return new IconData(59607, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get SystemUpdateTv() {
    return new IconData(59607, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Tab() {
    return new IconData(59608, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TabUnselected() {
    return new IconData(59609, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TableBar() {
    return new IconData(60114, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TableChart() {
    return new IconData(57957, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TableRestaurant() {
    return new IconData(60102, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TableRows() {
    return new IconData(61697, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TableView() {
    return new IconData(61886, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Tablet() {
    return new IconData(58159, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TabletAndroid() {
    return new IconData(58160, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TabletMac() {
    return new IconData(58161, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Tag() {
    return new IconData(59887, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TagFaces() {
    return new IconData(58400, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TakeoutDining() {
    return new IconData(60020, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TapAndPlay() {
    return new IconData(58923, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Tapas() {
    return new IconData(61929, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Task() {
    return new IconData(61557, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TaskAlt() {
    return new IconData(58086, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TaxiAlert() {
    return new IconData(61300, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Telegram() {
    return new IconData(60011, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TempleBuddhist() {
    return new IconData(60083, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TempleHindu() {
    return new IconData(60079, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Terminal() {
    return new IconData(60302, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Terrain() {
    return new IconData(58724, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TextDecrease() {
    return new IconData(60125, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TextFields() {
    return new IconData(57954, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TextFormat() {
    return new IconData(57701, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TextIncrease() {
    return new IconData(60130, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TextRotateUp() {
    return new IconData(59706, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TextRotateVertical() {
    return new IconData(59707, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TextRotationAngledown() {
    return new IconData(59708, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TextRotationAngleup() {
    return new IconData(59709, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TextRotationDown() {
    return new IconData(59710, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TextRotationNone() {
    return new IconData(59711, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TextSnippet() {
    return new IconData(61894, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Textsms() {
    return new IconData(57560, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Texture() {
    return new IconData(58401, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TheaterComedy() {
    return new IconData(60006, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Theaters() {
    return new IconData(59610, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Thermostat() {
    return new IconData(61558, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ThermostatAuto() {
    return new IconData(61559, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ThumbDown() {
    return new IconData(59611, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ThumbDownAlt() {
    return new IconData(59414, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ThumbDownOffAlt() {
    return new IconData(59890, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ThumbUp() {
    return new IconData(59612, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ThumbUpAlt() {
    return new IconData(59415, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ThumbUpOffAlt() {
    return new IconData(59891, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ThumbsUpDown() {
    return new IconData(59613, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Thunderstorm() {
    return new IconData(60379, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Tiktok() {
    return new IconData(60030, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TimeToLeave() {
    return new IconData(58924, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Timelapse() {
    return new IconData(58402, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Timeline() {
    return new IconData(59682, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Timer() {
    return new IconData(58405, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Timer10() {
    return new IconData(58403, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Timer10Select() {
    return new IconData(61562, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Timer3() {
    return new IconData(58404, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Timer3Select() {
    return new IconData(61563, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TimerOff() {
    return new IconData(58406, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TipsAndUpdates() {
    return new IconData(59290, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TireRepair() {
    return new IconData(60360, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Title() {
    return new IconData(57956, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Toc() {
    return new IconData(59614, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Today() {
    return new IconData(59615, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ToggleOff() {
    return new IconData(59893, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ToggleOn() {
    return new IconData(59894, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Token() {
    return new IconData(59941, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Toll() {
    return new IconData(59616, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Tonality() {
    return new IconData(58407, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Topic() {
    return new IconData(61896, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TouchApp() {
    return new IconData(59667, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Tour() {
    return new IconData(61301, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Toys() {
    return new IconData(58162, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TrackChanges() {
    return new IconData(59617, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Traffic() {
    return new IconData(58725, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Train() {
    return new IconData(58736, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Tram() {
    return new IconData(58737, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TransferWithinAStation() {
    return new IconData(58738, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Transform() {
    return new IconData(58408, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Transgender() {
    return new IconData(58765, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TransitEnterexit() {
    return new IconData(58745, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Translate() {
    return new IconData(59618, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TravelExplore() {
    return new IconData(58075, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TrendingDown() {
    return new IconData(59619, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TrendingFlat() {
    return new IconData(59620, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TrendingNeutral() {
    return new IconData(59620, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TrendingUp() {
    return new IconData(59621, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TripOrigin() {
    return new IconData(58747, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Try() {
    return new IconData(61564, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Tsunami() {
    return new IconData(60376, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Tty() {
    return new IconData(61866, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Tune() {
    return new IconData(58409, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Tungsten() {
    return new IconData(61565, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TurnLeft() {
    return new IconData(60326, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TurnRight() {
    return new IconData(60331, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TurnSharpLeft() {
    return new IconData(60327, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TurnSharpRight() {
    return new IconData(60330, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TurnSlightLeft() {
    return new IconData(60324, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TurnSlightRight() {
    return new IconData(60314, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TurnedIn() {
    return new IconData(59622, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TurnedInNot() {
    return new IconData(59623, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Tv() {
    return new IconData(58163, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TvOff() {
    return new IconData(58951, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get TwoWheeler() {
    return new IconData(59897, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get UTurnLeft() {
    return new IconData(60321, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get UTurnRight() {
    return new IconData(60322, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Umbrella() {
    return new IconData(61869, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Unarchive() {
    return new IconData(57705, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Undo() {
    return new IconData(57702, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get UnfoldLess() {
    return new IconData(58838, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get UnfoldMore() {
    return new IconData(58839, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Unpublished() {
    return new IconData(62006, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Unsubscribe() {
    return new IconData(57579, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Upcoming() {
    return new IconData(61566, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Update() {
    return new IconData(59683, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get UpdateDisabled() {
    return new IconData(57461, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Upgrade() {
    return new IconData(61691, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Upload() {
    return new IconData(61595, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get UploadFile() {
    return new IconData(59900, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Usb() {
    return new IconData(57824, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get UsbOff() {
    return new IconData(58618, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Vaccines() {
    return new IconData(57656, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VapeFree() {
    return new IconData(60358, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VapingRooms() {
    return new IconData(60367, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Verified() {
    return new IconData(61302, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VerifiedUser() {
    return new IconData(59624, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VerticalAlignBottom() {
    return new IconData(57944, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VerticalAlignCenter() {
    return new IconData(57945, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VerticalAlignTop() {
    return new IconData(57946, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VerticalDistribute() {
    return new IconData(57462, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VerticalSplit() {
    return new IconData(59721, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Vibration() {
    return new IconData(58925, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VideoCall() {
    return new IconData(57456, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VideoCameraBack() {
    return new IconData(61567, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VideoCameraFront() {
    return new IconData(61568, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VideoCollection() {
    return new IconData(57418, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VideoFile() {
    return new IconData(60295, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VideoLabel() {
    return new IconData(57457, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VideoLibrary() {
    return new IconData(57418, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VideoSettings() {
    return new IconData(60021, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VideoStable() {
    return new IconData(61569, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Videocam() {
    return new IconData(57419, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VideocamOff() {
    return new IconData(57420, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VideogameAsset() {
    return new IconData(58168, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VideogameAssetOff() {
    return new IconData(58624, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewAgenda() {
    return new IconData(59625, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewArray() {
    return new IconData(59626, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewCarousel() {
    return new IconData(59627, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewColumn() {
    return new IconData(59628, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewComfortable() {
    return new IconData(58410, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewComfy() {
    return new IconData(58410, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewComfyAlt() {
    return new IconData(60275, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewCompact() {
    return new IconData(58411, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewCompactAlt() {
    return new IconData(60276, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewCozy() {
    return new IconData(60277, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewDay() {
    return new IconData(59629, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewHeadline() {
    return new IconData(59630, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewInAr() {
    return new IconData(59902, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewKanban() {
    return new IconData(60287, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewList() {
    return new IconData(59631, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewModule() {
    return new IconData(59632, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewQuilt() {
    return new IconData(59633, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewSidebar() {
    return new IconData(61716, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewStream() {
    return new IconData(59634, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewTimeline() {
    return new IconData(60293, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ViewWeek() {
    return new IconData(59635, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Vignette() {
    return new IconData(58421, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Villa() {
    return new IconData(58758, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Visibility() {
    return new IconData(59636, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VisibilityOff() {
    return new IconData(59637, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VoiceChat() {
    return new IconData(58926, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VoiceOverOff() {
    return new IconData(59722, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Voicemail() {
    return new IconData(57561, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Volcano() {
    return new IconData(60378, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VolumeDown() {
    return new IconData(57421, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VolumeMute() {
    return new IconData(57422, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VolumeOff() {
    return new IconData(57423, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VolumeUp() {
    return new IconData(57424, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VolunteerActivism() {
    return new IconData(60016, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VpnKey() {
    return new IconData(57562, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VpnKeyOff() {
    return new IconData(60282, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get VpnLock() {
    return new IconData(58927, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Vrpano() {
    return new IconData(61570, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WalletGiftcard() {
    return new IconData(59638, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WalletMembership() {
    return new IconData(59639, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WalletTravel() {
    return new IconData(59640, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Wallpaper() {
    return new IconData(59231, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Warehouse() {
    return new IconData(60344, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Warning() {
    return new IconData(57346, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WarningAmber() {
    return new IconData(61571, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Wash() {
    return new IconData(61873, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Watch() {
    return new IconData(58164, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WatchLater() {
    return new IconData(59684, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WatchOff() {
    return new IconData(60131, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Water() {
    return new IconData(61572, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WaterDamage() {
    return new IconData(61955, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WaterDrop() {
    return new IconData(59288, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WaterfallChart() {
    return new IconData(59904, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Waves() {
    return new IconData(57718, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WavingHand() {
    return new IconData(59238, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WbAuto() {
    return new IconData(58412, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WbCloudy() {
    return new IconData(58413, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WbIncandescent() {
    return new IconData(58414, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WbIridescent() {
    return new IconData(58422, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WbShade() {
    return new IconData(59905, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WbSunny() {
    return new IconData(58416, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WbTwilight() {
    return new IconData(57798, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Wc() {
    return new IconData(58941, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Web() {
    return new IconData(57425, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WebAsset() {
    return new IconData(57449, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WebAssetOff() {
    return new IconData(58615, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Webhook() {
    return new IconData(60306, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Wechat() {
    return new IconData(60033, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Weekend() {
    return new IconData(57707, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get West() {
    return new IconData(61926, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Whatsapp() {
    return new IconData(60060, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Whatshot() {
    return new IconData(59406, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WheelchairPickup() {
    return new IconData(61867, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WhereToVote() {
    return new IconData(57719, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Widgets() {
    return new IconData(59230, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Wifi() {
    return new IconData(58942, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Wifi1Bar() {
    return new IconData(58570, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Wifi2Bar() {
    return new IconData(58585, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WifiCalling() {
    return new IconData(61303, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WifiCalling3() {
    return new IconData(61573, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WifiChannel() {
    return new IconData(60266, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WifiFind() {
    return new IconData(60209, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WifiLock() {
    return new IconData(57825, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WifiOff() {
    return new IconData(58952, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WifiPassword() {
    return new IconData(60267, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WifiProtectedSetup() {
    return new IconData(61692, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WifiTethering() {
    return new IconData(57826, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WifiTetheringError() {
    return new IconData(61574, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WifiTetheringErrorRounded() {
    return new IconData(61574, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WifiTetheringOff() {
    return new IconData(61575, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Window() {
    return new IconData(61576, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WineBar() {
    return new IconData(61928, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Woman() {
    return new IconData(57662, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WooCommerce() {
    return new IconData(60013, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Wordpress() {
    return new IconData(60063, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Work() {
    return new IconData(59641, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WorkOff() {
    return new IconData(59714, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WorkOutline() {
    return new IconData(59715, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WorkspacePremium() {
    return new IconData(59311, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Workspaces() {
    return new IconData(57760, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WrapText() {
    return new IconData(57947, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get WrongLocation() {
    return new IconData(61304, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Wysiwyg() {
    return new IconData(61891, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get Yard() {
    return new IconData(61577, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get YoutubeSearchedFor() {
    return new IconData(59642, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ZoomIn() {
    return new IconData(59647, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ZoomInMap() {
    return new IconData(60205, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ZoomOut() {
    return new IconData(59648, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
  get ZoomOutMap() {
    return new IconData(58731, _MaterialIconsOutlined.FontFamily, _MaterialIconsOutlined.AssemblyName, _MaterialIconsOutlined.AssetPath);
  }
};
let MaterialIconsOutlined = _MaterialIconsOutlined;
__publicField(MaterialIconsOutlined, "FontFamily", "Material Icons Outlined");
__publicField(MaterialIconsOutlined, "AssemblyName", "PixUI");
__publicField(MaterialIconsOutlined, "AssetPath", "MaterialIconsOutlined.woff2");
class Icons {
}
__publicField(Icons, "Filled", new MaterialIcons());
__publicField(Icons, "Outlined", new MaterialIconsOutlined());
class IconPainter {
  constructor(onFontLoaded) {
    __publicField(this, "_onFontLoaded");
    __publicField(this, "_cachedFont");
    __publicField(this, "_cachedGlyphId", 0);
    __publicField(this, "_loading", false);
    this._onFontLoaded = onFontLoaded;
  }
  Paint(canvas, size, color, data, offsetX = 0, offsetY = 0) {
    if (this._cachedFont == null) {
      let typeface = FontCollection.Instance.TryMatchFamilyFromAsset(data.FontFamily);
      if (typeface == null && !this._loading) {
        this._loading = true;
        FontCollection.Instance.StartLoadFontFromAsset(data.AssemblyName, data.AssetPath, data.FontFamily);
        FontCollection.Instance.FontChanged.Add(this._OnFontChanged, this);
        return;
      }
      this._cachedFont = new CanvasKit.Font(typeface, size);
      this._cachedGlyphId = this._cachedFont.getGlyphIDs(String.fromCharCode(data.CodePoint))[0];
    }
    let paint = PaintUtils.Shared(color);
    canvas.drawGlyphs([this._cachedGlyphId], [offsetX, size + offsetY], 0, 0, this._cachedFont, paint);
  }
  _OnFontChanged() {
    FontCollection.Instance.FontChanged.Remove(this._OnFontChanged, this);
    this._onFontLoaded();
  }
  Reset() {
    var _a;
    (_a = this._cachedFont) == null ? void 0 : _a.delete();
    this._cachedFont = null;
    this._cachedGlyphId = 0;
    this._loading = false;
  }
  Dispose() {
    var _a;
    (_a = this._cachedFont) == null ? void 0 : _a.delete();
  }
}
class Icon extends Widget {
  constructor(data) {
    super();
    __publicField(this, "_data");
    __publicField(this, "_size");
    __publicField(this, "_color");
    __publicField(this, "_painter");
    this._painter = new IconPainter(this.OnIconFontLoaded.bind(this));
    this._data = this.Bind(data, BindingOptions.AffectsVisual);
  }
  get Size() {
    return this._size;
  }
  set Size(value) {
    this._size = this.Rebind(this._size, value, BindingOptions.AffectsLayout);
  }
  get Color() {
    return this._color;
  }
  set Color(value) {
    this._color = this.Rebind(this._color, value, BindingOptions.AffectsVisual);
  }
  OnIconFontLoaded() {
    var _a;
    if (!this.IsMounted)
      (_a = this.Parent) == null ? void 0 : _a.Invalidate(InvalidAction.Repaint, new RepaintArea(Rect.FromLTWH(this.X, this.Y, this.W, this.H)));
    else
      this.Invalidate(InvalidAction.Repaint);
  }
  OnStateChanged(state, options) {
    if (state === this._data || state === this._size) {
      this._painter.Reset();
    }
    super.OnStateChanged(state, options);
  }
  Layout(availableWidth, availableHeight) {
    var _a, _b;
    let size = (_b = (_a = this._size) == null ? void 0 : _a.Value) != null ? _b : Theme.DefaultFontSize;
    this.SetSize(Math.max(0, Math.min(availableWidth, size)), Math.max(0, Math.min(availableHeight, size)));
  }
  Paint(canvas, area = null) {
    var _a, _b, _c, _d;
    let size = (_b = (_a = this._size) == null ? void 0 : _a.Value) != null ? _b : Theme.DefaultFontSize;
    let color = (_d = (_c = this._color) == null ? void 0 : _c.Value) != null ? _d : new Color(4284441448);
    this._painter.Paint(canvas, size, color, this._data.Value);
  }
  Dispose() {
    this._painter.Dispose();
    super.Dispose();
  }
}
var MenuItemType = /* @__PURE__ */ ((MenuItemType2) => {
  MenuItemType2[MenuItemType2["MenuItem"] = 0] = "MenuItem";
  MenuItemType2[MenuItemType2["SubMenu"] = 1] = "SubMenu";
  MenuItemType2[MenuItemType2["Divider"] = 2] = "Divider";
  return MenuItemType2;
})(MenuItemType || {});
const _MenuItem = class {
  constructor(type, label = null, icon = null, action = null, children = null, enabled = true) {
    __privateAdd(this, _Type, 0);
    __publicField(this, "Icon");
    __publicField(this, "Label");
    __publicField(this, "Enabled", false);
    __publicField(this, "Action");
    __privateAdd(this, _Children, void 0);
    this.Type = type;
    this.Label = label;
    this.Icon = icon;
    this.Action = action;
    this.Children = new System.List(children);
    this.Enabled = enabled;
  }
  get Type() {
    return __privateGet(this, _Type);
  }
  set Type(value) {
    __privateSet(this, _Type, value);
  }
  get Children() {
    return __privateGet(this, _Children);
  }
  set Children(value) {
    __privateSet(this, _Children, value);
  }
  static Item(label, icon = null, action = null) {
    return new _MenuItem(0, label, icon, action);
  }
  static SubMenu(label, icon, children) {
    return new _MenuItem(1, label, icon, null, children);
  }
  static Divider() {
    return new _MenuItem(2);
  }
};
let MenuItem = _MenuItem;
_Type = new WeakMap();
_Children = new WeakMap();
class MenuController {
  constructor() {
    __publicField(this, "TextColor", State.op_Implicit_From(Colors.Black));
    __publicField(this, "BackgroundColor", new Color(200, 200, 200));
    __publicField(this, "HoverColor", Theme.AccentColor);
    __publicField(this, "HoverTextColor", Colors.White);
    __publicField(this, "_popupMenuStack");
  }
  get ItemPadding() {
    return EdgeInsets.Only(8, 5, 8, 5);
  }
  get PopupItemHeight() {
    return 30;
  }
  set Color(value) {
    this.TextColor.Value = value;
  }
  OnMenuItemHoverChanged(item, hover) {
    var _a;
    if (!hover)
      return;
    if (this._popupMenuStack != null && this._popupMenuStack.TryCloseSome(item))
      return;
    if (item.MenuItem.Type == MenuItemType.SubMenu) {
      (_a = this._popupMenuStack) != null ? _a : this._popupMenuStack = new PopupMenuStack(item.Overlay, this.CloseAll.bind(this));
      let popupMenu = new PopupMenu(item, null, item.Depth + 1, this);
      let relativeToWinPt = item.LocalToWindow(0, 0);
      if (item.Parent instanceof PopupMenu)
        popupMenu.SetPosition(relativeToWinPt.X + item.W, relativeToWinPt.Y);
      else
        popupMenu.SetPosition(relativeToWinPt.X, relativeToWinPt.Y + item.H);
      let win = item.Root.Window;
      popupMenu.Layout(win.Width, win.Height);
      this._popupMenuStack.Add(popupMenu);
    }
    if (this._popupMenuStack != null && !this._popupMenuStack.HasChild)
      this.CloseAll();
  }
  ShowContextMenu(menuItems) {
    var _a;
    let win = UIWindow.Current;
    let winX = win.LastMouseX;
    let winY = win.LastMouseY;
    (_a = this._popupMenuStack) != null ? _a : this._popupMenuStack = new PopupMenuStack(win.Overlay, this.CloseAll.bind(this));
    let popupMenu = new PopupMenu(null, menuItems, 1, this);
    popupMenu.Layout(win.Width, win.Height);
    popupMenu.SetPosition(winX, winY);
    this._popupMenuStack.Add(popupMenu);
  }
  CloseAll() {
    var _a;
    (_a = this._popupMenuStack) == null ? void 0 : _a.Hide();
    this._popupMenuStack = null;
  }
}
class MainMenu extends Widget {
  constructor(items) {
    super();
    __publicField(this, "_children");
    __publicField(this, "_controller");
    this._children = new System.List(items.length);
    this._controller = new MenuController();
    this.BuildMenuItemWidgets(items);
  }
  set BackgroudColor(value) {
    this._controller.BackgroundColor = value;
  }
  set Color(value) {
    this._controller.Color = value;
  }
  BuildMenuItemWidgets(items) {
    for (const item of items) {
      let child = new MenuItemWidget(item, 0, false, this._controller);
      child.Parent = this;
      this._children.Add(child);
    }
  }
  VisitChildren(action) {
    for (const child of this._children) {
      if (action(child))
        break;
    }
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    this.SetSize(width, height);
    if (this.HasLayout)
      return;
    this.HasLayout = true;
    let offsetX = 0;
    for (const child of this._children) {
      child.Layout(Number.POSITIVE_INFINITY, height);
      child.SetPosition(offsetX, 0);
      offsetX += child.W;
    }
  }
}
const _MenuItemWidget = class extends Widget {
  constructor(menuItem, depth, inPopup, controller) {
    super();
    __publicField(this, "MenuItem");
    __publicField(this, "Depth");
    __publicField(this, "_controller");
    __publicField(this, "_icon");
    __publicField(this, "_label");
    __publicField(this, "_expander");
    __publicField(this, "_isHover", false);
    __privateAdd(this, _MouseRegion7, void 0);
    this.Depth = depth;
    this.MenuItem = menuItem;
    this._controller = controller;
    this.BuildChildren(inPopup);
    this.MouseRegion = new MouseRegion(() => Cursors.Hand);
    this.MouseRegion.HoverChanged.Add(this._OnHoverChanged, this);
    this.MouseRegion.PointerUp.Add(this._OnPointerUp, this);
  }
  get MouseRegion() {
    return __privateGet(this, _MouseRegion7);
  }
  set MouseRegion(value) {
    __privateSet(this, _MouseRegion7, value);
  }
  BuildChildren(inPopup) {
    if (this.MenuItem.Type == MenuItemType.Divider)
      return;
    if (this.MenuItem.Icon != null) {
      this._icon = new Icon(State.op_Implicit_From(this.MenuItem.Icon)).Init({ Color: this._controller.TextColor });
      this._icon.Parent = this;
    }
    this._label = new Text(State.op_Implicit_From(this.MenuItem.Label)).Init({ TextColor: this._controller.TextColor });
    this._label.Parent = this;
    if (this.MenuItem.Type == MenuItemType.SubMenu) {
      this._expander = new Icon(State.op_Implicit_From(inPopup ? Icons.Filled.ChevronRight : Icons.Filled.ExpandMore)).Init({ Color: this._controller.TextColor });
      this._expander.Parent = this;
    }
  }
  _OnPointerUp(e) {
    if (this.MenuItem.Type == MenuItemType.MenuItem && this.MenuItem.Action != null) {
      this.MenuItem.Action();
    }
    this._controller.CloseAll();
  }
  _OnHoverChanged(hover) {
    if (this.MenuItem.Type == MenuItemType.Divider)
      return;
    this._isHover = hover;
    this.Invalidate(InvalidAction.Repaint);
    this._controller.OnMenuItemHoverChanged(this, hover);
  }
  ResetWidth(newWidth) {
    this.SetSize(newWidth, this.H);
    if (this._expander != null) {
      let newX = this.W - this._controller.ItemPadding.Right - this._expander.W;
      this._expander.SetPosition(newX, this._expander.Y);
    }
  }
  VisitChildren(action) {
    if (this._icon != null)
      action(this._icon);
    if (this._expander != null)
      action(this._expander);
  }
  HitTest(x, y, result) {
    if (!this.ContainsPoint(x, y))
      return false;
    result.Add(this);
    return true;
  }
  Layout(availableWidth, availableHeight) {
    let offsetX = this._controller.ItemPadding.Left;
    if (this.MenuItem.Type == MenuItemType.Divider) {
      this.SetSize(offsetX + 2, 6);
      return;
    }
    if (this._icon != null) {
      this._icon.Layout(availableWidth, availableHeight);
      this._icon.SetPosition(offsetX, (availableHeight - this._icon.H) / 2);
      offsetX += this._icon.W + 5;
    }
    if (this._label != null) {
      this._label.Layout(availableWidth, availableHeight);
      this._label.SetPosition(offsetX, (availableHeight - this._label.H) / 2);
      offsetX += this._label.W + 5;
    }
    if (this._expander != null) {
      this._expander.Layout(availableWidth, availableHeight);
      this._expander.SetPosition(offsetX, (availableHeight - this._expander.H) / 2);
      offsetX += this._expander.W;
    }
    this.SetSize(offsetX + this._controller.ItemPadding.Right, availableHeight);
  }
  Paint(canvas, area = null) {
    if (this.MenuItem.Type == MenuItemType.Divider) {
      let paint = PaintUtils.Shared(Colors.Gray, CanvasKit.PaintStyle.Stroke, 2);
      let midY = this.H / 2;
      canvas.drawLine(this._controller.ItemPadding.Left, midY, this.W - this._controller.ItemPadding.Horizontal, midY, paint);
      return;
    }
    if (this._isHover) {
      let paint = PaintUtils.Shared(this._controller.HoverColor, CanvasKit.PaintStyle.Fill);
      canvas.drawRect(Rect.FromLTWH(0, 0, this.W, this.H), paint);
    }
    _MenuItemWidget.PaintChild(this._icon, canvas, area);
    _MenuItemWidget.PaintChild(this._label, canvas, area);
    _MenuItemWidget.PaintChild(this._expander, canvas, area);
  }
  static PaintChild(child, canvas, area) {
    if (child == null)
      return;
    canvas.translate(child.X, child.Y);
    child.Paint(canvas, area);
    canvas.translate(-child.X, -child.Y);
  }
  toString() {
    let labelText = this._label == null ? "" : this._label.Text.Value;
    return `MenuItemWidget["${labelText}"]`;
  }
};
let MenuItemWidget = _MenuItemWidget;
_MouseRegion7 = new WeakMap();
__publicField(MenuItemWidget, "$meta_PixUI_IMouseRegion", true);
class PopupMenuStack extends Popup {
  constructor(overlay, closeAll) {
    super(overlay);
    __publicField(this, "_closeAll");
    __publicField(this, "_children", new System.List());
    this._closeAll = closeAll;
  }
  get HasChild() {
    return this._children.length > 0;
  }
  Add(child) {
    child.Parent = this;
    this._children.Add(child);
    if (this._children.length == 1)
      this.Show();
    else
      this.Invalidate(InvalidAction.Repaint);
  }
  TryCloseSome(newHoverItem) {
    for (let i = this._children.length - 1; i >= 0; i--) {
      if (newHoverItem === this._children[i].Owner) {
        this.CloseTo(newHoverItem.Depth);
        return true;
      }
    }
    let lastMenuItem = this._children[this._children.length - 1].Owner;
    if (newHoverItem.Depth == (lastMenuItem == null ? void 0 : lastMenuItem.Depth)) {
      this.CloseTo(newHoverItem.Depth - 1);
    } else if (lastMenuItem != null && !PopupMenuStack.IsChildOf(newHoverItem, lastMenuItem)) {
      this.CloseTo(newHoverItem.Depth - 1);
    }
    return false;
  }
  static IsChildOf(child, parent) {
    let isChild = false;
    for (const item of parent.MenuItem.Children) {
      if (item === child.MenuItem) {
        isChild = true;
        break;
      }
    }
    return isChild;
  }
  CloseTo(depth) {
    let needInvalidate = false;
    for (let i = this._children.length - 1; i >= 0; i--) {
      if (i == depth)
        break;
      this._children[i].Parent = null;
      this._children.RemoveAt(i);
      needInvalidate = true;
    }
    if (needInvalidate)
      this.Invalidate(InvalidAction.Repaint);
  }
  VisitChildren(action) {
    for (const child of this._children) {
      if (action(child))
        break;
    }
  }
  HitTest(x, y, result) {
    for (const child of this._children) {
      if (this.HitTestChild(child, x, y, result))
        return true;
    }
    return false;
  }
  Layout(availableWidth, availableHeight) {
  }
  Paint(canvas, area = null) {
    for (const child of this._children) {
      canvas.translate(child.X, child.Y);
      child.Paint(canvas, area);
      canvas.translate(-child.X, -child.Y);
    }
  }
  PreviewEvent(type, e) {
    if (type == EventType.PointerDown) {
      let pointerEvent = e;
      let someOneContains = false;
      for (const child of this._children) {
        if (child.ContainsPoint(pointerEvent.X, pointerEvent.Y)) {
          someOneContains = true;
          break;
        }
      }
      if (!someOneContains) {
        this._closeAll();
        return EventPreviewResult.Processed;
      }
    }
    return super.PreviewEvent(type, e);
  }
}
class PopupMenu extends Widget {
  constructor(owner, items, depth, controller) {
    super();
    __publicField(this, "Owner");
    __publicField(this, "_children");
    __publicField(this, "_controller");
    if (owner == null && items == null)
      throw new System.ArgumentNullException();
    this.Owner = owner;
    this._controller = controller;
    if (owner != null) {
      this._children = new System.List(owner.MenuItem.Children.length);
      this.BuildMenuItemWidgets(owner.MenuItem.Children, depth);
    } else {
      this._children = new System.List(items.length);
      this.BuildMenuItemWidgets(items, depth);
    }
  }
  BuildMenuItemWidgets(items, depth) {
    for (const item of items) {
      let child = new MenuItemWidget(item, depth, true, this._controller);
      child.Parent = this;
      this._children.Add(child);
    }
  }
  VisitChildren(action) {
    for (const child of this._children) {
      if (action(child))
        break;
    }
  }
  Layout(availableWidth, availableHeight) {
    if (this.HasLayout)
      return;
    this.HasLayout = true;
    let maxChildWidth = 0;
    let maxWidthChild = null;
    let offsetY = 0;
    for (const child of this._children) {
      child.Layout(Number.POSITIVE_INFINITY, this._controller.PopupItemHeight);
      child.SetPosition(0, offsetY);
      if (child.W >= maxChildWidth) {
        maxChildWidth = child.W;
        if (maxWidthChild == null || child.MenuItem.Type != MenuItemType.SubMenu)
          maxWidthChild = child;
      }
      offsetY += child.H;
    }
    if (maxWidthChild.MenuItem.Type != MenuItemType.SubMenu) {
      maxChildWidth += Theme.DefaultFontSize;
    }
    for (const child of this._children) {
      child.ResetWidth(maxChildWidth);
    }
    this.SetSize(maxChildWidth, offsetY);
  }
  Paint(canvas, area = null) {
    let rrect = RRect.FromRectAndRadius(Rect.FromLTWH(0, 0, this.W, this.H), 4, 4);
    let path = new CanvasKit.Path();
    path.addRRect(rrect);
    DrawShadow(canvas, path, Colors.Black, 5, false, this.Root.Window.ScaleFactor);
    let paint = PaintUtils.Shared(this._controller.BackgroundColor);
    canvas.drawRRect(rrect, paint);
    canvas.save();
    canvas.clipPath(path, CanvasKit.ClipOp.Intersect, false);
    this.PaintChildren(canvas, area);
    canvas.restore();
    path.delete();
  }
}
class ContextMenu {
  static Show(menuItems) {
    let controller = new MenuController();
    controller.ShowContextMenu(menuItems);
  }
}
class FormItem extends Widget {
  constructor(label, widget, columnSpan = 1) {
    super();
    __publicField(this, "_widget");
    __publicField(this, "_label");
    __publicField(this, "ColumnSpan");
    __publicField(this, "_cachedLabelParagraph");
    if (columnSpan < 1)
      throw new System.ArgumentException();
    this._widget = widget;
    this._widget.Parent = this;
    this._label = label;
    this.ColumnSpan = columnSpan;
  }
  VisitChildren(action) {
    action(this._widget);
  }
  Layout(availableWidth, availableHeight) {
    var _a;
    this.CachedAvailableWidth = availableWidth;
    this.CachedAvailableHeight = availableHeight;
    (_a = this._cachedLabelParagraph) != null ? _a : this._cachedLabelParagraph = TextPainter.BuildParagraph(this._label, Number.POSITIVE_INFINITY, Theme.DefaultFontSize, Colors.Black, null, 1);
    let lableWidth = this.Parent.LabelWidth + 5;
    this._widget.Layout(availableWidth - lableWidth, availableHeight);
    this._widget.SetPosition(lableWidth, 0);
    this.SetSize(availableWidth, Math.max(this._cachedLabelParagraph.getHeight(), this._widget.H));
  }
  Paint(canvas, area = null) {
    let parent = this.Parent;
    let lableWidth = parent.LabelWidth;
    let alignment = parent.LabelAlignment;
    let x = 0;
    if (alignment == HorizontalAlignment.Center)
      x = (lableWidth - this._cachedLabelParagraph.getMaxIntrinsicWidth()) / 2;
    else if (alignment == HorizontalAlignment.Right)
      x = lableWidth - this._cachedLabelParagraph.getMaxIntrinsicWidth();
    canvas.save();
    canvas.clipRect(Rect.FromLTWH(0, 0, lableWidth, this.H), CanvasKit.ClipOp.Intersect, false);
    canvas.drawParagraph(this._cachedLabelParagraph, x, (this.H - this._cachedLabelParagraph.getHeight()) / 2);
    canvas.restore();
    this.PaintChildren(canvas, area);
  }
}
class Form extends MultiChildWidget {
  constructor() {
    super();
    __publicField(this, "_columns", 1);
    __publicField(this, "_labelAlignment", HorizontalAlignment.Right);
    __publicField(this, "_labelWidth", 120);
    __publicField(this, "_padding", EdgeInsets.All(5));
    __publicField(this, "_horizontalSpacing", 5);
    __publicField(this, "_verticalSpacing", 5);
  }
  get Columns() {
    return this._columns;
  }
  set Columns(value) {
    if (this._columns == value)
      return;
    this._columns = value;
    if (this.IsMounted)
      this.Invalidate(InvalidAction.Relayout);
  }
  get Padding() {
    return this._padding;
  }
  set Padding(value) {
    if (System.OpEquality(this._padding, value))
      return;
    this._padding = value;
    if (this.IsMounted)
      this.Invalidate(InvalidAction.Relayout);
  }
  get LabelAlignment() {
    return this._labelAlignment;
  }
  set LabelAlignment(value) {
    if (this._labelAlignment == value)
      return;
    this._labelAlignment = value;
    if (this.IsMounted)
      this.Invalidate(InvalidAction.Relayout);
  }
  get LabelWidth() {
    return this._labelWidth;
  }
  set LabelWidth(value) {
    if (this._labelWidth == value)
      return;
    this._labelWidth = value;
    if (this.IsMounted)
      this.Invalidate(InvalidAction.Relayout);
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    let columnWidth = (width - (this._columns - 1) * this._horizontalSpacing - this._padding.Left - this._padding.Right) / this._columns;
    let y = this._padding.Top;
    let colIndex = 0;
    let rowHeight = 0;
    for (let i = 0; i < this._children.length; i++) {
      let leftHeight = height - y;
      if (leftHeight <= 0)
        break;
      let child = this._children[i];
      let span = Math.min(child.ColumnSpan, this._columns - colIndex);
      child.Layout(columnWidth * span + (span - 1) * this._horizontalSpacing, leftHeight);
      child.SetPosition(this._padding.Left + colIndex * this._horizontalSpacing + colIndex * columnWidth, y);
      rowHeight = Math.max(rowHeight, child.H);
      colIndex += span;
      if (colIndex == this._columns) {
        y += this._verticalSpacing + rowHeight;
        colIndex = 0;
        rowHeight = 0;
      } else if (i == this._children.length - 1) {
        y += rowHeight;
      }
    }
    this.SetSize(width, Math.min(y + this._padding.Bottom, height));
  }
}
class Tab extends SingleChildWidget {
  constructor() {
    super();
    __publicField(this, "IsSelected", State.op_Implicit_From(false));
    __publicField(this, "_isHover", false);
    __privateAdd(this, _MouseRegion8, void 0);
    this.MouseRegion = new MouseRegion(() => Cursors.Hand, false);
    this.MouseRegion.HoverChanged.Add(this._OnHoverChanged, this);
    this.Bind(this.IsSelected, BindingOptions.AffectsVisual);
  }
  get TabBar() {
    return this.Parent;
  }
  get MouseRegion() {
    return __privateGet(this, _MouseRegion8);
  }
  set MouseRegion(value) {
    __privateSet(this, _MouseRegion8, value);
  }
  set OnTap(value) {
    this.MouseRegion.PointerTap.Add(value, this);
  }
  _OnHoverChanged(hover) {
    this._isHover = hover;
    if (!this.IsSelected.Value)
      this.Invalidate(InvalidAction.Repaint);
  }
  get IsOpaque() {
    if (this.IsSelected.Value)
      return this.TabBar.SelectedColor != null && this.TabBar.SelectedColor.IsOpaque;
    if (this._isHover)
      return this.TabBar.HoverColor != null && this.TabBar.HoverColor.IsOpaque;
    return false;
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    if (this.Child == null) {
      this.SetSize(0, 0);
      return;
    }
    this.Child.Layout(width, height);
    if (this.TabBar.Scrollable) {
      this.SetSize(this.Child.W, height);
      this.Child.SetPosition(0, (height - this.Child.H) / 2);
    } else {
      this.SetSize(width, height);
      this.Child.SetPosition((width - this.Child.W) / 2, (height - this.Child.H) / 2);
    }
  }
  Paint(canvas, area = null) {
    if (this.IsSelected.Value) {
      if (this.TabBar.SelectedColor != null)
        canvas.drawRect(Rect.FromLTWH(0, 0, this.W, this.H), PaintUtils.Shared(this.TabBar.SelectedColor));
    } else if (this._isHover) {
      if (this.TabBar.HoverColor != null)
        canvas.drawRect(Rect.FromLTWH(0, 0, this.W, this.H), PaintUtils.Shared(this.TabBar.HoverColor));
    }
    if (this.Child == null)
      return;
    canvas.translate(this.Child.X, this.Child.Y);
    this.Child.Paint(canvas, area == null ? void 0 : area.ToChild(this.Child));
    canvas.translate(-this.Child.X, -this.Child.Y);
    if (this.IsSelected.Value)
      canvas.drawRect(Rect.FromLTWH(0, this.H - 4, this.W, 4), PaintUtils.Shared(Theme.FocusedColor));
  }
}
_MouseRegion8 = new WeakMap();
__publicField(Tab, "$meta_PixUI_IMouseRegion", true);
class TabController {
  constructor(dataSource) {
    __publicField(this, "_tabBar");
    __publicField(this, "_tabBody");
    __publicField(this, "DataSource");
    __privateAdd(this, _SelectedIndex, -1);
    __publicField(this, "TabSelectChanged", new System.Event());
    __publicField(this, "TabAdded", new System.Event());
    __publicField(this, "TabClosed", new System.Event());
    this.DataSource = dataSource;
  }
  get Count() {
    return this.DataSource.length;
  }
  get SelectedIndex() {
    return __privateGet(this, _SelectedIndex);
  }
  set SelectedIndex(value) {
    __privateSet(this, _SelectedIndex, value);
  }
  BindTabBar(tabBar) {
    this._tabBar = tabBar;
  }
  BindTabBody(tabBody) {
    this._tabBody = tabBody;
  }
  OnStateChanged(state, options) {
  }
  GetAt(index) {
    return this.DataSource[index];
  }
  IndexOf(dataItem) {
    return this.DataSource.IndexOf(dataItem);
  }
  SelectAt(index, byTapTab = false) {
    var _a;
    if (index < 0 || index == this.SelectedIndex)
      return;
    if (this._tabBar != null && this.SelectedIndex >= 0)
      this._tabBar.Tabs[this.SelectedIndex].IsSelected.Value = false;
    let oldIndex = this.SelectedIndex;
    this.SelectedIndex = index;
    (_a = this._tabBody) == null ? void 0 : _a.SwitchFrom(oldIndex);
    if (this._tabBar != null)
      this._tabBar.Tabs[this.SelectedIndex].IsSelected.Value = true;
    this.TabSelectChanged.Invoke(index);
  }
  Add(dataItem) {
    var _a, _b;
    this.DataSource.Add(dataItem);
    (_a = this._tabBar) == null ? void 0 : _a.OnAdd(dataItem);
    (_b = this._tabBody) == null ? void 0 : _b.OnAdd(dataItem);
    this.TabAdded.Invoke(dataItem);
    this.SelectAt(this.DataSource.length - 1);
  }
  Remove(dataItem) {
    var _a, _b, _c;
    let index = this.DataSource.IndexOf(dataItem);
    if (index < 0)
      return;
    let isSelected = index == this.SelectedIndex;
    if (index < this.SelectedIndex)
      this.SelectedIndex -= 1;
    this.DataSource.RemoveAt(index);
    (_a = this._tabBar) == null ? void 0 : _a.OnRemoveAt(index);
    (_b = this._tabBody) == null ? void 0 : _b.OnRemoveAt(index);
    this.TabClosed.Invoke(dataItem);
    if (isSelected) {
      this.SelectedIndex = -1;
      if (this.DataSource.length > 0) {
        let newSelectedIndex = Math.max(0, index - 1);
        this.SelectAt(newSelectedIndex);
      } else {
        (_c = this._tabBody) == null ? void 0 : _c.ClearBody();
        this.TabSelectChanged.Invoke(-1);
      }
    }
  }
}
_SelectedIndex = new WeakMap();
class TabBar extends Widget {
  constructor(controller, tabBuilder, scrollable = false) {
    super();
    __publicField(this, "_controller");
    __publicField(this, "_tabBuilder");
    __publicField(this, "_tabs", new System.List());
    __privateAdd(this, _Scrollable, false);
    __publicField(this, "_scrollOffset", 0);
    __publicField(this, "BgColor");
    __publicField(this, "SelectedColor");
    __publicField(this, "HoverColor");
    this._controller = controller;
    this._controller.BindTabBar(this);
    this._tabBuilder = tabBuilder;
    this.Scrollable = scrollable;
    if (this._controller.DataSource.length == this._tabs.length)
      return;
    for (const dataItem of this._controller.DataSource) {
      this._tabs.Add(this.BuildTab(dataItem));
    }
    this._controller.SelectAt(0);
  }
  get Tabs() {
    return this._tabs;
  }
  get Scrollable() {
    return __privateGet(this, _Scrollable);
  }
  set Scrollable(value) {
    __privateSet(this, _Scrollable, value);
  }
  OnTabSelected(selected) {
    let selectedIndex = this._tabs.IndexOf(selected);
    this._controller.SelectAt(selectedIndex, true);
  }
  OnAdd(dataItem) {
    this._tabs.Add(this.BuildTab(dataItem));
    this.Invalidate(InvalidAction.Relayout);
  }
  OnRemoveAt(index) {
    this._tabs[index].Parent = null;
    this._tabs.RemoveAt(index);
    this.Invalidate(InvalidAction.Relayout);
  }
  BuildTab(dataItem) {
    let tab = new Tab();
    this._tabBuilder(dataItem, tab);
    tab.Parent = this;
    tab.OnTap = (_) => this.OnTabSelected(tab);
    return tab;
  }
  get IsOpaque() {
    return this.BgColor != null && this.BgColor.IsOpaque;
  }
  VisitChildren(action) {
    if (this._tabs.length == 0)
      return;
    for (const tab of this._tabs) {
      if (action(tab))
        break;
    }
  }
  HitTest(x, y, result) {
    if (!this.ContainsPoint(x, y))
      return false;
    result.Add(this);
    if (this._tabs.length == 0)
      return true;
    for (const tab of this._tabs) {
      let diffX = tab.X - this._scrollOffset;
      if (tab.HitTest(x - diffX, y - tab.Y, result))
        return true;
    }
    return true;
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    if (this._tabs.length == 0) {
      this.SetSize(width, height);
      return;
    }
    if (this.Scrollable) {
      this.SetSize(width, height);
      let offsetX = 0;
      for (let i = 0; i < this._tabs.length; i++) {
        this._tabs[i].Layout(Number.POSITIVE_INFINITY, height);
        this._tabs[i].SetPosition(offsetX, 0);
        offsetX += this._tabs[i].W;
      }
    } else {
      this.SetSize(width, height);
      let tabWidth = width / this._tabs.length;
      for (let i = 0; i < this._tabs.length; i++) {
        this._tabs[i].Layout(tabWidth, height);
        this._tabs[i].SetPosition(tabWidth * i, 0);
      }
    }
  }
  Paint(canvas, area = null) {
    if (this.BgColor != null)
      canvas.drawRect(Rect.FromLTWH(0, 0, this.W, this.H), PaintUtils.Shared(this.BgColor));
    for (const tab of this._tabs) {
      canvas.translate(tab.X, tab.Y);
      tab.Paint(canvas, area == null ? void 0 : area.ToChild(tab));
      canvas.translate(-tab.X, -tab.Y);
    }
  }
}
_Scrollable = new WeakMap();
class TabBody extends DynamicView {
  constructor(controller, bodyBuilder) {
    super();
    __publicField(this, "_controller");
    __publicField(this, "_bodyBuilder");
    __publicField(this, "_bodies");
    this._controller = controller;
    this._controller.BindTabBody(this);
    this._bodyBuilder = bodyBuilder;
    this._bodies = new System.List(new Array(this._controller.DataSource.length));
  }
  TryBuildBody() {
    let selectedIndex = this._controller.SelectedIndex;
    if (this._bodies[selectedIndex] == null) {
      let selectedData = this._controller.DataSource[selectedIndex];
      this._bodies[selectedIndex] = this._bodyBuilder(selectedData);
    }
    return this._bodies[selectedIndex];
  }
  OnAdd(dataItem) {
    this._bodies.Add(null);
  }
  OnRemoveAt(index) {
    if (this._bodies[index] != null)
      this._bodies[index].Parent = null;
    this._bodies.RemoveAt(index);
  }
  SwitchFrom(oldIndex) {
    let newIndex = this._controller.SelectedIndex;
    let to = this.TryBuildBody();
    if (oldIndex < 0) {
      this.ReplaceTo(to);
    } else {
      let from = this.Child;
      from.SuspendingMount = true;
      this.AnimateTo(from, to, 200, false, (a, w) => TabBody.BuildDefaultTransition(a, w, new Offset(newIndex > oldIndex ? 1 : -1, 0), Offset.Empty), (a, w) => TabBody.BuildDefaultTransition(a, w, Offset.Empty, new Offset(newIndex > oldIndex ? -1 : 1, 0)));
    }
  }
  ClearBody() {
    this.ReplaceTo(null);
  }
  static BuildDefaultTransition(animation, child, fromOffset, toOffset) {
    let offsetAnimation = new OffsetTween(fromOffset, toOffset).Animate(animation);
    return new SlideTransition(offsetAnimation).Init({ Child: child });
  }
}
class TabView extends Widget {
  constructor(controller, tabBuilder, bodyBuilder, closable = false, tabBarIndent = 35) {
    super();
    __publicField(this, "_tabBar");
    __publicField(this, "_tabBody");
    __publicField(this, "_tabBarIndent");
    this._tabBarIndent = tabBarIndent;
    this._tabBody = new TabBody(controller, bodyBuilder);
    this._tabBar = new TabBar(controller, (data, tab) => {
      tab.Child = new Container().Init({
        IsLayoutTight: true,
        Padding: State.op_Implicit_From(EdgeInsets.Only(10, 2, closable ? 0 : 10, 2)),
        Child: closable ? new Row().Init({
          Children: [
            tabBuilder(data, tab.IsSelected),
            new Button(null, State.op_Implicit_From(Icons.Filled.Close)).Init({
              Style: ButtonStyle.Transparent,
              Shape: ButtonShape.Pills,
              OnTap: (_) => controller.Remove(data)
            })
          ]
        }) : tabBuilder(data, tab.IsSelected)
      });
    }, true);
    this._tabBody.Parent = this;
    this._tabBar.Parent = this;
  }
  get TabBarBgColor() {
    return this._tabBar.BgColor;
  }
  set TabBarBgColor(value) {
    this._tabBar.BgColor = value;
  }
  get SelectedTabColor() {
    return this._tabBar.SelectedColor;
  }
  set SelectedTabColor(value) {
    this._tabBar.SelectedColor = value;
  }
  get HoverTabColor() {
    return this._tabBar.HoverColor;
  }
  set HoverTabColor(value) {
    this._tabBar.HoverColor = value;
  }
  VisitChildren(action) {
    if (action(this._tabBar))
      return;
    action(this._tabBody);
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    this._tabBar.Layout(width, this._tabBarIndent);
    this._tabBar.SetPosition(0, 0);
    this._tabBody.Layout(width, height - this._tabBar.H);
    this._tabBody.SetPosition(0, this._tabBar.H);
    this.SetSize(width, height);
  }
}
class TreeNode extends Widget {
  constructor(data, controller) {
    super();
    __publicField(this, "Data");
    __publicField(this, "_controller");
    __publicField(this, "_row");
    __publicField(this, "_children");
    __publicField(this, "IsSelected", State.op_Implicit_From(false));
    __publicField(this, "_color");
    __publicField(this, "_checkState");
    __publicField(this, "_expandController");
    __publicField(this, "_expandCurve");
    __publicField(this, "_expandArrowAnimation");
    __publicField(this, "IsLeaf", false);
    __publicField(this, "IsLazyLoad", false);
    __publicField(this, "IsExpanded", false);
    __publicField(this, "_animationFlag", 0);
    __publicField(this, "_animationValue", 0);
    this.Data = data;
    this._controller = controller;
    this._row = new TreeNodeRow();
    this._row.Parent = this;
    this._color = this.Compute1(this.IsSelected, (s) => s ? Theme.FocusedColor : Colors.Black);
    this.Bind(this.IsSelected, BindingOptions.AffectsVisual);
  }
  get Controller() {
    return this._controller;
  }
  get Children() {
    var _a;
    return (_a = this._children) == null ? void 0 : _a.ToArray();
  }
  set Icon(value) {
    var _a, _b;
    this._row.Icon = value;
    (_b = (_a = this._row.Icon).Color) != null ? _b : _a.Color = this._color;
  }
  set Label(value) {
    var _a, _b;
    this._row.Label = value;
    (_b = (_a = this._row.Label).TextColor) != null ? _b : _a.TextColor = this._color;
  }
  get IsExpanding() {
    return this._animationFlag == 1;
  }
  get IsCollapsing() {
    return this._animationFlag == -1;
  }
  get Depth() {
    let temp = this;
    let depth = 0;
    while (true) {
      if (temp.Parent instanceof TreeView)
        break;
      depth++;
      temp = temp.Parent;
    }
    return depth;
  }
  get ParentNode() {
    if (this.Parent == null)
      return null;
    if (this.Parent instanceof TreeView)
      return null;
    return this.Parent;
  }
  TryBuildExpandIcon() {
    if (this._expandController != null)
      return;
    this._expandController = new AnimationController(200, this.IsExpanded ? 1 : 0);
    this._expandController.ValueChanged.Add(this.OnAnimationValueChanged, this);
    this._expandCurve = new CurvedAnimation(this._expandController, Curves.EaseInOutCubic);
    this._expandArrowAnimation = new FloatTween(0.75, 1).Animate(this._expandCurve);
    let expander = new ExpandIcon(this._expandArrowAnimation);
    expander.OnPointerDown = this.OnTapExpander.bind(this);
    this._row.ExpandIcon = expander;
  }
  OnAnimationValueChanged() {
    this._animationValue = this._expandController.Value;
    this.Invalidate(InvalidAction.Relayout);
  }
  EnsureBuildChildren() {
    if (this.IsLeaf || this._children != null)
      return;
    let childrenList = this._controller.ChildrenGetter(this.Data);
    this._children = new System.List(childrenList.length);
    for (const child of childrenList) {
      let node = new TreeNode(child, this._controller);
      this._controller.NodeBuilder(child, node);
      node.TryBuildCheckbox();
      node.Parent = this;
      this._children.Add(node);
    }
  }
  TryBuildAndLayoutChildren() {
    if (this._children != null && this.HasLayout && this._children.All((t) => t.HasLayout)) {
      return TreeView.CalcMaxChildWidth(this._children);
    }
    this.EnsureBuildChildren();
    let maxWidth = 0;
    let yPos = this._controller.NodeHeight;
    for (let i = 0; i < this._children.length; i++) {
      let node = this._children[i];
      node.Layout(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
      node.SetPosition(0, yPos);
      yPos += node.H;
      maxWidth = Math.max(maxWidth, node.W);
    }
    return maxWidth;
  }
  OnTapExpander(e) {
    var _a, _b;
    if (this.IsExpanded) {
      this.IsExpanded = false;
      this._animationFlag = -1;
      (_a = this._expandController) == null ? void 0 : _a.Reverse();
    } else {
      let maxChildWidth = this.TryBuildAndLayoutChildren();
      this.SetSize(Math.max(this.W, maxChildWidth), this.H);
      this.IsExpanded = true;
      this._animationFlag = 1;
      (_b = this._expandController) == null ? void 0 : _b.Forward();
    }
  }
  VisitChildren(action) {
    if (action(this._row))
      return;
    if (!this.IsLeaf && this.IsExpanded && this._children != null) {
      for (const child of this._children) {
        if (action(child))
          break;
      }
    }
  }
  ContainsPoint(x, y) {
    return y >= 0 && y < this.H;
  }
  HitTest(x, y, result) {
    if (y < 0 || y > this.H)
      return false;
    result.Add(this);
    if (y <= this._controller.NodeHeight) {
      this.HitTestChild(this._row, x, y, result);
    } else {
      if (!this.IsLeaf && this._children != null) {
        for (const child of this._children) {
          if (this.HitTestChild(child, x, y, result))
            break;
        }
      }
    }
    return true;
  }
  Layout(availableWidth, availableHeight) {
    if (this.IsExpanding || this.IsCollapsing) {
      let totalChildrenHeight = this._children.Sum((t) => t.H);
      let expandedHeight = totalChildrenHeight * this._animationValue;
      if (this.IsCollapsing && this._animationValue == 0) {
        this._animationFlag = 0;
        this.SetSize(this._row.W, this._controller.NodeHeight);
      } else if (this.IsExpanding && this._animationValue == 1) {
        this._animationFlag = 0;
        this.SetSize(this.W, this._controller.NodeHeight + totalChildrenHeight);
      } else {
        this.SetSize(this.W, this._controller.NodeHeight + expandedHeight);
      }
      return;
    }
    if (this.HasLayout)
      return;
    if (!this.IsLeaf)
      this.TryBuildExpandIcon();
    this._row.Layout(Number.POSITIVE_INFINITY, this.Controller.NodeHeight);
    if (this.IsLeaf || !this.IsExpanded) {
      this.SetSize(this._row.W, this._controller.NodeHeight);
      this.HasLayout = true;
      return;
    }
    if (!this.IsLeaf && this.IsExpanded) {
      let maxChildWidth = this.TryBuildAndLayoutChildren();
      this.SetSize(Math.max(this._row.W, maxChildWidth), this._controller.NodeHeight + this._children.Sum((t) => t.H));
      this.HasLayout = true;
    }
  }
  OnChildSizeChanged(child, dx, dy, affects) {
    let oldWidth = this.W;
    let oldHeight = this.H;
    affects.Widget = this;
    affects.OldX += this.X;
    affects.OldY += this.Y;
    if (dy != 0 && this._children != null)
      TreeView.UpdatePositionAfter(child, this._children, dy);
    let newWidth = oldWidth;
    let newHeight = oldHeight + dy;
    if (dx > 0) {
      newWidth = Math.max(child.W, this.W);
    } else if (dx < 0 && child.W - dx == this._controller.TotalWidth) {
      if (this._children == null)
        newWidth = child.W;
      else
        newWidth = Math.max(TreeView.CalcMaxChildWidth(this._children), this.W);
    }
    this.SetSize(newWidth, newHeight);
    this.Parent.OnChildSizeChanged(this, newWidth - oldWidth, newHeight - oldHeight, affects);
  }
  Paint(canvas, area = null) {
    if (this.IsExpanding || this.IsCollapsing) {
      canvas.save();
      canvas.clipRect(Rect.FromLTWH(0, 0, this._controller.TreeView.W, this.H), CanvasKit.ClipOp.Intersect, false);
    }
    this._row.Paint(canvas, area);
    if (this.IsExpanding || this.IsCollapsing) {
      for (let i = 0; i < this._children.length; i++) {
        TreeNode.PaintChildNode(this._children[i], canvas, area);
        if ((i + 1) * this._controller.NodeHeight >= this.H)
          break;
      }
      canvas.restore();
    } else if (!this.IsLeaf && this.IsExpanded) {
      for (const child of this._children) {
        TreeNode.PaintChildNode(child, canvas, area);
      }
    }
  }
  static PaintChildNode(child, canvas, area) {
    canvas.translate(child.X, child.Y);
    child.Paint(canvas, area == null ? void 0 : area.ToChild(child));
    canvas.translate(-child.X, -child.Y);
    PaintDebugger.PaintWidgetBorder(child, canvas);
  }
  toString() {
    let labelText = this._row.Label == null ? "" : this._row.Label.Text.Value;
    return `TreeNode["${labelText}"]`;
  }
  TryBuildCheckbox() {
    if (!this.Controller.ShowCheckbox)
      return;
    this._checkState = new Rx(false);
    let checkbox = Checkbox.Tristate(this._checkState);
    checkbox.ValueChanged.Add(this.OnCheckChanged, this);
    this._row.Checkbox = checkbox;
  }
  OnCheckChanged(value) {
    if (!this.Controller.SuspendAutoCheck) {
      this.Controller.SuspendAutoCheck = true;
      TreeNode.AutoCheckParent(this.ParentNode);
      TreeNode.AutoCheckChildren(this, value);
      this.Controller.SuspendAutoCheck = false;
    }
    this.Controller.RaiseCheckChanged(this);
  }
  static AutoCheckParent(parent) {
    if (parent == null)
      return;
    let allChecked = true;
    let allUnchecked = true;
    for (const child of parent._children) {
      if (child._checkState.Value == null) {
        allChecked = false;
        allUnchecked = false;
        break;
      } else if (child._checkState.Value == true) {
        allUnchecked = false;
      } else {
        allChecked = false;
      }
    }
    let newValue = null;
    if (allChecked)
      newValue = true;
    else if (allUnchecked)
      newValue = false;
    parent._checkState.Value = newValue;
    TreeNode.AutoCheckParent(parent.ParentNode);
  }
  static AutoCheckChildren(node, newValue) {
    console.assert(newValue);
    if (node.IsLeaf)
      return;
    node.EnsureBuildChildren();
    if (node._children != null && node._children.length > 0) {
      for (const child of node._children) {
        child._checkState.Value = newValue;
        TreeNode.AutoCheckChildren(child, newValue);
      }
    }
  }
  SetChecked(value) {
    if (!this.Controller.ShowCheckbox)
      throw new System.InvalidOperationException("Not supported");
    this._checkState.Value = value;
  }
  get CheckState() {
    var _a;
    return (_a = this._checkState) == null ? void 0 : _a.Value;
  }
  FindNode(predicate) {
    if (predicate(this.Data))
      return this;
    if (!this.IsLeaf) {
      this.EnsureBuildChildren();
      for (const child of this._children) {
        let found = child.FindNode(predicate);
        if (found != null)
          return found;
      }
    }
    return null;
  }
  Expand() {
    if (this.IsLeaf || this.IsExpanded)
      return;
    this.IsExpanded = true;
    this.HasLayout = false;
    this.TryBuildExpandIcon();
    this._expandController.Forward(1);
    if (this.Parent === this._controller.TreeView)
      this._controller.TreeView.Invalidate(InvalidAction.Relayout);
    else
      this.Invalidate(InvalidAction.Relayout);
  }
  InsertChild(index, child) {
    if (this.IsLeaf)
      return;
    this.EnsureBuildChildren();
    let insertIndex = index < 0 ? this._children.length : index;
    this._children.Insert(insertIndex, child);
    let dataChildren = this._controller.ChildrenGetter(this.Data);
    dataChildren.Insert(insertIndex, child.Data);
    this.HasLayout = false;
  }
  RemoveChild(child) {
    this._children.Remove(child);
    let dataChildren = this._controller.ChildrenGetter(this.Data);
    dataChildren.Remove(child.Data);
    this.HasLayout = false;
  }
}
const _TreeNodeRow = class extends Widget {
  constructor() {
    super();
    __publicField(this, "_expander");
    __publicField(this, "_checkbox");
    __publicField(this, "_icon");
    __publicField(this, "_label");
    __publicField(this, "_isHover", false);
    __privateAdd(this, _MouseRegion9, void 0);
    this.MouseRegion = new MouseRegion(null, false);
    this.MouseRegion.HoverChanged.Add(this._OnHoverChanged, this);
    this.MouseRegion.PointerTap.Add(this._OnTap, this);
  }
  get MouseRegion() {
    return __privateGet(this, _MouseRegion9);
  }
  set MouseRegion(value) {
    __privateSet(this, _MouseRegion9, value);
  }
  set ExpandIcon(value) {
    this._expander = value;
    this._expander.Parent = this;
  }
  set Checkbox(value) {
    this._checkbox = value;
    this._checkbox.Parent = this;
  }
  get Icon() {
    return this._icon;
  }
  set Icon(value) {
    this._icon = value;
    this._icon.Parent = this;
  }
  get Label() {
    return this._label;
  }
  set Label(value) {
    this._label = value;
    if (this._label != null)
      this._label.Parent = this;
  }
  get TreeNode() {
    return this.Parent;
  }
  get Controller() {
    return this.TreeNode.Controller;
  }
  _OnHoverChanged(hover) {
    this._isHover = hover;
    this.Invalidate(InvalidAction.Repaint, new RepaintArea(Rect.FromLTWH(0, 0, this.Controller.TreeView.W, this.Controller.NodeHeight)));
  }
  _OnTap(e) {
    this.Controller.SelectNode(this.TreeNode);
  }
  get IsOpaque() {
    return this._isHover && this.Controller.HoverColor.IsOpaque;
  }
  ContainsPoint(x, y) {
    return y >= 0 && y < this.H && x >= 0 && x < this.Controller.TreeView.W;
  }
  VisitChildren(action) {
    if (this._checkbox != null)
      action(this._checkbox);
    if (this._icon != null)
      action(this._icon);
    if (this._label != null)
      action(this._label);
  }
  HitTest(x, y, result) {
    if (y < 0 || y > this.H)
      return false;
    result.Add(this);
    if (this._expander != null)
      this.HitTestChild(this._expander, x, y, result);
    if (this._checkbox != null)
      this.HitTestChild(this._checkbox, x, y, result);
    return true;
  }
  Layout(availableWidth, availableHeight) {
    var _a, _b;
    let indentation = this.TreeNode.Depth * this.Controller.NodeIndent;
    if (this._expander != null) {
      (_a = this._expander) == null ? void 0 : _a.Layout(this.Controller.NodeHeight, this.Controller.NodeHeight);
      (_b = this._expander) == null ? void 0 : _b.SetPosition(indentation, (this.Controller.NodeHeight - this._expander.H) / 2);
    }
    indentation += this.Controller.NodeIndent;
    if (this.Controller.ShowCheckbox) {
      this._checkbox.Layout(this.Controller.NodeHeight, this.Controller.NodeHeight);
      this._checkbox.SetPosition(indentation, (this.Controller.NodeHeight - this._checkbox.H) / 2);
      indentation += this._checkbox.W;
    } else {
      if (this._icon != null) {
        this._icon.Layout(this.Controller.NodeHeight, this.Controller.NodeHeight);
        this._icon.SetPosition(indentation, (this.Controller.NodeHeight - this._icon.H) / 2);
      }
      indentation += this.Controller.NodeIndent;
    }
    if (this._label != null) {
      this._label.Layout(Number.POSITIVE_INFINITY, this.Controller.NodeHeight);
      this._label.SetPosition(indentation, (this.Controller.NodeHeight - this._label.H) / 2);
      indentation += this._label.W;
    }
    this.SetSize(indentation, this.Controller.NodeHeight);
  }
  Paint(canvas, area = null) {
    if (this._isHover) {
      let paint = PaintUtils.Shared(this.Controller.HoverColor);
      canvas.drawRect(Rect.FromLTWH(0, 0, this.Controller.TreeView.W, this.Controller.NodeHeight), paint);
    }
    _TreeNodeRow.PaintChild(this._expander, canvas);
    if (this.Controller.ShowCheckbox)
      _TreeNodeRow.PaintChild(this._checkbox, canvas);
    else
      _TreeNodeRow.PaintChild(this._icon, canvas);
    _TreeNodeRow.PaintChild(this._label, canvas);
  }
  static PaintChild(child, canvas) {
    if (child == null)
      return;
    canvas.translate(child.X, child.Y);
    child.Paint(canvas);
    canvas.translate(-child.X, -child.Y);
    PaintDebugger.PaintWidgetBorder(child, canvas);
  }
  toString() {
    let labelText = this._label == null ? "" : this._label.Text.Value;
    return `TreeNodeRow["${labelText}"]`;
  }
};
let TreeNodeRow = _TreeNodeRow;
_MouseRegion9 = new WeakMap();
__publicField(TreeNodeRow, "$meta_PixUI_IMouseRegion", true);
class TreeController {
  constructor(nodeBuilder, childrenGetter) {
    __privateAdd(this, _TreeView2, void 0);
    __publicField(this, "NodeBuilder");
    __publicField(this, "ChildrenGetter");
    __publicField(this, "Nodes", new System.List());
    __publicField(this, "ScrollController", new ScrollController(ScrollDirection.Both));
    __publicField(this, "_selectedNodes", new System.List());
    __publicField(this, "SelectionChanged", new System.Event());
    __publicField(this, "HoverColor", new Color(4289374890));
    __publicField(this, "NodeIndent", 20);
    __publicField(this, "NodeHeight", 0);
    __publicField(this, "TotalWidth", 0);
    __publicField(this, "TotalHeight", 0);
    __publicField(this, "ShowCheckbox", false);
    __publicField(this, "SuspendAutoCheck", false);
    __publicField(this, "CheckChanged", new System.Event());
    __publicField(this, "_isLoading", false);
    __privateAdd(this, _LoadingPainter, void 0);
    __publicField(this, "_dataSource");
    this.NodeBuilder = nodeBuilder;
    this.ChildrenGetter = childrenGetter;
  }
  get TreeView() {
    return __privateGet(this, _TreeView2);
  }
  set TreeView(value) {
    __privateSet(this, _TreeView2, value);
  }
  get RootNodes() {
    return this.Nodes.ToArray();
  }
  get FirstSelectedNode() {
    return this._selectedNodes.length > 0 ? this._selectedNodes[0] : null;
  }
  get SelectedNodes() {
    return this._selectedNodes.ToArray();
  }
  RaiseCheckChanged(node) {
    this.CheckChanged.Invoke(node);
  }
  get LoadingPainter() {
    return __privateGet(this, _LoadingPainter);
  }
  set LoadingPainter(value) {
    __privateSet(this, _LoadingPainter, value);
  }
  get IsLoading() {
    return this._isLoading;
  }
  set IsLoading(value) {
    var _a, _b, _c;
    if (this._isLoading == value)
      return;
    this._isLoading = value;
    if (this._isLoading) {
      this.LoadingPainter = new CircularProgressPainter();
      this.LoadingPainter.Start(() => {
        var _a2;
        return (_a2 = this.TreeView) == null ? void 0 : _a2.Invalidate(InvalidAction.Repaint);
      });
    } else {
      (_a = this.LoadingPainter) == null ? void 0 : _a.Stop();
      (_b = this.LoadingPainter) == null ? void 0 : _b.Dispose();
      this.LoadingPainter = null;
    }
    (_c = this.TreeView) == null ? void 0 : _c.Invalidate(InvalidAction.Repaint);
  }
  get DataSource() {
    return this._dataSource;
  }
  set DataSource(value) {
    this._dataSource = value;
    if (this.TreeView != null && this.TreeView.IsMounted) {
      this.Nodes.Clear();
      this.InitNodes(this.TreeView);
      this.TreeView.Invalidate(InvalidAction.Relayout);
    }
  }
  InitNodes(treeView) {
    this.TreeView = treeView;
    if (this._dataSource == null)
      return;
    for (const item of this._dataSource) {
      let node = new TreeNode(item, this);
      this.NodeBuilder(item, node);
      node.TryBuildCheckbox();
      node.Parent = treeView;
      this.Nodes.Add(node);
    }
  }
  FindNode(predicate) {
    for (const child of this.Nodes) {
      let found = child.FindNode(predicate);
      if (found != null)
        return found;
    }
    return null;
  }
  SelectNode(node) {
    if (this._selectedNodes.length == 1 && this._selectedNodes[0] === node)
      return;
    for (const oldSelectedNode of this._selectedNodes) {
      oldSelectedNode.IsSelected.Value = false;
    }
    this._selectedNodes.Clear();
    this._selectedNodes.Add(node);
    node.IsSelected.Value = true;
    this.SelectionChanged.Invoke();
  }
  ExpandTo(node) {
    let temp = node.Parent;
    while (temp != null && !(temp === this.TreeView)) {
      let tempNode = temp;
      tempNode.Expand();
      temp = tempNode.Parent;
    }
  }
  InsertNode(child, parentNode = null, insertIndex = -1) {
    let node = new TreeNode(child, this);
    this.NodeBuilder(child, node);
    if (parentNode == null) {
      node.Parent = this.TreeView;
      let index = insertIndex < 0 ? this.Nodes.length : insertIndex;
      this.Nodes.Insert(index, node);
      this.DataSource.Insert(index, child);
      this.TreeView.Invalidate(InvalidAction.Relayout);
    } else {
      node.Parent = parentNode;
      parentNode.InsertChild(insertIndex, node);
      if (parentNode.IsExpanded)
        parentNode.Invalidate(InvalidAction.Relayout);
    }
    return node;
  }
  RemoveNode(node) {
    if (node.Parent === this.TreeView) {
      this.Nodes.Remove(node);
      this.DataSource.Remove(node.Data);
      node.Parent = null;
      this.TreeView.Invalidate(InvalidAction.Relayout);
    } else {
      let parentNode = node.Parent;
      parentNode.RemoveChild(node);
      node.Parent = null;
      if (parentNode.IsExpanded)
        parentNode.Invalidate(InvalidAction.Relayout);
    }
    let selectedAt = this._selectedNodes.IndexOf(node);
    if (selectedAt >= 0) {
      this._selectedNodes.RemoveAt(selectedAt);
      this.SelectionChanged.Invoke();
    }
  }
  SetChecked(data, value) {
    let node = this.FindNode((t) => System.Equals(data, t));
    if (node == null)
      throw new System.Exception("Can't find node");
    node.SetChecked(value);
  }
}
_TreeView2 = new WeakMap();
_LoadingPainter = new WeakMap();
const _TreeView = class extends Widget {
  constructor(controller, showCheckbox = false, nodeHeight = 30) {
    super();
    __publicField(this, "_controller");
    __publicField(this, "_color");
    this._controller = controller;
    this._controller.NodeHeight = nodeHeight;
    this._controller.ShowCheckbox = showCheckbox;
    this._controller.InitNodes(this);
  }
  get Color() {
    return this._color;
  }
  set Color(value) {
    this._color = this.Rebind(this._color, value, BindingOptions.AffectsVisual);
  }
  set OnCheckChanged(value) {
    this._controller.CheckChanged.Add(value, this);
  }
  get ScrollOffsetX() {
    return this._controller.ScrollController.OffsetX;
  }
  get ScrollOffsetY() {
    return this._controller.ScrollController.OffsetY;
  }
  OnScroll(dx, dy) {
    if (this._controller.Nodes.length == 0)
      return Offset.Empty;
    let maxOffsetX = Math.max(0, this._controller.TotalWidth - this.W);
    let maxOffsetY = Math.max(0, this._controller.TotalHeight - this.H);
    let offset = this._controller.ScrollController.OnScroll(dx, dy, maxOffsetX, maxOffsetY);
    if (!offset.IsEmpty) {
      this.Invalidate(InvalidAction.Repaint);
    }
    return offset;
  }
  get IsOpaque() {
    return this._color != null && this._color.Value.Alpha == 255;
  }
  get Clipper() {
    return new ClipperOfRect(Rect.FromLTWH(0, 0, this.W, this.H));
  }
  VisitChildren(action) {
    for (const node of this._controller.Nodes) {
      if (action(node))
        break;
    }
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    this.SetSize(width, height);
    let totalWidth = 0;
    let totalHeight = 0;
    for (const node of this._controller.Nodes) {
      node.Layout(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
      node.SetPosition(0, totalHeight);
      totalWidth = Math.max(totalWidth, node.W);
      totalHeight += node.H;
    }
    this._controller.TotalWidth = totalWidth;
    this._controller.TotalHeight = totalHeight;
  }
  OnChildSizeChanged(child, dx, dy, affects) {
    affects.OldW = this.W;
    affects.OldH = this.H - child.Y;
    _TreeView.UpdatePositionAfter(child, this._controller.Nodes, dy);
    if (dx > 0) {
      this._controller.TotalWidth = Math.max(child.W, this._controller.TotalWidth);
    } else if (dx < 0 && child.W - dx == this._controller.TotalWidth) {
      this._controller.TotalWidth = _TreeView.CalcMaxChildWidth(this._controller.Nodes);
    }
    this._controller.TotalHeight += dy;
  }
  Paint(canvas, area = null) {
    var _a;
    if (this._controller.IsLoading) {
      if (this._color != null)
        canvas.drawRect(Rect.FromLTWH(0, 0, this.W, this.H), PaintUtils.Shared(this._color.Value));
      this._controller.LoadingPainter.PaintToWidget(this, canvas);
      return;
    }
    canvas.save();
    canvas.clipRect(Rect.FromLTWH(0, 0, this.W, this.H), CanvasKit.ClipOp.Intersect, false);
    if (this._color != null)
      canvas.drawRect(Rect.FromLTWH(0, 0, this.W, this.H), PaintUtils.Shared(this._color.Value));
    let dirtyRect = ((_a = area == null ? void 0 : area.GetRect()) != null ? _a : Rect.FromLTWH(0, 0, this.W, this.H)).Clone();
    for (const node of this._controller.Nodes) {
      let vx = node.X - this.ScrollOffsetX;
      let vy = node.Y - this.ScrollOffsetY;
      if (vy >= dirtyRect.Bottom)
        break;
      let vb = vy + node.H;
      if (vb <= dirtyRect.Top)
        continue;
      canvas.translate(vx, vy);
      node.Paint(canvas, null);
      canvas.translate(-vx, -vy);
    }
    canvas.restore();
  }
  static CalcMaxChildWidth(nodes) {
    let maxChildWidth = 0;
    for (const node of nodes) {
      maxChildWidth = Math.max(maxChildWidth, node.W);
    }
    return maxChildWidth;
  }
  static UpdatePositionAfter(child, nodes, dy) {
    let indexOfChild = -1;
    for (let i = 0; i < nodes.length; i++) {
      if (indexOfChild == -1) {
        if (nodes[i] === child)
          indexOfChild = i;
      } else {
        let node = nodes[i];
        node.SetPosition(node.X, node.Y + dy);
      }
    }
  }
};
let TreeView = _TreeView;
__publicField(TreeView, "$meta_PixUI_IScrollable", true);
class CellCache {
  constructor(rowIndex, item) {
    __publicField(this, "RowIndex");
    __publicField(this, "CachedItem");
    this.RowIndex = rowIndex;
    this.CachedItem = item;
  }
}
class CellCacheComparer {
  Compare(x, y) {
    return x.RowIndex.CompareTo(y.RowIndex);
  }
}
class CellStyle {
  constructor() {
    __publicField(this, "Color");
    __publicField(this, "BackgroundColor");
    __publicField(this, "FontSize", 15);
    __publicField(this, "FontWeight", CanvasKit.FontWeight.Normal);
    __publicField(this, "HorizontalAlignment", HorizontalAlignment.Left);
    __publicField(this, "VerticalAlignment", VerticalAlignment.Middle);
  }
}
__publicField(CellStyle, "CellPadding", 5);
class DataGrid extends Widget {
  constructor(controller, theme = null) {
    super();
    __publicField(this, "_controller");
    __publicField(this, "Theme");
    __privateAdd(this, _MouseRegion10, void 0);
    this._controller = controller;
    this._controller.Attach(this);
    this.Theme = theme != null ? theme : DataGridTheme.Default;
    this.MouseRegion = new MouseRegion();
    this.MouseRegion.PointerMove.Add(this._controller.OnPointerMove, this._controller);
    this.MouseRegion.PointerDown.Add(this._controller.OnPointerDown, this._controller);
  }
  get Columns() {
    return this._controller.Columns;
  }
  set Columns(value) {
    this._controller.Columns = value;
  }
  get MouseRegion() {
    return __privateGet(this, _MouseRegion10);
  }
  set MouseRegion(value) {
    __privateSet(this, _MouseRegion10, value);
  }
  get ScrollOffsetX() {
    return this._controller.ScrollController.OffsetX;
  }
  get ScrollOffsetY() {
    return this._controller.ScrollController.OffsetY;
  }
  OnScroll(dx, dy) {
    if (this._controller.DataView == null || this._controller.DataView.length == 0)
      return Offset.Empty;
    let totalRowsHeight = this._controller.TotalRowsHeight;
    let totalHeaderHeight = this._controller.TotalHeaderHeight;
    let maxOffsetX = Math.max(0, this._controller.TotalColumnsWidth - this.W);
    let maxOffsetY = Math.max(0, totalRowsHeight - (this.H - totalHeaderHeight));
    let oldVisibleRowStart = this._controller.VisibleStartRowIndex;
    let visibleRows = this._controller.VisibleRows;
    let offset = this._controller.ScrollController.OnScroll(dx, dy, maxOffsetX, maxOffsetY);
    if (!offset.IsEmpty) {
      if (dy > 0) {
        let newVisibleRowStart = this._controller.VisibleStartRowIndex;
        if (newVisibleRowStart != oldVisibleRowStart)
          this._controller.ClearCacheOnScroll(true, newVisibleRowStart);
      } else {
        let oldVisibleRowEnd = oldVisibleRowStart + visibleRows;
        let newVisibleRowEnd = this._controller.VisibleStartRowIndex + visibleRows;
        if (oldVisibleRowEnd != newVisibleRowEnd)
          this._controller.ClearCacheOnScroll(false, newVisibleRowEnd);
      }
      this.Invalidate(InvalidAction.Repaint);
    }
    return offset;
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    this.SetSize(width, height);
    this._controller.CalcColumnsWidth(new Size(width, height));
  }
  Paint(canvas, area = null) {
    let size = new Size(this.W, this.H);
    canvas.save();
    canvas.clipRect(Rect.FromLTWH(0, 0, this.W, this.H), CanvasKit.ClipOp.Intersect, false);
    let visibleColumns = this._controller.LayoutVisibleColumns(size.Clone());
    let totalColumnsWidth = this._controller.TotalColumnsWidth;
    this.PaintHeader(canvas, size.Clone(), totalColumnsWidth, visibleColumns);
    if (this._controller.DataView == null || this._controller.DataView.length == 0) {
      canvas.restore();
      return;
    }
    if (this._controller.ScrollController.OffsetY > 0) {
      let clipRect = Rect.FromLTWH(0, this._controller.TotalHeaderHeight, size.Width, size.Height - this._controller.TotalHeaderHeight);
      canvas.clipRect(clipRect, CanvasKit.ClipOp.Intersect, false);
    }
    this.PaintRows(canvas, size.Clone(), totalColumnsWidth, visibleColumns);
    if (this._controller.ScrollController.OffsetY > 0) {
      let shadowPath = new CanvasKit.Path();
      shadowPath.addRect(Rect.FromLTWH(0, 0, Math.min(size.Width, totalColumnsWidth), this._controller.TotalHeaderHeight));
      DrawShadow(canvas, shadowPath, Colors.Black, 5, false, this.Root.Window.ScaleFactor);
      shadowPath.delete();
    }
    this.PaintHighlight(canvas);
    canvas.restore();
  }
  PaintHeader(canvas, size, totalColumnsWidth, visibleColumns) {
    let paintedGroupColumns = new System.List();
    if (size.Width < totalColumnsWidth && this._controller.HasFrozen) {
      let frozenColumns = visibleColumns.Where((c) => c.Frozen);
      for (const col of frozenColumns) {
        this.PaintHeaderCell(canvas, col, paintedGroupColumns);
      }
      let clipRect = this._controller.GetScrollClipRect(0, size.Height);
      canvas.save();
      canvas.clipRect(clipRect, CanvasKit.ClipOp.Intersect, false);
      let noneFrozenColumns = visibleColumns.Where((c) => !c.Frozen);
      for (const col of noneFrozenColumns) {
        this.PaintHeaderCell(canvas, col, paintedGroupColumns);
      }
      canvas.restore();
    } else {
      for (const col of visibleColumns) {
        this.PaintHeaderCell(canvas, col, paintedGroupColumns);
      }
    }
  }
  PaintHeaderCell(canvas, column, paintedGroupColumns) {
    let cellRect = this.GetHeaderCellRect(column);
    column.PaintHeader(canvas, cellRect.Clone(), this.Theme);
    this.PaintCellBorder(canvas, cellRect);
    if (column.Parent != null && !paintedGroupColumns.Contains(column.Parent)) {
      let parent = column.Parent;
      let index = parent.Children.indexOf(column);
      let offsetLeft = 0;
      for (let i = 0; i < index; i++) {
        offsetLeft += parent.Children[i].LayoutWidth;
      }
      parent.CachedLeft = column.CachedLeft - offsetLeft;
      this.PaintHeaderCell(canvas, parent, paintedGroupColumns);
      paintedGroupColumns.Add(parent);
    }
  }
  GetHeaderCellRect(column) {
    let rowIndex = column.HeaderRowIndex;
    let cellTop = rowIndex * this._controller.HeaderRowHeight;
    let cellHeight = column instanceof DataGridGroupColumn ? this._controller.HeaderRowHeight : (this._controller.HeaderRows - rowIndex) * this._controller.HeaderRowHeight;
    return Rect.FromLTWH(column.CachedLeft, cellTop, column.LayoutWidth, cellHeight);
  }
  PaintRows(canvas, size, totalColumnsWidth, visibleColumns) {
    let headerHeight = this._controller.TotalHeaderHeight;
    let deltaY = this._controller.ScrollDeltaY;
    let startRowIndex = this._controller.VisibleStartRowIndex;
    if (size.Width < totalColumnsWidth && this._controller.HasFrozen) {
      let frozenColumns = visibleColumns.Where((c) => c.Frozen == true);
      for (const col of frozenColumns) {
        this.PaintColumnCells(canvas, col, startRowIndex, headerHeight, deltaY, size.Height);
      }
      let clipRect = this._controller.GetScrollClipRect(headerHeight, size.Height - headerHeight);
      canvas.save();
      canvas.clipRect(clipRect, CanvasKit.ClipOp.Intersect, false);
      let noneFrozenColumns = visibleColumns.Where((c) => c.Frozen == false);
      for (const col of noneFrozenColumns) {
        this.PaintColumnCells(canvas, col, startRowIndex, headerHeight, deltaY, size.Height);
      }
      canvas.restore();
    } else {
      for (const col of visibleColumns) {
        this.PaintColumnCells(canvas, col, startRowIndex, headerHeight, deltaY, size.Height);
      }
    }
  }
  PaintColumnCells(canvas, col, startRow, offsetY, deltaY, maxHeight) {
    let rowHeight = this.Theme.RowHeight;
    for (let j = startRow; j < this._controller.DataView.length; j++) {
      let cellRect = Rect.FromLTWH(col.CachedLeft, offsetY - deltaY, col.LayoutWidth, rowHeight);
      if (this.Theme.StripeRows && j % 2 != 0) {
        let paint = PaintUtils.Shared(this.Theme.StripeBgColor);
        canvas.drawRect(cellRect, paint);
      }
      col.PaintCell(canvas, this._controller, j, cellRect.Clone());
      let borderRect = new Rect(col.CachedVisibleLeft, cellRect.Top, col.CachedVisibleRight, cellRect.Top + rowHeight);
      this.PaintCellBorder(canvas, borderRect);
      offsetY += rowHeight;
      if (offsetY >= maxHeight)
        break;
    }
  }
  PaintCellBorder(canvas, cellRect) {
    let paint = PaintUtils.Shared(this.Theme.BorderColor, CanvasKit.PaintStyle.Stroke, 1);
    canvas.drawRect(cellRect, paint);
  }
  PaintHighlight(canvas) {
    if (this.Theme.HighlightingCurrentRow) {
      let rowRect = this._controller.GetCurrentRowRect();
      if (rowRect != null) {
        if (this.Theme.HighlightingCurrentCell) {
          let paint = PaintUtils.Shared(this.Theme.HighlightRowBgColor);
          canvas.drawRect(rowRect, paint);
        } else {
          let paint = PaintUtils.Shared(Theme.FocusedColor, CanvasKit.PaintStyle.Stroke, Theme.FocusedBorderWidth);
          canvas.drawRect(rowRect, paint);
        }
      }
    }
    if (this.Theme.HighlightingCurrentCell) {
      let cellRect = this._controller.GetCurrentCellRect();
      if (cellRect != null) {
        let paint = PaintUtils.Shared(Theme.FocusedColor, CanvasKit.PaintStyle.Stroke, Theme.FocusedBorderWidth);
        canvas.drawRect(cellRect, paint);
      }
    }
  }
}
_MouseRegion10 = new WeakMap();
__publicField(DataGrid, "$meta_PixUI_IScrollable", true);
__publicField(DataGrid, "$meta_PixUI_IMouseRegion", true);
class DataGridController {
  constructor() {
    __publicField(this, "ScrollController", new ScrollController(ScrollDirection.Both));
    __publicField(this, "_columns");
    __publicField(this, "_owner");
    __privateAdd(this, _HeaderRows, 1);
    __privateAdd(this, _HeaderRowHeight, 35);
    __privateAdd(this, _HasFrozen, false);
    __publicField(this, "_dataSource");
    __publicField(this, "_cachedLeafColumns", new System.List());
    __publicField(this, "_cachedVisibleColumns", new System.List());
    __publicField(this, "_cachedWidgetSize", new Size(0, 0));
    __publicField(this, "_cachedScrollLeft", 0);
    __publicField(this, "_cachedScrollRight", 0);
    __publicField(this, "_cachedHitInHeader");
    __publicField(this, "_cachedHitInRows");
    __publicField(this, "_selectedRows", new System.List());
    __publicField(this, "SelectionChanged", new System.Event());
  }
  Attach(dataGrid) {
    this._owner = dataGrid;
  }
  get Theme() {
    return this._owner.Theme;
  }
  get DataGrid() {
    return this._owner;
  }
  get Columns() {
    return this._columns;
  }
  set Columns(value) {
    this._columns = value;
    this.HeaderRows = 1;
    this._cachedLeafColumns.Clear();
    for (const column of this._columns) {
      this.GetLeafColumns(column, this._cachedLeafColumns, null);
    }
    this.HasFrozen = this._cachedLeafColumns.Any((c) => c.Frozen);
    if (this._owner != null && this._owner.IsMounted)
      this._owner.Invalidate(InvalidAction.Relayout);
  }
  get HeaderRows() {
    return __privateGet(this, _HeaderRows);
  }
  set HeaderRows(value) {
    __privateSet(this, _HeaderRows, value);
  }
  get HeaderRowHeight() {
    return __privateGet(this, _HeaderRowHeight);
  }
  set HeaderRowHeight(value) {
    __privateSet(this, _HeaderRowHeight, value);
  }
  get TotalHeaderHeight() {
    return this.HeaderRows * this.HeaderRowHeight;
  }
  get TotalRowsHeight() {
    return this.DataView == null ? 0 : this.DataView.length * this.Theme.RowHeight;
  }
  get TotalColumnsWidth() {
    return this._cachedLeafColumns.Sum((c) => c.LayoutWidth);
  }
  get HasFrozen() {
    return __privateGet(this, _HasFrozen);
  }
  set HasFrozen(value) {
    __privateSet(this, _HasFrozen, value);
  }
  get ScrollDeltaY() {
    return this.ScrollController.OffsetY % this.Theme.RowHeight;
  }
  get VisibleStartRowIndex() {
    return Math.floor(Math.trunc(this.ScrollController.OffsetY / this.Theme.RowHeight)) & 4294967295;
  }
  get VisibleRows() {
    return Math.floor(Math.ceil(Math.max(0, this.DataGrid.H - this.TotalHeaderHeight) / this.Theme.RowHeight)) & 4294967295;
  }
  set DataSource(value) {
    var _a;
    let oldEmpty = this._dataSource == null ? true : this._dataSource.length == 0;
    let newEmpty = value == null ? true : value.length == 0;
    this._dataSource = value;
    this.ClearAllCache();
    if (oldEmpty && newEmpty)
      return;
    (_a = this._owner) == null ? void 0 : _a.Invalidate(InvalidAction.Repaint);
  }
  get DataView() {
    return this._dataSource;
  }
  get CurrentRowIndex() {
    return this._selectedRows.length > 0 ? this._selectedRows[0] : -1;
  }
  ObserveCurrentRow() {
    let state = new RxProperty(() => {
      if (this.DataView == null || this._selectedRows.length == 0) {
        let nullValue = null;
        return nullValue;
      }
      return this.DataView[this._selectedRows[0]];
    }, (newRow) => {
      if (newRow == null) {
        this.ClearSelection();
        return;
      }
      let index = this.DataView.IndexOf(newRow);
      this.SelectAt(index);
    }, false);
    this.SelectionChanged.Add(() => state.NotifyValueChanged());
    return state;
  }
  SelectAt(index) {
    let oldRowIndex = this.CurrentRowIndex;
    let newRowIndex = index;
    this.TrySelectRow(oldRowIndex, newRowIndex);
  }
  ClearSelection() {
    this._selectedRows.Clear();
    this._cachedHitInRows = null;
    this.SelectionChanged.Invoke();
  }
  TrySelectRow(oldRowIndex, newRowIndex) {
    if (oldRowIndex == newRowIndex)
      return;
    this._selectedRows.Clear();
    if (newRowIndex != -1)
      this._selectedRows.Add(newRowIndex);
    this.SelectionChanged.Invoke();
  }
  Invalidate() {
    var _a;
    (_a = this._owner) == null ? void 0 : _a.Invalidate(InvalidAction.Repaint);
  }
  ClearAllCache() {
    for (const column of this._cachedLeafColumns) {
      column.ClearAllCache();
    }
  }
  ClearCacheOnScroll(isScrollDown, rowIndex) {
    for (const column of this._cachedLeafColumns) {
      column.ClearCacheOnScroll(isScrollDown, rowIndex);
    }
  }
  OnPointerMove(e) {
    var _a;
    if (e.Buttons == PointerButtons.None) {
      if (e.Y <= this.TotalHeaderHeight) {
        this._cachedHitInHeader = this.HitTestInHeader(e.X, e.Y);
        if (this._cachedHitInHeader != null && this._cachedHitInHeader.IsColumnResizer)
          Cursor.Current = Cursors.ResizeLR;
        else
          Cursor.Current = Cursors.Arrow;
      } else if (this._cachedHitInHeader != null) {
        Cursor.Current = Cursors.Arrow;
        this._cachedHitInHeader = null;
      }
    } else if (e.Buttons == PointerButtons.Left) {
      if (e.DeltaX != 0 && this._cachedHitInHeader != null) {
        let col = this._cachedHitInHeader.Column;
        if (col.Width.Type == ColumnWidthType.Fixed) {
          let delta = e.DeltaX;
          let newWidth = col.Width.Value + delta;
          col.Width.ChangeValue(newWidth);
          col.ClearAllCache();
          if (delta < 0 && this.ScrollController.OffsetX > 0) {
            this.ScrollController.OffsetX = Math.max(this.ScrollController.OffsetX + delta, 0);
          }
          this.CalcColumnsWidth(this._cachedWidgetSize, true);
          (_a = this._owner) == null ? void 0 : _a.Invalidate(InvalidAction.Repaint);
        }
      }
    }
  }
  OnPointerDown(e) {
    var _a;
    if (e.Y <= this.TotalHeaderHeight) {
      return;
    }
    let oldRowIndex = this.CurrentRowIndex;
    this._cachedHitInRows = this.HitTestInRows(e.X, e.Y);
    let newRowIndex = this._cachedHitInRows != null ? this._cachedHitInRows.RowIndex : -1;
    this.TrySelectRow(oldRowIndex, newRowIndex);
    if (this._cachedHitInRows != null && (this._cachedHitInRows.ScrollDeltaX != 0 || this._cachedHitInRows.ScrollDeltaY != 0)) {
      this.ScrollController.OffsetX += this._cachedHitInRows.ScrollDeltaX;
      this.ScrollController.OffsetY += this._cachedHitInRows.ScrollDeltaY;
    }
    (_a = this._owner) == null ? void 0 : _a.Invalidate(InvalidAction.Repaint);
  }
  HitTestInHeader(x, y) {
    for (const col of this._cachedVisibleColumns) {
      if (col.CachedVisibleLeft <= x && x <= col.CachedVisibleRight) {
        let isColumnResizer = col.CachedVisibleRight - x <= 5;
        return new DataGridHitTestResult(col, -1, 0, 0, isColumnResizer);
      }
    }
    return null;
  }
  HitTestInRows(x, y) {
    if (this.DataView == null || this.DataView.length == 0)
      return null;
    let scrollX = 0;
    let scrollY = 0;
    let rowIndex = Math.floor(Math.trunc((y - this.TotalHeaderHeight + this.ScrollController.OffsetY) / this.Theme.RowHeight)) & 4294967295;
    if (rowIndex >= this.DataView.length)
      return this._cachedHitInRows;
    let deltaY = this.ScrollDeltaY;
    if (deltaY != 0) {
      if (rowIndex == this.VisibleStartRowIndex) {
        scrollY = -deltaY;
      }
    }
    for (const col of this._cachedVisibleColumns) {
      if (col.CachedVisibleLeft <= x && x <= col.CachedVisibleRight) {
        if (col.CachedVisibleLeft != col.CachedLeft) {
          scrollX = col.CachedLeft - col.CachedVisibleLeft;
        } else if (col.CachedVisibleRight != col.CachedLeft + col.LayoutWidth) {
          scrollX = col.CachedLeft + col.LayoutWidth - col.CachedVisibleRight;
        }
        return new DataGridHitTestResult(col, rowIndex, scrollX, scrollY);
      }
    }
    return null;
  }
  CalcColumnsWidth(widgetSize, force = false) {
    let needCalc = this._cachedWidgetSize.Width != widgetSize.Width;
    if (this.ScrollController.OffsetX > 0 && widgetSize.Width > this._cachedWidgetSize.Width) {
      let deltaX = widgetSize.Width - this._cachedWidgetSize.Width;
      this.ScrollController.OffsetX = Math.max(this.ScrollController.OffsetX - deltaX, 0);
    }
    this._cachedWidgetSize = widgetSize.Clone();
    if (!needCalc && !force)
      return;
    let fixedColumns = this._cachedLeafColumns.Where((c) => c.Width.Type == ColumnWidthType.Fixed).ToArray();
    let fixedWidth = fixedColumns.Sum((c) => c.Width.Value);
    let leftWidth = this._cachedWidgetSize.Width - fixedWidth;
    let leftColumns = this._cachedLeafColumns.length - fixedColumns.length;
    let percentColumns = this._cachedLeafColumns.Where((c) => c.Width.Type == ColumnWidthType.Percent).ToArray();
    let percentWidth = percentColumns.Sum((c) => {
      c.CalcWidth(leftWidth, leftColumns);
      return c.LayoutWidth;
    });
    leftWidth -= percentWidth;
    leftColumns -= percentColumns.length;
    let autoColumns = this._cachedLeafColumns.Where((c) => c.Width.Type == ColumnWidthType.Auto).ToArray();
    for (const col of autoColumns) {
      col.CalcWidth(leftWidth, leftColumns);
    }
  }
  LayoutVisibleColumns(size) {
    this._cachedVisibleColumns.Clear();
    let colStartIndex = 0;
    let colEndIndex = this._cachedLeafColumns.length - 1;
    let remainWidth = size.Width;
    let offsetX = 0;
    let needScroll = size.Width < this.TotalColumnsWidth;
    let insertIndex = 0;
    if (needScroll && this.HasFrozen) {
      for (let i = 0; i < this._cachedLeafColumns.length; i++) {
        let col = this._cachedLeafColumns[i];
        if (!col.Frozen) {
          colStartIndex = i;
          break;
        }
        col.CachedLeft = col.CachedVisibleLeft = offsetX;
        col.CachedVisibleRight = col.CachedLeft + col.LayoutWidth;
        this._cachedVisibleColumns.Insert(insertIndex++, col);
        offsetX += col.LayoutWidth;
      }
      remainWidth -= offsetX;
      if (remainWidth <= 0)
        return this._cachedVisibleColumns;
      let rightOffsetX = 0;
      for (let i = this._cachedLeafColumns.length - 1; i >= 0; i--) {
        let col = this._cachedLeafColumns[i];
        if (!col.Frozen) {
          colEndIndex = i;
          break;
        }
        col.CachedLeft = size.Width - rightOffsetX - col.LayoutWidth;
        col.CachedVisibleLeft = col.CachedLeft;
        col.CachedVisibleRight = col.CachedLeft + col.LayoutWidth;
        this._cachedVisibleColumns.Add(col);
        rightOffsetX += col.LayoutWidth;
        if (remainWidth - rightOffsetX <= 0)
          return this._cachedVisibleColumns;
      }
      remainWidth -= rightOffsetX;
      if (remainWidth <= 0)
        return this._cachedVisibleColumns;
    }
    this._cachedScrollLeft = offsetX;
    this._cachedScrollRight = offsetX + remainWidth;
    if (this.ScrollController.OffsetX > 0) {
      let skipWidth = 0;
      for (let i = colStartIndex; i <= colEndIndex; i++) {
        let col = this._cachedLeafColumns[i];
        skipWidth += col.LayoutWidth;
        if (skipWidth <= this.ScrollController.OffsetX)
          continue;
        colStartIndex = i;
        offsetX = offsetX - this.ScrollController.OffsetX + (skipWidth - col.LayoutWidth);
        break;
      }
    }
    for (let i = colStartIndex; i <= colEndIndex; i++) {
      let col = this._cachedLeafColumns[i];
      col.CachedLeft = offsetX;
      col.CachedVisibleLeft = Math.max(this._cachedScrollLeft, col.CachedLeft);
      col.CachedVisibleRight = Math.min(this._cachedScrollRight, col.CachedLeft + col.LayoutWidth);
      this._cachedVisibleColumns.Insert(insertIndex++, col);
      offsetX += col.LayoutWidth;
      if (offsetX >= this._cachedScrollRight)
        break;
    }
    return this._cachedVisibleColumns;
  }
  GetScrollClipRect(top, height) {
    return Rect.FromLTWH(this._cachedScrollLeft, top, this._cachedScrollRight - this._cachedScrollLeft, height);
  }
  GetCurrentRowRect() {
    if (this._selectedRows.length == 0)
      return null;
    let top = this.TotalHeaderHeight + (this._selectedRows[0] - this.VisibleStartRowIndex) * this.Theme.RowHeight - this.ScrollDeltaY;
    return new Rect(1, top + 1, this._owner.W - 2, top + this.Theme.RowHeight - 1);
  }
  GetCurrentCellRect() {
    if (this._cachedHitInRows == null || this._cachedHitInRows.RowIndex == -1)
      return null;
    let hitColumn = this._cachedHitInRows.Column;
    let top = this.TotalHeaderHeight + (this._cachedHitInRows.RowIndex - this.VisibleStartRowIndex) * this.Theme.RowHeight - this.ScrollDeltaY;
    return new Rect(hitColumn.CachedVisibleLeft + 1, top + 1, hitColumn.CachedVisibleRight - 2, top + this.Theme.RowHeight - 1);
  }
  GetLeafColumns(column, leafColumns, parentFrozen) {
    if (parentFrozen != null)
      column.Frozen = parentFrozen;
    if (column instanceof DataGridGroupColumn) {
      const groupColumn = column;
      this.HeaderRows += 1;
      for (const child of groupColumn.Children) {
        child.Parent = groupColumn;
        this.GetLeafColumns(child, leafColumns, column.Frozen);
      }
    } else {
      leafColumns.Add(column);
    }
  }
  Add(item) {
    var _a;
    this._dataSource.Add(item);
    (_a = this._owner) == null ? void 0 : _a.Invalidate(InvalidAction.Repaint);
  }
  Remove(item) {
    let indexInDataView = this.DataView.IndexOf(item);
    this.RemoveAt(indexInDataView);
  }
  RemoveAt(index) {
    var _a;
    let rowIndex = index;
    if (!(this.DataView === this._dataSource)) {
      let rowInView = this.DataView[index];
      this.DataView.RemoveAt(index);
      rowIndex = this._dataSource.IndexOf(rowInView);
    }
    this._dataSource.RemoveAt(rowIndex);
    this.ClearSelection();
    this.ClearAllCache();
    (_a = this._owner) == null ? void 0 : _a.Invalidate(InvalidAction.Repaint);
  }
  Refresh() {
    var _a;
    this.ClearAllCache();
    (_a = this._owner) == null ? void 0 : _a.Invalidate(InvalidAction.Repaint);
  }
}
_HeaderRows = new WeakMap();
_HeaderRowHeight = new WeakMap();
_HasFrozen = new WeakMap();
class DataGridHitTestResult {
  constructor(column, rowIndex, scrollDeltaX = 0, scrollDeltaY = 0, isColumnResizer = false) {
    __publicField(this, "Column");
    __publicField(this, "RowIndex");
    __publicField(this, "ScrollDeltaX");
    __publicField(this, "ScrollDeltaY");
    __publicField(this, "IsColumnResizer");
    this.Column = column;
    this.RowIndex = rowIndex;
    this.ScrollDeltaX = scrollDeltaX;
    this.ScrollDeltaY = scrollDeltaY;
    this.IsColumnResizer = isColumnResizer;
  }
}
const _DataGridTheme = class {
  constructor() {
    __publicField(this, "DefaultHeaderCellStyle");
    __publicField(this, "DefaultRowCellStyle");
    __publicField(this, "RowHeight", 28);
    __publicField(this, "CellPadding", 5);
    __publicField(this, "BorderColor", new Color(4293652213));
    __publicField(this, "StripeRows", true);
    __publicField(this, "StripeBgColor", new Color(4294638330));
    __publicField(this, "HighlightingCurrentCell", false);
    __publicField(this, "HighlightingCurrentRow", true);
    __publicField(this, "HighlightRowBgColor", new Color(807809592));
    this.DefaultHeaderCellStyle = new CellStyle().Init({
      Color: Colors.Black,
      BackgroundColor: new Color(4294309882),
      HorizontalAlignment: HorizontalAlignment.Center,
      FontWeight: CanvasKit.FontWeight.Bold
    });
    this.DefaultRowCellStyle = new CellStyle().Init({ Color: Colors.Black });
  }
  static get Default() {
    var _a;
    return (_a = _DataGridTheme._default) != null ? _a : _DataGridTheme._default = new _DataGridTheme();
  }
};
let DataGridTheme = _DataGridTheme;
__publicField(DataGridTheme, "_default");
var ColumnWidthType = /* @__PURE__ */ ((ColumnWidthType2) => {
  ColumnWidthType2[ColumnWidthType2["Auto"] = 0] = "Auto";
  ColumnWidthType2[ColumnWidthType2["Percent"] = 1] = "Percent";
  ColumnWidthType2[ColumnWidthType2["Fixed"] = 2] = "Fixed";
  return ColumnWidthType2;
})(ColumnWidthType || {});
const _ColumnWidth = class {
  constructor(type, value, minValue) {
    __privateAdd(this, _Type2, 0);
    __privateAdd(this, _Value, 0);
    __privateAdd(this, _MinValue, 0);
    this.Type = type;
    this.Value = value;
    this.MinValue = minValue;
  }
  get Type() {
    return __privateGet(this, _Type2);
  }
  set Type(value) {
    __privateSet(this, _Type2, value);
  }
  get Value() {
    return __privateGet(this, _Value);
  }
  set Value(value) {
    __privateSet(this, _Value, value);
  }
  get MinValue() {
    return __privateGet(this, _MinValue);
  }
  set MinValue(value) {
    __privateSet(this, _MinValue, value);
  }
  static Percent(percent, min = 20) {
    percent = clamp(percent, 0, 100);
    return new _ColumnWidth(1, percent, min);
  }
  static Auto(min = 20) {
    return new _ColumnWidth(0, 0, min);
  }
  static Fixed(width) {
    width = Math.max(0, width);
    return new _ColumnWidth(2, width, 0);
  }
  ChangeValue(newValue) {
    this.Value = newValue;
  }
};
let ColumnWidth = _ColumnWidth;
_Type2 = new WeakMap();
_Value = new WeakMap();
_MinValue = new WeakMap();
class DataGridColumn {
  constructor(label) {
    __publicField(this, "Label");
    __publicField(this, "Width", ColumnWidth.Auto());
    __publicField(this, "HeaderCellStyle");
    __publicField(this, "CellStyle");
    __publicField(this, "CellStyleGetter");
    __publicField(this, "Frozen", false);
    __publicField(this, "Parent");
    __publicField(this, "_cachedWidth", 0);
    __publicField(this, "CachedLeft", 0);
    __publicField(this, "CachedVisibleLeft", 0);
    __publicField(this, "CachedVisibleRight", 0);
    this.Label = label;
  }
  get HeaderRowIndex() {
    return this.Parent == null ? 0 : this.Parent.HeaderRowIndex + 1;
  }
  get LayoutWidth() {
    return this.Width.Type == ColumnWidthType.Fixed ? this.Width.Value : this._cachedWidth;
  }
  CalcWidth(leftWidth, leftColumns) {
    let widthChanged = false;
    if (this.Width.Type == ColumnWidthType.Percent) {
      let newWidth = Math.max(leftWidth / this.Width.Value, this.Width.MinValue);
      widthChanged = newWidth != this._cachedWidth;
      this._cachedWidth = newWidth;
    } else if (this.Width.Type == ColumnWidthType.Auto) {
      let newWidth = Math.max(leftWidth / leftColumns, this.Width.MinValue);
      widthChanged = newWidth != this._cachedWidth;
      this._cachedWidth = newWidth;
    }
    if (widthChanged)
      this.ClearAllCache();
  }
  ClearAllCache() {
  }
  ClearCacheOnScroll(isScrollDown, rowIndex) {
  }
  PaintHeader(canvas, cellRect, theme) {
    var _a;
    let cellStyle = (_a = this.HeaderCellStyle) != null ? _a : theme.DefaultHeaderCellStyle;
    if (cellStyle.BackgroundColor != null) {
      let paint = PaintUtils.Shared(cellStyle.BackgroundColor);
      canvas.drawRect(cellRect, paint);
    }
    let ph = DataGridColumn.BuildCellParagraph(cellRect.Clone(), cellStyle, this.Label, 2);
    DataGridColumn.PaintCellParagraph(canvas, cellRect.Clone(), cellStyle, ph);
    ph.delete();
  }
  PaintCell(canvas, controller, rowIndex, cellRect) {
  }
  static BuildCellParagraph(rect, style, text, maxLines) {
    var _a;
    let ts = MakeTextStyle({
      color: (_a = style.Color) != null ? _a : Colors.Black,
      fontSize: style.FontSize,
      fontStyle: new FontStyle(style.FontWeight, CanvasKit.FontSlant.Upright),
      heightMultiplier: 1
    });
    let textAlign = CanvasKit.TextAlign.Left;
    switch (style.HorizontalAlignment) {
      case HorizontalAlignment.Right:
        textAlign = CanvasKit.TextAlign.Right;
        break;
      case HorizontalAlignment.Center:
        textAlign = CanvasKit.TextAlign.Center;
        break;
    }
    let ps = MakeParagraphStyle({
      maxLines: Math.floor(maxLines) & 4294967295,
      textStyle: ts,
      heightMultiplier: 1,
      textAlign
    });
    let pb = MakeParagraphBuilder(ps);
    pb.pushStyle(ts);
    pb.addText(text);
    pb.pop();
    let ph = pb.build();
    ph.layout(rect.Width - CellStyle.CellPadding * 2);
    pb.delete();
    return ph;
  }
  static PaintCellParagraph(canvas, rect, style, paragraph) {
    if (style.VerticalAlignment == VerticalAlignment.Middle) {
      let x = rect.Left;
      let y = rect.Top + (rect.Height - paragraph.getHeight()) / 2;
      canvas.drawParagraph(paragraph, x + CellStyle.CellPadding, y);
    } else if (style.VerticalAlignment == VerticalAlignment.Bottom) {
      let x = rect.Left;
      let y = rect.Bottom;
      canvas.drawParagraph(paragraph, x + CellStyle.CellPadding, y - CellStyle.CellPadding - paragraph.getHeight());
    } else {
      canvas.drawParagraph(paragraph, rect.Left + CellStyle.CellPadding, rect.Top + CellStyle.CellPadding);
    }
  }
}
class DataGridGroupColumn extends DataGridColumn {
  constructor(label, children) {
    super(label);
    __publicField(this, "Children");
    this.Children = children;
  }
  get LayoutWidth() {
    return this.Children.Sum((c) => c.LayoutWidth);
  }
}
class DataGridIconColumn extends DataGridColumn {
  constructor(label, cellValueGetter) {
    super(label);
    __publicField(this, "_cellValueGetter");
    this._cellValueGetter = cellValueGetter;
  }
  PaintCell(canvas, controller, rowIndex, cellRect) {
    var _a, _b;
    let row = controller.DataView[rowIndex];
    let icon = this._cellValueGetter(row);
    if (icon == null)
      return;
    let style = this.CellStyleGetter != null ? this.CellStyleGetter(row, rowIndex) : (_a = this.CellStyle) != null ? _a : controller.Theme.DefaultRowCellStyle;
    let iconPainter = new IconPainter(controller.Invalidate.bind(controller));
    let offsetX = cellRect.Left + CellStyle.CellPadding;
    let offsetY = cellRect.Top;
    if (style.VerticalAlignment == VerticalAlignment.Middle) {
      offsetY += (cellRect.Height - style.FontSize) / 2;
    } else if (style.VerticalAlignment == VerticalAlignment.Bottom) {
      offsetY = offsetY - cellRect.Bottom - style.FontSize;
    }
    iconPainter.Paint(canvas, style.FontSize, (_b = style.Color) != null ? _b : Colors.Black, icon, offsetX, offsetY);
    iconPainter.Dispose();
  }
}
const _DataGridTextColumn = class extends DataGridColumn {
  constructor(label, cellValueGetter) {
    super(label);
    __publicField(this, "_cellValueGetter");
    __publicField(this, "_cellParagraphs", new System.List());
    this._cellValueGetter = cellValueGetter;
  }
  PaintCell(canvas, controller, rowIndex, cellRect) {
    var _a;
    let row = controller.DataView[rowIndex];
    let cellValue = this._cellValueGetter(row);
    if (System.IsNullOrEmpty(cellValue))
      return;
    let style = this.CellStyleGetter != null ? this.CellStyleGetter(row, rowIndex) : (_a = this.CellStyle) != null ? _a : controller.Theme.DefaultRowCellStyle;
    let ph = this.GetCellParagraph(rowIndex, controller, cellRect, cellValue, style);
    DataGridColumn.PaintCellParagraph(canvas, cellRect.Clone(), style, ph);
  }
  GetCellParagraph(rowIndex, controller, cellRect, cellValue, style) {
    let pattern = new CellCache(rowIndex, null);
    let index = this._cellParagraphs.BinarySearch(pattern, _DataGridTextColumn._cellCacheComparer);
    if (index >= 0)
      return this._cellParagraphs[index].CachedItem;
    index = ~index;
    controller.DataView[rowIndex];
    let ph = DataGridColumn.BuildCellParagraph(cellRect.Clone(), style, cellValue, 1);
    let cellCachedWidget = new CellCache(rowIndex, ph);
    this._cellParagraphs.Insert(index, cellCachedWidget);
    return ph;
  }
  ClearAllCache() {
    this._cellParagraphs.Clear();
  }
  ClearCacheOnScroll(isScrollDown, rowIndex) {
    if (isScrollDown)
      this._cellParagraphs.RemoveAll((t) => t.RowIndex < rowIndex);
    else
      this._cellParagraphs.RemoveAll((t) => t.RowIndex >= rowIndex);
  }
};
let DataGridTextColumn = _DataGridTextColumn;
__publicField(DataGridTextColumn, "_cellCacheComparer", new CellCacheComparer());
const _DataGridHostColumn = class extends DataGridColumn {
  constructor(label, cellBuilder) {
    super(label);
    __publicField(this, "_cellBuilder");
    __publicField(this, "_cellWidgets", new System.List());
    this._cellBuilder = cellBuilder;
  }
  PaintCell(canvas, controller, rowIndex, cellRect) {
    let cellWidget = this.GetCellWidget(rowIndex, controller, cellRect);
    canvas.translate(cellRect.Left, cellRect.Top);
    cellWidget.Paint(canvas, null);
    canvas.translate(-cellRect.Left, -cellRect.Top);
  }
  GetCellWidget(rowIndex, controller, cellRect) {
    let pattern = new CellCache(rowIndex, null);
    let index = this._cellWidgets.BinarySearch(pattern, _DataGridHostColumn._cellCacheComparer);
    if (index >= 0)
      return this._cellWidgets[index].CachedItem;
    index = ~index;
    let row = controller.DataView[rowIndex];
    let cellWidget = this._cellBuilder(row, rowIndex);
    cellWidget.Parent = controller.DataGrid;
    cellWidget.Layout(cellRect.Width, cellRect.Height);
    let cellCachedWidget = new CellCache(rowIndex, cellWidget);
    this._cellWidgets.Insert(index, cellCachedWidget);
    return cellWidget;
  }
  ClearCacheOnScroll(isScrollDown, rowIndex) {
    if (isScrollDown)
      this._cellWidgets.RemoveAll((t) => t.RowIndex < rowIndex);
    else
      this._cellWidgets.RemoveAll((t) => t.RowIndex >= rowIndex);
  }
};
let DataGridHostColumn = _DataGridHostColumn;
__publicField(DataGridHostColumn, "_cellCacheComparer", new CellCacheComparer());
class DataGridCheckboxColumn extends DataGridHostColumn {
  constructor(label, cellValueGetter, cellValueSetter = null) {
    super(label, (data, _) => {
      let state = new RxProperty(() => cellValueGetter(data), cellValueSetter == null ? null : (v) => cellValueSetter(data, v));
      return new Checkbox(state);
    });
  }
}
const _Cursor = class {
  static set Current(value) {
    _Cursor.PlatformCursors.SetCursor(value);
  }
};
let Cursor = _Cursor;
__publicField(Cursor, "PlatformCursors");
class Cursors {
  static get Arrow() {
    return Cursor.PlatformCursors.Arrow;
  }
  static get Hand() {
    return Cursor.PlatformCursors.Hand;
  }
  static get IBeam() {
    return Cursor.PlatformCursors.IBeam;
  }
  static get ResizeLR() {
    return Cursor.PlatformCursors.ResizeLR;
  }
  static get ResizeUD() {
    return Cursor.PlatformCursors.ResizeUD;
  }
}
const _Clipboard = class {
  static Init(platformClipboard) {
    _Clipboard._platformClipboard = platformClipboard;
  }
  static WriteText(text) {
    return _Clipboard._platformClipboard.WriteText(text);
  }
  static ReadText() {
    return _Clipboard._platformClipboard.ReadText();
  }
};
let Clipboard = _Clipboard;
__publicField(Clipboard, "_platformClipboard");
class RepaintArea {
  constructor(rect) {
    __publicField(this, "_rect");
    this._rect = rect.Clone();
  }
  GetRect() {
    return this._rect;
  }
  Merge(newArea) {
  }
  IntersectsWith(child) {
    return this._rect.IntersectsWith(child.X, child.Y, child.W, child.H);
  }
  ToChild(child) {
    if (child.X == 0 && child.Y == 0)
      return this;
    let childRect = Rect.FromLTWH(this._rect.Left - child.X, this._rect.Top - child.Y, this._rect.Width, this._rect.Height);
    return new RepaintArea(childRect.Clone());
  }
  toString() {
    return `RepaintArea[${this._rect}]`;
  }
}
class RepaintChild {
  constructor(from, to, lastDirtyArea) {
    __publicField(this, "_lastDirtyArea");
    __publicField(this, "_path");
    __publicField(this, "_current", 0);
    this._lastDirtyArea = lastDirtyArea;
    this._path = new System.List();
    let temp = to;
    while (!(temp === from)) {
      this._path.Add(temp);
      temp = temp.Parent;
    }
    this._current = this._path.length - 1;
  }
  Merge(newArea) {
    throw new System.NotSupportedException();
  }
  IntersectsWith(child) {
    if (this._current < 0)
      return false;
    let cur = this._path[this._current];
    return cur === child;
  }
  GetRect() {
    let cur = this._path[this._current];
    return Rect.FromLTWH(cur.X, cur.Y, cur.W, cur.H);
  }
  ToChild(child) {
    this._current--;
    if (this._current < 0)
      return this._lastDirtyArea;
    return this;
  }
  toString() {
    if (this._current < 0)
      return this._lastDirtyArea == null ? "" : this._lastDirtyArea.toString();
    let cur = this._path[this._current];
    return `RepaintChild[${cur}]`;
  }
}
const _UIApplication = class {
  constructor() {
    __publicField(this, "MainWindow");
  }
  static get Current() {
    return __privateGet(_UIApplication, _Current);
  }
  static set Current(value) {
    __privateSet(_UIApplication, _Current, value);
  }
  OnInvalidateRequest() {
    let window2 = this.MainWindow;
    let widgetsCanvas = window2.GetOffscreenCanvas();
    let overlayCanvas = window2.GetOnscreenCanvas();
    let ctx = PaintContext.Default;
    ctx.Window = window2;
    let beginTime = System.DateTime.UtcNow;
    if (!window2.WidgetsInvalidQueue.IsEmpty) {
      ctx.Canvas = widgetsCanvas;
      window2.WidgetsInvalidQueue.RenderFrame(ctx);
      window2.FlushOffscreenSurface();
    }
    if (!window2.OverlayInvalidQueue.IsEmpty) {
      ctx.Canvas = overlayCanvas;
      window2.OverlayInvalidQueue.RelayoutAll();
    }
    window2.DrawOffscreenSurface();
    if (window2.ScaleFactor != 1) {
      overlayCanvas.save();
      overlayCanvas.scale(window2.ScaleFactor, window2.ScaleFactor);
    }
    window2.Overlay.Paint(overlayCanvas);
    if (window2.ScaleFactor != 1)
      overlayCanvas.restore();
    window2.HasPostInvalidateEvent = false;
    let duration = System.DateTime.op_Subtraction(System.DateTime.UtcNow, beginTime);
    console.log(`Draw frame: ${duration.TotalMilliseconds}ms`);
    window2.Present();
  }
};
let UIApplication = _UIApplication;
_Current = new WeakMap();
__privateAdd(UIApplication, _Current, void 0);
const _PaintContext = class {
  constructor() {
    __privateAdd(this, _Window3, void 0);
    __privateAdd(this, _Canvas, void 0);
  }
  get Window() {
    return __privateGet(this, _Window3);
  }
  set Window(value) {
    __privateSet(this, _Window3, value);
  }
  get Canvas() {
    return __privateGet(this, _Canvas);
  }
  set Canvas(value) {
    __privateSet(this, _Canvas, value);
  }
};
let PaintContext = _PaintContext;
_Window3 = new WeakMap();
_Canvas = new WeakMap();
__publicField(PaintContext, "Default", new _PaintContext());
const _AffectsByRelayout = class {
  constructor() {
    __publicField(this, "Widget");
    __publicField(this, "OldX", 0);
    __publicField(this, "OldY", 0);
    __publicField(this, "OldW", 0);
    __publicField(this, "OldH", 0);
  }
  GetDirtyArea() {
    let cx = 0;
    let cy = 0;
    if (IsInterfaceOfIScrollable(this.Widget.Parent)) {
      const scrollable = this.Widget.Parent;
      cx = scrollable.ScrollOffsetX;
      cy = scrollable.ScrollOffsetY;
    }
    return new RepaintArea(new Rect(Math.min(this.OldX, this.Widget.X) - cx, Math.min(this.OldY, this.Widget.Y) - cy, Math.max(this.OldX + this.OldW, this.Widget.X + this.Widget.W), Math.max(this.OldY + this.OldH, this.Widget.Y + this.Widget.H)));
  }
};
let AffectsByRelayout = _AffectsByRelayout;
__publicField(AffectsByRelayout, "Default", new _AffectsByRelayout());
var InvalidAction = /* @__PURE__ */ ((InvalidAction2) => {
  InvalidAction2[InvalidAction2["Repaint"] = 0] = "Repaint";
  InvalidAction2[InvalidAction2["Relayout"] = 1] = "Relayout";
  return InvalidAction2;
})(InvalidAction || {});
class InvalidWidget {
  constructor() {
    __publicField(this, "Widget");
    __publicField(this, "Action", 0);
    __publicField(this, "Level", 0);
    __publicField(this, "RelayoutOnly", false);
    __publicField(this, "Area");
  }
}
class InvalidQueue {
  constructor() {
    __publicField(this, "_queue", new System.List(32));
  }
  static Add(widget, action, item) {
    if (!widget.IsMounted)
      return false;
    let root = widget.Root;
    if (root instanceof Overlay) {
      if (action == 1)
        root.Window.OverlayInvalidQueue.AddInternal(widget, action, item);
    } else {
      root.Window.WidgetsInvalidQueue.AddInternal(widget, action, item);
    }
    if (!root.Window.HasPostInvalidateEvent) {
      root.Window.HasPostInvalidateEvent = true;
      UIApplication.Current.PostInvalidateEvent();
    }
    return true;
  }
  get IsEmpty() {
    return this._queue.length == 0;
  }
  AddInternal(widget, action, item) {
    var _a;
    let level = InvalidQueue.GetLevelToTop(widget);
    let insertPos = 0;
    let relayoutOnly = false;
    for (const exist of this._queue) {
      if (exist.Level > level) {
        break;
      }
      if (exist.Widget === widget) {
        if (exist.Action < action)
          exist.Action = action;
        if (exist.Action == 0 && action == 0) {
          if (item == null)
            exist.Area = null;
          (_a = exist.Area) == null ? void 0 : _a.Merge(item);
        }
        insertPos = -1;
        break;
      }
      if (exist.Widget.IsAnyParentOf(widget)) {
        if (exist.Action == 1 || exist.Action == 0 && action == 0) {
          insertPos = -1;
          break;
        }
        relayoutOnly = true;
        exist.Area = null;
      }
      insertPos++;
    }
    if (insertPos < 0)
      return;
    if (widget.Parent != null) {
      for (let i = insertPos - 1; i >= 0; i--) {
        let exist = this._queue[i];
        if (exist.Level < level)
          break;
        if (!(exist.Widget.Parent === widget.Parent))
          continue;
        let existIndex = widget.Parent.IndexOfChild(exist.Widget);
        let curIndex = widget.Parent.IndexOfChild(widget);
        if (curIndex > existIndex)
          break;
        insertPos = i;
      }
    }
    let target = new InvalidWidget().Init({
      Widget: widget,
      Action: action,
      Level: level,
      Area: item,
      RelayoutOnly: relayoutOnly
    });
    this._queue.Insert(insertPos, target);
  }
  static GetLevelToTop(widget) {
    let level = 0;
    let cur = widget;
    while (cur.Parent != null) {
      level++;
      cur = cur.Parent;
    }
    return level;
  }
  RenderFrame(context) {
    var _a;
    let hasRelayout = false;
    for (const item of this._queue) {
      if (!item.Widget.IsMounted)
        continue;
      if (item.Action == 1) {
        hasRelayout = true;
        let affects = AffectsByRelayout.Default;
        InvalidQueue.RelayoutWidget(item.Widget, affects);
        if (!item.RelayoutOnly) {
          InvalidQueue.RepaintWidget(context, (_a = affects.Widget.Parent) != null ? _a : affects.Widget, affects.GetDirtyArea());
        }
      } else {
        InvalidQueue.RepaintWidget(context, item.Widget, item.Area);
      }
    }
    this._queue.Clear();
    if (hasRelayout)
      context.Window.RunNewHitTest();
  }
  RelayoutAll() {
    for (const item of this._queue) {
      if (item.Action == 1) {
        let affects = AffectsByRelayout.Default;
        InvalidQueue.RelayoutWidget(item.Widget, affects);
      } else {
        throw new System.InvalidOperationException();
      }
    }
    this._queue.Clear();
  }
  static RelayoutWidget(widget, affects) {
    affects.Widget = widget;
    affects.OldX = widget.X;
    affects.OldY = widget.Y;
    affects.OldW = widget.W;
    affects.OldH = widget.H;
    widget.Layout(widget.CachedAvailableWidth, widget.CachedAvailableHeight);
    widget.TryNotifyParentIfSizeChanged(affects.OldW, affects.OldH, affects);
  }
  static RepaintWidget(ctx, widget, dirtyArea) {
    let canvas = ctx.Canvas;
    let x = 0;
    let y = 0;
    let opaque = null;
    let temp = widget;
    let dirtyRect = (dirtyArea == null ? Rect.FromLTWH(0, 0, widget.W, widget.H) : dirtyArea.GetRect()).Clone();
    let clipper = new ClipperOfRect(dirtyRect.Clone());
    let isClipperEmpty = false;
    let dirtyX = dirtyRect.Left;
    let dirtyY = dirtyRect.Top;
    do {
      let cx = temp.X;
      let cy = temp.Y;
      if (IsInterfaceOfIScrollable(temp.Parent)) {
        const scrollable = temp.Parent;
        cx -= scrollable.ScrollOffsetX;
        cy -= scrollable.ScrollOffsetY;
      } else if (temp.Parent instanceof Transform) {
        const transform = temp.Parent;
        let transformed = MatrixUtils.TransformPoint(transform.EffectiveTransform, cx, cy);
        cx = transformed.Dx;
        cy = transformed.Dy;
      }
      if (opaque == null) {
        if (temp.IsOpaque) {
          opaque = temp;
          x = 0;
          y = 0;
        } else {
          dirtyX += cx;
          dirtyY += cy;
        }
      }
      let currentClipper = temp.Clipper;
      if (currentClipper != null) {
        clipper = currentClipper.IntersectWith(clipper);
        if (clipper.IsEmpty) {
          isClipperEmpty = true;
          break;
        }
      }
      clipper.Offset(cx, cy);
      x += cx;
      y += cy;
      if (temp.Parent == null)
        break;
      temp = temp.Parent;
    } while (true);
    if (isClipperEmpty) {
      console.log("\u88C1\u526A\u533A\u57DF\u4E3A\u7A7A\uFF0C\u4E0D\u9700\u8981\u91CD\u7ED8");
      return;
    }
    if (opaque == null) {
      opaque = temp;
      x = 0;
      y = 0;
    }
    console.log(`InvalidQueue.Repaint: ${widget} dirty=${dirtyArea} Opaque=${opaque} area={{X=${dirtyX} Y=${dirtyY} W=${dirtyRect.Width} H=${dirtyRect.Height}}}`);
    canvas.save();
    try {
      clipper.ApplyToCanvas(canvas);
      canvas.translate(x, y);
      if (opaque === ctx.Window.RootWidget && !opaque.IsOpaque)
        canvas.clear(ctx.Window.BackgroundColor);
      if (opaque === widget)
        opaque.Paint(canvas, dirtyArea);
      else
        opaque.Paint(canvas, new RepaintChild(opaque, widget, dirtyArea));
    } catch (ex) {
      console.log(`InvalidQueue.RepaintWidget Error: ${ex.Message}`);
    } finally {
      clipper.Dispose();
      canvas.restore();
    }
  }
}
const _UIWindow = class {
  constructor(child) {
    __publicField(this, "RootWidget");
    __publicField(this, "Overlay");
    __publicField(this, "FocusManagerStack", new FocusManagerStack());
    __publicField(this, "EventHookManager", new EventHookManager());
    __publicField(this, "BackgroundColor", Colors.White);
    __publicField(this, "WidgetsInvalidQueue", new InvalidQueue());
    __publicField(this, "OverlayInvalidQueue", new InvalidQueue());
    __publicField(this, "HasPostInvalidateEvent", false);
    __privateAdd(this, _LastMouseX, -1);
    __privateAdd(this, _LastMouseY, -1);
    __publicField(this, "_oldHitResult", new HitTestResult());
    __publicField(this, "_newHitResult", new HitTestResult());
    __publicField(this, "_hitResultOnPointDown");
    this.Overlay = new Overlay(this);
    this.RootWidget = new Root(this, child);
    PaintDebugger.EnableChanged.Add(() => this.RootWidget.Invalidate(InvalidAction.Repaint));
    _UIWindow.Current = this;
  }
  static get Current() {
    return __privateGet(_UIWindow, _Current2);
  }
  static set Current(value) {
    __privateSet(_UIWindow, _Current2, value);
  }
  get ScaleFactor() {
    return 1;
  }
  get LastMouseX() {
    return __privateGet(this, _LastMouseX);
  }
  set LastMouseX(value) {
    __privateSet(this, _LastMouseX, value);
  }
  get LastMouseY() {
    return __privateGet(this, _LastMouseY);
  }
  set LastMouseY(value) {
    __privateSet(this, _LastMouseY, value);
  }
  OnFirstShow() {
    this.RootWidget.Layout(this.Width, this.Height);
    this.Overlay.Layout(this.Width, this.Height);
    let widgetsCanvas = this.GetOffscreenCanvas();
    widgetsCanvas.clear(this.BackgroundColor);
    this.RootWidget.Paint(widgetsCanvas);
    this.GetOnscreenCanvas();
    this.FlushOffscreenSurface();
    this.DrawOffscreenSurface();
    this.Present();
  }
  OnPointerMove(e) {
    this.LastMouseX = e.X;
    this.LastMouseY = e.Y;
    if (this._oldHitResult.StillInLastRegion(e.X, e.Y)) {
      this.OldHitTest(e.X, e.Y);
    } else {
      this.NewHitTest(e.X, e.Y);
    }
    this.CompareAndSwapHitTestResult();
    if (this._oldHitResult.IsHitAnyMouseRegion)
      this._oldHitResult.PropagatePointerEvent(e, (w, pe) => w.RaisePointerMove(pe));
  }
  OnPointerMoveOutWindow() {
    this.LastMouseX = this.LastMouseY = -1;
    this.CompareAndSwapHitTestResult();
  }
  OnPointerDown(pointerEvent) {
    if (this.EventHookManager.HookEvent(EventType.PointerDown, pointerEvent))
      return;
    if (!this._oldHitResult.IsHitAnyWidget) {
      this.RootWidget.HitTest(pointerEvent.X, pointerEvent.Y, this._oldHitResult);
    }
    if (!this._oldHitResult.IsHitAnyMouseRegion)
      return;
    this._hitResultOnPointDown = this._oldHitResult.LastEntry;
    this._oldHitResult.PropagatePointerEvent(pointerEvent, (w, e) => w.RaisePointerDown(e));
    this.FocusManagerStack.Focus(this._oldHitResult.LastHitWidget);
  }
  OnPointerUp(pointerEvent) {
    if (!this._oldHitResult.IsHitAnyMouseRegion)
      return;
    if (this._hitResultOnPointDown != null) {
      if (this._hitResultOnPointDown.ContainsPoint(pointerEvent.X, pointerEvent.Y))
        this._hitResultOnPointDown.Widget.MouseRegion.RaisePointerTap(pointerEvent);
      this._hitResultOnPointDown = null;
    }
    this._oldHitResult.PropagatePointerEvent(pointerEvent, (w, e) => w.RaisePointerUp(e));
  }
  OnScroll(scrollEvent) {
    if (!this._oldHitResult.IsHitAnyWidget)
      return;
    let scrollable = this._oldHitResult.LastHitWidget.FindParent((w) => IsInterfaceOfIScrollable(w));
    if (scrollable == null)
      return;
    let offset = scrollable.OnScroll(scrollEvent.Dx, scrollEvent.Dy);
    if (!offset.IsEmpty)
      this.AfterScrollDoneInternal(scrollable, offset.Dx, offset.Dy);
  }
  OnKeyDown(keyEvent) {
    if (this.EventHookManager.HookEvent(EventType.KeyDown, keyEvent))
      return;
    this.FocusManagerStack.OnKeyDown(keyEvent);
  }
  OnKeyUp(keyEvent) {
    this.FocusManagerStack.OnKeyUp(keyEvent);
  }
  OnTextInput(text) {
    this.FocusManagerStack.OnTextInput(text);
  }
  OldHitTest(winX, winY) {
    let hitTestInOldRegion = true;
    if (this._oldHitResult.LastHitWidget.Root instanceof Root && this.Overlay.HasEntry) {
      this.Overlay.HitTest(winX, winY, this._newHitResult);
      if (this._newHitResult.IsHitAnyMouseRegion)
        hitTestInOldRegion = false;
    }
    if (hitTestInOldRegion) {
      this._newHitResult.CopyFrom(this._oldHitResult);
      this._newHitResult.HitTestInLastRegion(winX, winY);
    }
  }
  NewHitTest(winX, winY) {
    console.log(`========NewHitTest:(${winX},${winY}) ========`);
    if (this.Overlay.HasEntry)
      this.Overlay.HitTest(winX, winY, this._newHitResult);
    if (!this._newHitResult.IsHitAnyWidget)
      this.RootWidget.HitTest(winX, winY, this._newHitResult);
  }
  CompareAndSwapHitTestResult() {
    this._oldHitResult.ExitOldRegion(this._newHitResult);
    this._newHitResult.EnterNewRegion(this._oldHitResult);
    if (this._oldHitResult.LastHitWidget != this._newHitResult.LastHitWidget) {
      console.log(`Hit: ${this._newHitResult.LastHitWidget} ${this._newHitResult.LastWidgetWithMouseRegion}`);
    }
    this._oldHitResult.Reset();
    let temp = this._oldHitResult;
    this._oldHitResult = this._newHitResult;
    this._newHitResult = temp;
  }
  AfterScrollDone(scrollable, offset) {
    if (this._oldHitResult.IsHitAnyWidget && scrollable.IsAnyParentOf(this._oldHitResult.LastHitWidget)) {
      this.AfterScrollDoneInternal(scrollable, offset.Dx, offset.Dy);
    }
  }
  AfterScrollDoneInternal(scrollable, dx, dy) {
    console.assert(dx != 0 || dy != 0);
    let stillInLastRegion = this._oldHitResult.TranslateOnScroll(scrollable, dx, dy, this.LastMouseX, this.LastMouseY);
    if (stillInLastRegion)
      this.OldHitTest(this.LastMouseX, this.LastMouseY);
    else
      this.NewHitTest(this.LastMouseX, this.LastMouseY);
    this.CompareAndSwapHitTestResult();
  }
  BeforeDynamicViewChange(dynamicView) {
    let focusManger = this.FocusManagerStack.GetFocusManagerByWidget(dynamicView);
    if (focusManger.FocusedWidget == null)
      return;
    if (dynamicView.IsAnyParentOf(focusManger.FocusedWidget))
      focusManger.Focus(null);
  }
  AfterDynamicViewChange(dynamicView) {
    if (!this._oldHitResult.IsHitAnyWidget || !(this._oldHitResult.LastHitWidget === dynamicView))
      return;
    this.OldHitTest(this.LastMouseX, this.LastMouseY);
    this.CompareAndSwapHitTestResult();
  }
  RunNewHitTest() {
    this.NewHitTest(this.LastMouseX, this.LastMouseY);
    this.CompareAndSwapHitTestResult();
  }
  StartTextInput() {
  }
  SetTextInputRect(rect) {
  }
  StopTextInput() {
  }
};
let UIWindow = _UIWindow;
_Current2 = new WeakMap();
_LastMouseX = new WeakMap();
_LastMouseY = new WeakMap();
__privateAdd(UIWindow, _Current2, void 0);
function ConvertToButtons(ev) {
  switch (ev.buttons) {
    case 1:
      return PointerButtons.Left;
    case 2:
      return PointerButtons.Right;
    case 3:
      return PointerButtons.Middle;
    default:
      return PointerButtons.None;
  }
}
function ConvertToKeys(ev) {
  let keys = Keys.None;
  if (ev.shiftKey)
    keys |= Keys.Shift;
  if (ev.ctrlKey)
    keys |= Keys.Control;
  if (ev.altKey)
    keys |= Keys.Alt;
  if (ev.key.length == 1) {
    let keyValue = ev.key.charCodeAt(0);
    if (keyValue >= 65 && keyValue <= 90) {
      return keys | keyValue;
    }
    if (keyValue >= 97 && keyValue <= 122) {
      return keys | keyValue - 32;
    }
  }
  switch (ev.code) {
    case "Backspace":
      return keys | Keys.Back;
    case "Tab":
      return keys | Keys.Tab;
    case "Enter":
      return keys | Keys.Return;
    case "ArrowLeft":
      return keys | Keys.Left;
    case "ArrowRight":
      return keys | Keys.Right;
    case "ArrowUp":
      return keys | Keys.Up;
    case "ArrowDown":
      return keys | Keys.Down;
  }
  return keys;
}
class WebWindow extends UIWindow {
  constructor(rootWidget) {
    super(rootWidget);
    __publicField(this, "_offscreenSurface");
    __publicField(this, "_onscreenSurface");
    __publicField(this, "_offscreenCanvas");
    __publicField(this, "_onscreenCanvas");
    __publicField(this, "_webGLVersion", -1);
    __publicField(this, "_forceNewContext", false);
    __publicField(this, "_contextLost", false);
    __publicField(this, "_glContext", 0);
    __publicField(this, "_grContext", null);
    __publicField(this, "_currentCanvasPhysicalWidth", 0);
    __publicField(this, "_currentCanvasPhysicalHeight", 0);
    __publicField(this, "_htmlCanvas");
    __publicField(this, "_htmlInput");
    this._webGLVersion = typeof WebGL2RenderingContext !== "undefined" ? 2 : typeof WebGLRenderingContext !== "undefined" ? 1 : -1;
    this.CreateCanvas();
    this.CreateSurface();
    this.BindWindowEvents();
    this.CreateInput();
  }
  CreateCanvas() {
    this._htmlCanvas = document.createElement("canvas");
    this._htmlCanvas.style.position = "absolute";
    this._htmlCanvas.style.zIndex = "1";
    this.UpdateCanvasSize();
    this._forceNewContext = false;
    this._contextLost = false;
    if (this._webGLVersion != -1) {
      this._glContext = CanvasKit.GetWebGLContext(this._htmlCanvas, {
        antialias: 0,
        majorVersion: this._webGLVersion
      });
      if (this._glContext != 0) {
        this._grContext = CanvasKit.MakeGrContext(this._glContext);
        this._grContext.setResourceCacheLimitBytes(100 * 1024 * 1024);
      }
    }
    document.body.append(this._htmlCanvas);
  }
  UpdateCanvasSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const ratio = window.devicePixelRatio;
    this._htmlCanvas.width = width * ratio;
    this._htmlCanvas.height = height * ratio;
    this._htmlCanvas.style.width = width + "px";
    this._htmlCanvas.style.height = height + "px";
  }
  CreateSurface() {
    if (this._offscreenSurface != null) {
      this._offscreenSurface.dispose();
      this._onscreenSurface.dispose();
      this._offscreenCanvas = null;
      this._offscreenSurface = null;
      this._onscreenCanvas = null;
      this._onscreenSurface = null;
    }
    const ratio = window.devicePixelRatio;
    const physicalWidth = this.Width * ratio;
    const physicalHeight = this.Height * ratio;
    this._offscreenSurface = CanvasKit.MakeRenderTarget(this._grContext, physicalWidth, physicalHeight);
    this._offscreenCanvas = this._offscreenSurface.getCanvas();
    this._offscreenCanvas.scale(ratio, ratio);
    this._onscreenSurface = CanvasKit.MakeOnScreenGLSurface(this._grContext, physicalWidth, physicalHeight, CanvasKit.ColorSpace.SRGB);
    this._onscreenCanvas = this._onscreenSurface.getCanvas();
  }
  CreateInput() {
    let input = document.createElement("input");
    input.style.position = "absolute";
    input.style.width = input.style.height = input.style.padding = "0";
    input.type = "text";
    input.style.border = "none";
    input.style.zIndex = "3";
    document.body.appendChild(input);
    input.addEventListener("input", (ev) => {
      const inputEvent = ev;
      if (inputEvent.data && !inputEvent.isComposing) {
        this.OnTextInput(inputEvent.data);
      }
    });
    input.addEventListener("compositionend", (ev) => {
      if (ev.data) {
        this.OnTextInput(ev.data);
      }
    });
    this._htmlInput = input;
  }
  BindWindowEvents() {
    window.onresize = (ev) => {
      console.log("Resize Window: ", this.Width, this.Height);
      this.UpdateCanvasSize();
      this.CreateSurface();
      this.RootWidget.CachedAvailableWidth = this.Width;
      this.RootWidget.CachedAvailableHeight = this.Height;
      this.RootWidget.Invalidate(InvalidAction.Relayout);
    };
    window.onmousemove = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const buttons = ConvertToButtons(ev);
      this.OnPointerMove(PointerEvent.UseDefault(buttons, ev.x, ev.y, ev.movementX, ev.movementY));
    };
    window.onmousedown = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const buttons = ConvertToButtons(ev);
      this.OnPointerDown(PointerEvent.UseDefault(buttons, ev.x, ev.y, ev.movementX, ev.movementY));
    };
    window.onmouseup = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const buttons = ConvertToButtons(ev);
      this.OnPointerUp(PointerEvent.UseDefault(buttons, ev.x, ev.y, ev.movementX, ev.movementY));
    };
    window.onmouseout = (ev) => {
      this.OnPointerMoveOutWindow();
    };
    window.oncontextmenu = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
    };
    window.onkeydown = (ev) => {
      this.OnKeyDown(KeyEvent.UseDefault(ConvertToKeys(ev)));
      if (ev.code === "Tab") {
        ev.preventDefault();
      }
    };
    window.onkeyup = (ev) => {
      this.OnKeyUp(KeyEvent.UseDefault(ConvertToKeys(ev)));
      if (ev.code === "Tab") {
        ev.preventDefault();
      }
    };
    this._htmlCanvas.onwheel = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.OnScroll(ScrollEvent.Make(ev.x, ev.y, ev.deltaX, ev.deltaY));
    };
  }
  GetOnscreenCanvas() {
    return this._onscreenCanvas;
  }
  GetOffscreenCanvas() {
    return this._offscreenCanvas;
  }
  get Height() {
    return window.innerHeight;
  }
  get Width() {
    return window.innerWidth;
  }
  get ScaleFactor() {
    return window.devicePixelRatio;
  }
  FlushOffscreenSurface() {
    this._offscreenSurface.flush();
  }
  DrawOffscreenSurface() {
    let snapshot = this._offscreenSurface.makeImageSnapshot();
    this._onscreenCanvas.drawImage(snapshot, 0, 0);
    snapshot.delete();
  }
  Present() {
    this._onscreenSurface.flush();
  }
  StartTextInput() {
    setTimeout(() => {
      this._htmlInput.focus({ preventScroll: true });
    }, 0);
  }
  StopTextInput() {
    this._htmlInput.blur();
    this._htmlInput.value = "";
  }
}
class WebCursor extends Cursor {
  constructor(name) {
    super();
    __publicField(this, "Name");
    this.Name = name;
  }
}
const _WebCursors = class {
  get Arrow() {
    return _WebCursors._arrow;
  }
  get Hand() {
    return _WebCursors._hand;
  }
  get IBeam() {
    return _WebCursors._ibeam;
  }
  get ResizeLR() {
    return _WebCursors._resizeLR;
  }
  get ResizeUD() {
    return _WebCursors._resizeUD;
  }
  SetCursor(cursor) {
    window.document.body.style.cursor = cursor.Name;
  }
};
let WebCursors = _WebCursors;
__publicField(WebCursors, "_arrow", new WebCursor("auto"));
__publicField(WebCursors, "_hand", new WebCursor("pointer"));
__publicField(WebCursors, "_ibeam", new WebCursor("text"));
__publicField(WebCursors, "_resizeLR", new WebCursor("e-resize"));
__publicField(WebCursors, "_resizeUD", new WebCursor("s-resize"));
class WebClipboard {
  ReadText() {
    return navigator.clipboard.readText();
  }
  WriteText(text) {
    return navigator.clipboard.writeText(text);
  }
}
class WebApplication extends UIApplication {
  static Run(rootBuilder) {
    let ckLoad = CanvasKitInit({
      locateFile: (file) => "/" + file
    });
    let fontLoad = fetch("/MiSans-Regular.woff2").then((response) => response.arrayBuffer());
    Promise.all([ckLoad, fontLoad]).then(([canvaskit, fontData]) => {
      let win = window;
      win.CanvasKit = canvaskit;
      FontCollection.Init(fontData);
      Cursor.PlatformCursors = new WebCursors();
      Clipboard.Init(new WebClipboard());
      let app = new WebApplication();
      UIApplication.Current = app;
      app.RunInternal(rootBuilder());
    });
  }
  RunInternal(rootWidget) {
    let webWindow = new WebWindow(rootWidget);
    this.MainWindow = webWindow;
    webWindow.OnFirstShow();
  }
  PostInvalidateEvent() {
    requestAnimationFrame(() => {
      this.OnInvalidateRequest();
    });
  }
}
export { AffectsByRelayout, Animatable, AnimatedEvaluation, Animation, AnimationBehavior, AnimationController, AnimationDirection, AnimationStatus, AnimationWithParent, Axis, Binding, BindingOptions, BorderRadius, BorderSide, BorderStyle, BounceInOutCurve, Button, ButtonGroup, ButtonIconPosition, ButtonShape, ButtonStyle, Card, Caret, CaretDecorator, CellCache, CellCacheComparer, CellStyle, Center, ChainedEvaluation, Checkbox, CircularProgressPainter, Clipboard, ClipperOfPath, ClipperOfRect, Color, ColorTween, ColorUtils, Colors, Column, ColumnWidth, ColumnWidthType, Conditional, Container, ContextMenu, ConvertRadiusToSigma, Cubic, Cursor, Cursors, Curve, CurveTween, CurvedAnimation, Curves, DataGrid, DataGridCheckboxColumn, DataGridColumn, DataGridController, DataGridGroupColumn, DataGridHitTestResult, DataGridHostColumn, DataGridIconColumn, DataGridTextColumn, DataGridTheme, DelayTask, Dialog, DoubleUtils, DrawShadow, DynamicView, EdgeInsets, EditableText, EventHookManager, EventPreviewResult, EventType, ExpandIcon, Expanded, FadeTransition, FlippedCurve, FloatTween, FloatUtils, FocusManager, FocusManagerStack, FocusNode, FocusedDecoration, FocusedDecorator, FontCollection, FontStyle, Form, FormItem, FutureBuilder, GetRectForPosition, HitTestEntry, HitTestResult, HorizontalAlignment, HoverDecoration, HoverDecorator, Icon, IconData, IconPainter, Icons, IfConditional, ImageSource, Input, InputBase, InputBorder, Inspector, InterpolationSimulation, Interval, InvalidAction, InvalidQueue, InvalidWidget, IsInterfaceOfIFocusable, IsInterfaceOfIMouseRegion, IsInterfaceOfIRootWidget, IsInterfaceOfIScrollable, ItemState, KeyEvent, Keys, Linear, ListPopup, ListPopupItemWidget, ListView, ListViewController, MainMenu, MakeParagraphBuilder, MakeParagraphStyle, MakeTextStyle, MaterialIcons, MaterialIconsOutlined, Matrix4, MatrixUtils, MenuController, MenuItem, MenuItemType, MenuItemWidget, MouseRegion, MultiChildWidget, Navigator, Notification, NotificationEntry, ObjectNotifier, Offset, OffsetTween, OptionalAnimationController, OutlineInputBorder, OutlinedBorder, Overlay, PaintContext, PaintDebugger, PaintUtils, ParametricCurve, Point, PointerButtons, PointerEvent, Popup, PopupMenu, PopupMenuStack, PopupProxy, PopupTransitionWrap, PropagateEvent, RRect, Radio, Radius, Rect, RepaintArea, RepaintChild, RepeatingSimulation, Root, RotationTransition, RoundedRectangleBorder, Route, RouteChangeAction, RouteEntry, RouteSettings, RouteView, Row, Rx, RxComputed, RxList, RxObject, RxProperty, SawTooth, ScaleYTransition, ScrollController, ScrollDirection, ScrollEvent, Select, SelectText, ShapeBorder, Simulation, SingleChildWidget, Size, SlideTransition, State, StateBase, Switch, Tab, TabBar, TabBody, TabController, TabView, Text, TextBase, TextPainter, Theme, Ticker, Toggleable, Tolerance, Transform, TransitionStack, TreeController, TreeNode, TreeNodeRow, TreeView, Tween, UIApplication, UIWindow, Vector4, VerticalAlignment, View, WebApplication, WhenBuilder, Widget, WidgetController, WidgetList, WidgetRef };
