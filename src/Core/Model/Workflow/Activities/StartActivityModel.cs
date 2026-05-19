namespace AppBoxCore;

/// <summary>
/// 开始节点
/// </summary>
public sealed class StartActivityModel : ActivityModel
{
    public StartActivityModel()
    {
        Next = new FlowLink();
    }

    public override byte Type => ActivityType.StartActivity;

    public FlowLink Next { get; }

    public override IEnumerable<FlowLink> GetOutLinks()
    {
        yield return Next;
    }

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        if (Next.Target != null)
        {
            ws.WriteFieldId(1);
            Next.WriteTo(ws);
        }

        ws.WriteFieldEnd();
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);

        var propIndex = 0;
        do
        {
            propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1: Next.ReadFrom(rs); break;
                case 0: break;
                default: throw SerializationException.ReadUnknownField(nameof(StartActivityModel), propIndex);
            }
        } while (propIndex != 0);
    }

    #endregion
}