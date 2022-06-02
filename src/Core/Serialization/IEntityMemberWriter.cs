namespace AppBoxCore;

public static class EntityMemberWriteFlags
{
    public const int None = 0;
    public const int Store = 1;
    public const int WriteNull = 2;
    public const int OrderByDesc = 4;
}

public interface IEntityMemberWriter
{
    //所有写入成员值支持Nullable, 因为写入目标可能是存储

    void WriteStringMember(short id, string? value, int flags);

    void WriteIntMember(short id, int? value, int flags);
}