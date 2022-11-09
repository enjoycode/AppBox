// using System;
// using System.Threading;
// using AppBoxCore;
//
// namespace AppBoxStore;
//
// internal sealed class EntityMemberValueSetter : IEntityMemberReader
// {
//     private static readonly ThreadLocal<EntityMemberValueSetter> _threadLocal =
//         new(() => new EntityMemberValueSetter());
//
//     internal static EntityMemberValueSetter ThreadInstance => _threadLocal.Value;
//
//     internal AnyValue Value;
//
//     public string ReadStringMember(int flags) => (string)Value.BoxedValue!;
//
//     public bool ReadBoolMember(int flags) => Value.BoolValue;
//
//     public byte ReadByteMember(int flags) => Value.ByteValue;
//
//     public int ReadIntMember(int flags) => Value.IntValue;
//
//     public long ReadLongMember(int flags) => Value.LongValue;
//
//     public DateTime ReadDateTimeMember(int flags) => Value.DateTimeValue;
//
//     public Guid ReadGuidMember(int flags) => Value.GuidValue;
//
//     public byte[] ReadBinaryMember(int flags) => (byte[])Value.BoxedValue!;
//
//     public T ReadEntityRefMember<T>(int flags, Func<T>? creator) where T : Entity
//         => (T)Value.BoxedValue!;
//
//     public void ReadEntitySetMember<T>(int flags, EntitySet<T> entitySet) where T : Entity, new()
//         => throw new NotSupportedException();
// }