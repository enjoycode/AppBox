namespace AppBoxCore;

[Flags]
public enum EntityMemberWriteFlags : byte
{
    None = 0,
    Store = 1,
    WriteNull = 2,
    OrderByDesc = 4,
}

public interface IEntityMemberWriter
{
    //所有写入成员值支持Nullable, 因为写入目标可能是存储
    
    void WriteStringMember(short id, string? value, EntityMemberWriteFlags flags);

    void WriteIntMember(short id, int? value, EntityMemberWriteFlags flags);
}