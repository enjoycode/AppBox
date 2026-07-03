using System.Diagnostics;

namespace AppBoxCore;

public static class EntityMemberId
{
    public const int INDEXID_UNIQUE_OFFSET = 7;

    // EntityMemberId
    // | Seq 9bit | Layer 2bit | OrderFlag 1bit | LenFlag 4bit|
    
    public const int MAX_SEQ = 512;
    public const short MEMBERID_MASK = unchecked((short)0xFFE0); //2的11次方左移5位
    public const short MEMBERID_LENFLAG_MASK = 0xF; //后4位
    public const int MEMBERID_SEQ_OFFSET = 7;
    public const int MEMBERID_LAYER_OFFSET = 5;
    public const int MEMBERID_ORDER_OFFSET = 4;

    /** 根据模型层级及成员流水号生成实体成员标识 */
    public static short MakeMemberId(ModelLayer layer, int seq)
    {
        Debug.Assert(seq < MAX_SEQ);
        return (short)(seq << MEMBERID_SEQ_OFFSET | ((int)layer) << MEMBERID_LAYER_OFFSET);
    }
}