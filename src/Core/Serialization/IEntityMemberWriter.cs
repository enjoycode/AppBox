namespace AppBoxCore;

public static class EntityMemberWriteFlags
{
    public const int None = 0;
    public const int Store = 1;
    public const int WriteNull = 2;
    public const int OrderByDesc = 4;
    public const int IgnoreNavigates = 8;
}

public interface IEntityMemberWriter
{
    //所有写入成员值支持Nullable, 因为写入目标可能是存储

    void WriteStringMember(short id, string? value, int flags);

    void WriteBoolMember(short id, bool? value, int flags);

    void WriteByteMember(short id, byte? value, int flags);

    void WriteIntMember(short id, int? value, int flags);

    void WriteLongMember(short id, long? value, int flags);

    void WriteFloatMember(short id, float? value, int flags);

    void WriteDoubleMember(short id, double? value, int flags);

    void WriteDateTimeMember(short id, DateTime? value, int flags);

    void WriteGuidMember(short id, Guid? value, int flags);

    void WriteBinaryMember(short id, byte[]? value, int flags);

    void WriteEntityRefMember(short id, Entity? value, int flags);

    void WriteEntitySetMember<T>(short id, EntitySet<T>? value, int flags) where T: Entity, new();
}