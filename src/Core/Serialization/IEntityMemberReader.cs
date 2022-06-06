namespace AppBoxCore;

public interface IEntityMemberReader
{
    //所有类型成员读取均返回非Nullable

    string ReadStringMember(int flags);

    bool ReadBoolMember(int flags);

    byte ReadByteMember(int flags);

    int ReadIntMember(int flags);

    long ReadLongMember(int flags);

    DateTime ReadDateTimeMember(int flags);

    Guid ReadGuidMember(int flags);

    byte[] ReadBinaryMember(int flags);

    T ReadEntityRefMember<T>(int flags, Func<T>? creator) where T : Entity;

    IList<T> ReadEntitySetMember<T>(int flags, Func<T>? creator) where T : Entity;
}