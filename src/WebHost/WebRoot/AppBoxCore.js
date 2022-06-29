var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { DateTime, Guid, NotImplementedException, List, NotSupportedException } from "/System.js";
var ModelType = /* @__PURE__ */ ((ModelType2) => {
  ModelType2[ModelType2["Entity"] = 0] = "Entity";
  ModelType2[ModelType2["Service"] = 1] = "Service";
  ModelType2[ModelType2["View"] = 2] = "View";
  ModelType2[ModelType2["Workflow"] = 3] = "Workflow";
  ModelType2[ModelType2["Report"] = 4] = "Report";
  ModelType2[ModelType2["Enum"] = 5] = "Enum";
  ModelType2[ModelType2["Event"] = 6] = "Event";
  ModelType2[ModelType2["Permission"] = 7] = "Permission";
  return ModelType2;
})(ModelType || {});
var DataStoreKind = /* @__PURE__ */ ((DataStoreKind2) => {
  DataStoreKind2[DataStoreKind2["None"] = 0] = "None";
  DataStoreKind2[DataStoreKind2["Sys"] = 1] = "Sys";
  DataStoreKind2[DataStoreKind2["Sql"] = 2] = "Sql";
  DataStoreKind2[DataStoreKind2["Blob"] = 3] = "Blob";
  return DataStoreKind2;
})(DataStoreKind || {});
var EntityMemberType = /* @__PURE__ */ ((EntityMemberType2) => {
  EntityMemberType2[EntityMemberType2["DataField"] = 0] = "DataField";
  EntityMemberType2[EntityMemberType2["EntityRef"] = 2] = "EntityRef";
  EntityMemberType2[EntityMemberType2["EntitySet"] = 3] = "EntitySet";
  return EntityMemberType2;
})(EntityMemberType || {});
var DataFieldType = /* @__PURE__ */ ((DataFieldType2) => {
  DataFieldType2[DataFieldType2["EntityId"] = 0] = "EntityId";
  DataFieldType2[DataFieldType2["String"] = 1] = "String";
  DataFieldType2[DataFieldType2["DateTime"] = 2] = "DateTime";
  DataFieldType2[DataFieldType2["Short"] = 4] = "Short";
  DataFieldType2[DataFieldType2["Int"] = 6] = "Int";
  DataFieldType2[DataFieldType2["Long"] = 8] = "Long";
  DataFieldType2[DataFieldType2["Decimal"] = 9] = "Decimal";
  DataFieldType2[DataFieldType2["Bool"] = 10] = "Bool";
  DataFieldType2[DataFieldType2["Guid"] = 11] = "Guid";
  DataFieldType2[DataFieldType2["Byte"] = 12] = "Byte";
  DataFieldType2[DataFieldType2["Binary"] = 13] = "Binary";
  DataFieldType2[DataFieldType2["Enum"] = 14] = "Enum";
  DataFieldType2[DataFieldType2["Float"] = 15] = "Float";
  DataFieldType2[DataFieldType2["Double"] = 16] = "Double";
  return DataFieldType2;
})(DataFieldType || {});
var PayloadType = /* @__PURE__ */ ((PayloadType2) => {
  PayloadType2[PayloadType2["Null"] = 0] = "Null";
  PayloadType2[PayloadType2["BooleanTrue"] = 1] = "BooleanTrue";
  PayloadType2[PayloadType2["BooleanFalse"] = 2] = "BooleanFalse";
  PayloadType2[PayloadType2["Byte"] = 3] = "Byte";
  PayloadType2[PayloadType2["Char"] = 4] = "Char";
  PayloadType2[PayloadType2["Decimal"] = 5] = "Decimal";
  PayloadType2[PayloadType2["Float"] = 6] = "Float";
  PayloadType2[PayloadType2["Double"] = 7] = "Double";
  PayloadType2[PayloadType2["Int16"] = 8] = "Int16";
  PayloadType2[PayloadType2["Int32"] = 9] = "Int32";
  PayloadType2[PayloadType2["Int64"] = 10] = "Int64";
  PayloadType2[PayloadType2["DateTime"] = 15] = "DateTime";
  PayloadType2[PayloadType2["String"] = 16] = "String";
  PayloadType2[PayloadType2["Guid"] = 17] = "Guid";
  PayloadType2[PayloadType2["Map"] = 18] = "Map";
  PayloadType2[PayloadType2["Array"] = 19] = "Array";
  PayloadType2[PayloadType2["List"] = 20] = "List";
  PayloadType2[PayloadType2["ExtKnownType"] = 21] = "ExtKnownType";
  PayloadType2[PayloadType2["ObjectRef"] = 22] = "ObjectRef";
  PayloadType2[PayloadType2["JsonObject"] = 23] = "JsonObject";
  PayloadType2[PayloadType2["Object"] = 24] = "Object";
  PayloadType2[PayloadType2["EntityModelVO"] = 51] = "EntityModelVO";
  PayloadType2[PayloadType2["DesignTree"] = 52] = "DesignTree";
  PayloadType2[PayloadType2["CompletionItem"] = 53] = "CompletionItem";
  PayloadType2[PayloadType2["NewNodeResult"] = 54] = "NewNodeResult";
  PayloadType2[PayloadType2["ChangedModel"] = 55] = "ChangedModel";
  PayloadType2[PayloadType2["CodeProblem"] = 56] = "CodeProblem";
  PayloadType2[PayloadType2["Entity"] = 90] = "Entity";
  return PayloadType2;
})(PayloadType || {});
function IsInterfaceOfIBinSerializable(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && "$meta_AppBoxCore_IBinSerializable" in obj.constructor;
}
class TypeSerializer {
  static RegisterKnownType(payloadType, isStruct, factory) {
    this._serializers.set(payloadType, { IsStruct: isStruct, Factory: factory });
  }
  static GetSerializer(payloadType) {
    return this._serializers.get(payloadType);
  }
}
__publicField(TypeSerializer, "_serializers", /* @__PURE__ */ new Map());
const CHUNK_SIZE = 4096;
function Utf8Encode(str, output) {
  const strLength = str.length;
  let pos = 0;
  while (pos < strLength) {
    let value = str.charCodeAt(pos++);
    if ((value & 4294967168) === 0) {
      output.WriteByte(value);
      continue;
    } else if ((value & 4294965248) === 0) {
      output.WriteByte(value >> 6 & 31 | 192);
    } else {
      if (value >= 55296 && value <= 56319) {
        if (pos < strLength) {
          const extra = str.charCodeAt(pos);
          if ((extra & 64512) === 56320) {
            ++pos;
            value = ((value & 1023) << 10) + (extra & 1023) + 65536;
          }
        }
      }
      if ((value & 4294901760) === 0) {
        output.WriteByte(value >> 12 & 15 | 224);
        output.WriteByte(value >> 6 & 63 | 128);
      } else {
        output.WriteByte(value >> 18 & 7 | 240);
        output.WriteByte(value >> 12 & 63 | 128);
        output.WriteByte(value >> 6 & 63 | 128);
      }
    }
    output.WriteByte(value & 63 | 128);
  }
}
function Utf8Decode(input, charLength) {
  let count = 0;
  const units = [];
  let result = "";
  while (true) {
    if (charLength < 0) {
      if (input.Remaining <= 0) {
        break;
      }
    } else {
      if (count + units.length >= charLength) {
        break;
      }
    }
    const byte1 = input.ReadByte();
    if ((byte1 & 128) === 0) {
      units.push(byte1);
    } else if ((byte1 & 224) === 192) {
      const byte2 = input.ReadByte() & 63;
      units.push((byte1 & 31) << 6 | byte2);
    } else if ((byte1 & 240) === 224) {
      const byte2 = input.ReadByte() & 63;
      const byte3 = input.ReadByte() & 63;
      units.push((byte1 & 31) << 12 | byte2 << 6 | byte3);
    } else if ((byte1 & 248) === 240) {
      const byte2 = input.ReadByte() & 63;
      const byte3 = input.ReadByte() & 63;
      const byte4 = input.ReadByte() & 63;
      let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
      if (unit > 65535) {
        unit -= 65536;
        units.push(unit >>> 10 & 1023 | 55296);
        unit = 56320 | unit & 1023;
      }
      units.push(unit);
    } else {
      units.push(byte1);
    }
    if (units.length >= CHUNK_SIZE) {
      result += String.fromCharCode(...units);
      count += units.length;
      units.length = 0;
    }
  }
  if (units.length > 0) {
    result += String.fromCharCode(...units);
  }
  return result;
}
class BytesInputStream {
  constructor(buffer) {
    __publicField(this, "pos", 0);
    __publicField(this, "view");
    __publicField(this, "bytes");
    __publicField(this, "deserialized", null);
    __publicField(this, "EntityFactories");
    this.bytes = new Uint8Array(buffer);
    this.view = new DataView(buffer);
  }
  get Remaining() {
    return this.view.byteLength - this.pos;
  }
  ensureRemaining(size) {
    if (this.view.byteLength - this.pos < size) {
      throw new RangeError("Has no data.");
    }
  }
  Deserialize() {
    const payloadType = this.ReadByte();
    switch (payloadType) {
      case PayloadType.Null:
        return null;
      case PayloadType.BooleanTrue:
        return true;
      case PayloadType.BooleanFalse:
        return false;
      case PayloadType.String:
        return this.ReadString();
      case PayloadType.Int32:
        return this.ReadInt();
      case PayloadType.Int64:
        return this.ReadLong();
      case PayloadType.DateTime:
        return this.ReadDateTime();
      case PayloadType.JsonObject:
        return this.ReadJsonObject();
      case PayloadType.ObjectRef:
        return this.deserialized[this.ReadVariant()];
      case PayloadType.Entity:
        return this.DeserializeEntity(null);
      case PayloadType.Array:
        return this.ReadArray();
      case PayloadType.List:
        return this.ReadList();
    }
    const serializer = TypeSerializer.GetSerializer(payloadType);
    if (serializer == null)
      throw new Error("Can't find type serializer: " + payloadType);
    let obj = serializer.Factory();
    if (!serializer.IsStruct) {
      this.AddToDeserialized(obj);
    }
    obj.ReadFrom(this);
    return obj;
  }
  DeserializeEntity(creator) {
    let modelId = this.ReadLong();
    let f = creator ?? this.EntityFactories.get(modelId);
    let entity = f();
    this.AddToDeserialized(entity);
    entity.ReadFrom(this);
    return entity;
  }
  AddToDeserialized(obj) {
    if (!this.deserialized) {
      this.deserialized = [];
    }
    this.deserialized.push(obj);
  }
  ReadByte() {
    this.ensureRemaining(1);
    const value = this.view.getUint8(this.pos);
    this.pos++;
    return value;
  }
  ReadBool() {
    return this.ReadByte() === PayloadType.BooleanTrue;
  }
  ReadShort() {
    this.ensureRemaining(2);
    const value = this.view.getInt16(this.pos, true);
    this.pos += 2;
    return value;
  }
  ReadInt() {
    this.ensureRemaining(4);
    const value = this.view.getInt32(this.pos, true);
    this.pos += 4;
    return value;
  }
  ReadLong() {
    this.ensureRemaining(8);
    const value = this.view.getBigInt64(this.pos, true);
    this.pos += 8;
    return value;
  }
  ReadDateTime() {
    let ticks = this.ReadLong() - 621355968000000000n;
    let date = new Date();
    date.setTime(Number(ticks / 10000n));
    return new DateTime(date);
  }
  ReadGuid() {
    this.ensureRemaining(16);
    let value = new Uint8Array(this.bytes.slice(this.pos, this.pos + 16));
    this.pos += 16;
    return new Guid(value);
  }
  ReadEntityId() {
    throw new NotImplementedException();
  }
  ReadBinary() {
    let len = this.ReadVariant();
    this.ensureRemaining(len);
    let value = new Uint8Array(this.bytes.slice(this.pos, this.pos + len));
    this.pos += len;
    return value;
  }
  ReadJsonObject() {
    let jsonString = Utf8Decode(this, -1);
    return JSON.parse(jsonString);
  }
  ReadVariant() {
    let data = this.ReadNativeVariant();
    return -(data & 1) ^ data >> 1 & 2147483647;
  }
  ReadNativeVariant() {
    let data = this.ReadByte();
    if ((data & 128) == 0) {
      return data;
    }
    data &= 127;
    let num2 = this.ReadByte();
    data |= (num2 & 127) << 7;
    if ((num2 & 128) == 0) {
      return data;
    }
    num2 = this.ReadByte();
    data |= (num2 & 127) << 14;
    if ((num2 & 128) == 0) {
      return data;
    }
    num2 = this.ReadByte();
    data |= (num2 & 127) << 21;
    if ((num2 & 128) == 0) {
      return data;
    }
    num2 = this.ReadByte();
    data |= num2 << 28;
    if ((num2 & 240) != 0) {
      throw new Error("out of range");
    }
    return data;
  }
  ReadString() {
    let chars = this.ReadVariant();
    if (chars < 0)
      return null;
    if (chars === 0)
      return "";
    return Utf8Decode(this, chars);
  }
  ReadList() {
    const elementType = this.ReadType();
    let count = this.ReadVariant();
    let list = new List(count);
    this.ReadCollection(elementType, count, (v) => list.Add(v));
    return list;
  }
  ReadArray() {
    const elementType = this.ReadType();
    const count = this.ReadVariant();
    let res = [];
    this.ReadCollection(elementType, count, (v) => res.push(v));
    return res;
  }
  ReadCollection(elementType, count, setter) {
    if (elementType === PayloadType.Entity) {
      for (let i = 0; i < count; i++) {
        setter(this.Deserialize());
      }
      return;
    }
    const serializer = TypeSerializer.GetSerializer(elementType);
    if (serializer) {
      if (serializer.IsStruct) {
        for (let i = 0; i < count; i++) {
          let item = serializer.Factory();
          item.ReadFrom(this);
          setter(item);
        }
      } else {
        for (let i = 0; i < count; i++) {
          setter(this.Deserialize());
        }
      }
    } else {
      throw new NotImplementedException("ReadCollection elementType=" + elementType);
    }
  }
  ReadType() {
    const typeFlag = this.ReadByte();
    if (typeFlag === 2) {
      return PayloadType.Object;
    } else if (typeFlag === 3) {
      return PayloadType.Entity;
    } else if (typeFlag === 0) {
      const payloadType = this.ReadByte();
      if (payloadType === PayloadType.Array || payloadType === PayloadType.List || payloadType === PayloadType.Map) {
        throw new NotImplementedException();
      }
      return payloadType;
    } else {
      throw new NotSupportedException("\u4E0D\u652F\u6301\u7684TypeFlag");
    }
  }
}
class BytesOutputStream {
  constructor() {
    __publicField(this, "pos", 0);
    __publicField(this, "view", new DataView(new ArrayBuffer(128)));
    __publicField(this, "bytes", new Uint8Array(this.view.buffer));
    __publicField(this, "_serializedList", null);
  }
  get Bytes() {
    return this.bytes.subarray(0, this.pos);
  }
  ensureSizeToWrite(sizeToWrite) {
    const requiredSize = this.pos + sizeToWrite;
    if (this.view.byteLength < requiredSize) {
      this.resizeBuffer(requiredSize * 2);
    }
  }
  resizeBuffer(newSize) {
    const newBuffer = new ArrayBuffer(newSize);
    const newBytes = new Uint8Array(newBuffer);
    const newView = new DataView(newBuffer);
    newBytes.set(this.bytes);
    this.view = newView;
    this.bytes = newBytes;
  }
  Skip(size) {
    this.pos += size;
  }
  Serialize(obj) {
    if (obj == null) {
      this.WriteByte(PayloadType.Null);
    } else if (typeof obj === "boolean") {
      this.WriteByte(obj === false ? PayloadType.BooleanFalse : PayloadType.BooleanTrue);
    } else if (typeof obj === "number") {
      this.SerializeNumber(obj);
    } else if (typeof obj === "string") {
      this.WriteByte(PayloadType.String);
      this.WriteString(obj);
    } else if (typeof obj === "bigint") {
      this.WriteByte(PayloadType.Int64);
      this.WriteLong(obj);
    } else if (obj instanceof DateTime) {
      this.WriteByte(PayloadType.DateTime);
      this.WriteDateTime(obj);
    } else if (obj instanceof Guid) {
      this.WriteByte(PayloadType.Guid);
      this.WriteGuid(obj);
    } else if (obj instanceof Entity) {
      this.SerializeEntity(obj);
    } else if (obj instanceof List) {
      this.SerializeList(obj);
    } else if (Array.isArray(obj)) {
      this.SerializeArray(obj);
    } else {
      throw new Error("\u672A\u5B9E\u73B0\u7684\u5E8F\u5217\u5316");
    }
  }
  SerializeEntity(obj) {
    if (!obj) {
      this.WriteByte(PayloadType.Null);
      return;
    }
    if (this.CheckSerialized(obj))
      return;
    this.AddToSerialized(obj);
    this.WriteByte(PayloadType.Entity);
    this.WriteLong(obj.ModelId);
    obj.WriteTo(this);
  }
  SerializeList(obj) {
    this.WriteByte(PayloadType.List);
    this.WriteByte(2);
    this.WriteVariant(obj.length);
    for (let i = 0; i < obj.length; i++) {
      this.Serialize(obj[i]);
    }
  }
  SerializeArray(obj) {
    this.WriteByte(PayloadType.Array);
    this.WriteByte(2);
    this.WriteVariant(obj.length);
    for (let i = 0; i < obj.length; i++) {
      this.Serialize(obj[i]);
    }
  }
  SerializeNumber(num) {
    if (Number.isSafeInteger(num)) {
      if (num >= -2147483648 && num <= 2147483647) {
        this.WriteByte(PayloadType.Int32);
        this.WriteInt(num);
      } else {
        this.WriteByte(PayloadType.Int64);
        this.WriteLong(BigInt(num));
      }
    } else {
      this.WriteByte(PayloadType.Double);
      this.WriteDouble(num);
    }
  }
  WriteByte(v) {
    this.ensureSizeToWrite(1);
    this.view.setUint8(this.pos, v);
    this.pos++;
  }
  WriteBool(v) {
    this.WriteByte(v === true ? PayloadType.BooleanTrue : PayloadType.BooleanFalse);
  }
  WriteShort(v) {
    this.ensureSizeToWrite(2);
    this.view.setInt16(this.pos, v, true);
    this.pos += 2;
  }
  WriteInt(v) {
    this.ensureSizeToWrite(4);
    this.view.setInt32(this.pos, v, true);
    this.pos += 4;
  }
  WriteLong(v) {
    this.ensureSizeToWrite(8);
    this.view.setBigInt64(this.pos, v, true);
    this.pos += 8;
  }
  WriteDouble(v) {
    this.ensureSizeToWrite(8);
    this.view.setFloat64(this.pos, v, true);
    this.pos += 8;
  }
  WriteDateTime(v) {
    this.WriteLong(v.Ticks);
  }
  WriteGuid(v) {
    this.ensureSizeToWrite(16);
    this.bytes.set(v.Value, this.pos);
    this.pos += 16;
  }
  WriteString(v) {
    if (!v) {
      this.WriteVariant(-1);
    } else {
      this.WriteVariant(v.length);
      if (v.length > 0) {
        Utf8Encode(v, this);
      }
    }
  }
  WriteAsciiString(v) {
    if (!v) {
      this.WriteByte(PayloadType.Null);
    } else {
      for (let i = 0; i < v.length; i++) {
        this.WriteByte(v.charCodeAt(i));
      }
    }
  }
  WriteVariant(v) {
    if (!Number.isInteger(v)) {
      throw new Error("must be Integer");
    }
    v = v << 1 ^ v >> 31;
    let temp = 0;
    do {
      temp = v & 127 | 128;
      if ((v >>= 7) != 0) {
        this.WriteByte(temp);
      } else {
        temp = temp & 127;
        this.WriteByte(temp);
        break;
      }
    } while (true);
  }
  GetSerializedIndex(obj) {
    if (!this._serializedList || this._serializedList.length == 0) {
      return -1;
    }
    for (let i = this._serializedList.length - 1; i >= 0; i--) {
      if (this._serializedList[i] === obj) {
        return i;
      }
    }
    return -1;
  }
  CheckSerialized(obj) {
    let index = this.GetSerializedIndex(obj);
    if (index === -1) {
      return false;
    }
    this.WriteByte(PayloadType.ObjectRef);
    this.WriteVariant(index);
    return true;
  }
  AddToSerialized(obj) {
    if (!this._serializedList) {
      this._serializedList = [];
    }
    this._serializedList.push(obj);
  }
}
class Entity {
  ReadFrom(bs) {
  }
  WriteTo(bs) {
  }
}
class DbEntity extends Entity {
}
export { BytesInputStream, BytesOutputStream, DataFieldType, DataStoreKind, DbEntity, Entity, EntityMemberType, IsInterfaceOfIBinSerializable, ModelType, PayloadType, TypeSerializer };
