namespace AppBoxCore;

public interface IEntityMemberReader
{
    //所有类型成员读取均返回非Nullable
    
    string ReadStringMember(int flags);

    bool ReadBoolMember(int flags);

    int ReadIntMember(int flags);

    long ReadLongMember(int flags);

    DateTime ReadDateTimeMember(int flags);

    Guid ReadGuidMember(int flags);

    byte[] ReadBinaryMember(int flags);
}