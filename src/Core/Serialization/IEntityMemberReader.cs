namespace AppBoxCore;

public interface IEntityMemberReader
{
    //所有值类型成员读取均返回非Nullable
    
    string? ReadStringMember(int flags);

    int ReadIntMember(int flags);
}