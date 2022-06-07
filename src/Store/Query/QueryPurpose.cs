namespace AppBoxStore;

/// <summary>
/// 查询的用途
/// </summary>
public enum QueryPurpose : byte
{
    None,
    Count,
    ToScalar,
    ToTree,
    ToSingle,
    ToList,
    ToTreePath
}