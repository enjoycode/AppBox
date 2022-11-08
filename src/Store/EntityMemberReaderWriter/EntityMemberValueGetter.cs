using System;
using System.Threading;

namespace AppBoxCore;

/// <summary>
/// 用于读取实体成员的值为AnyValue
/// </summary>
/// <remarks>
/// <example>
/// 使用示例:
/// <code>
/// var obj = new SomeEntity() { Name = "Rick" };
/// var getter = EntityMemberValueGetter.ThreadInstance;
/// obj.WriteMember(1 /*memberId*/, getter, EntityMemberWriteFlags.None);
/// var memberValue = getter.Value.GuidValue;
/// </code>
/// </example>
/// </remarks>
internal sealed class EntityMemberValueGetter : IEntityMemberWriter
{
    private static readonly ThreadLocal<EntityMemberValueGetter> _threadLocal =
        new(() => new EntityMemberValueGetter());

    internal static EntityMemberValueGetter ThreadInstance => _threadLocal.Value;

    internal AnyValue Value;

    private EntityMemberValueGetter() { }

    public void WriteStringMember(short id, string? value, int flags)
        => Value = value == null ? AnyValue.Empty : AnyValue.From(value);

    public void WriteBoolMember(short id, bool? value, int flags)
        => Value = value == null ? AnyValue.Empty : AnyValue.From(value.Value);

    public void WriteByteMember(short id, byte? value, int flags)
        => Value = value == null ? AnyValue.Empty : AnyValue.From(value.Value);

    public void WriteIntMember(short id, int? value, int flags)
        => Value = value == null ? AnyValue.Empty : AnyValue.From(value.Value);

    public void WriteLongMember(short id, long? value, int flags)
        => Value = value == null ? AnyValue.Empty : AnyValue.From(value.Value);

    public void WriteDateTimeMember(short id, DateTime? value, int flags)
        => Value = value == null ? AnyValue.Empty : AnyValue.From(value.Value);

    public void WriteGuidMember(short id, Guid? value, int flags)
        => Value = value == null ? AnyValue.Empty : AnyValue.From(value.Value);

    public void WriteBinaryMember(short id, byte[]? value, int flags)
        => Value = value == null ? AnyValue.Empty : AnyValue.From(value);

    public void WriteEntityRefMember(short id, Entity? value, int flags)
        => Value = value == null ? AnyValue.Empty : AnyValue.From(value);

    public void WriteEntitySetMember<T>(short id, EntitySet<T>? value, int flags) where T : Entity, new()
        => Value = value == null ? AnyValue.Empty : AnyValue.From(value);
}