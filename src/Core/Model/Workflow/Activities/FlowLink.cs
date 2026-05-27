namespace AppBoxCore;

public class FlowLink : IBinSerializable
{
    public string? Name { get; set; }

    private string? _sourceConnector;

    public string SourceConnector
    {
        get => string.IsNullOrEmpty(_sourceConnector) ? "Auto" : _sourceConnector;
        set => _sourceConnector = value;
    }

    private string? _targetConnector;

    public string TargetConnector
    {
        get => string.IsNullOrEmpty(_targetConnector) ? "Auto" : _targetConnector;
        set => _targetConnector = value;
    }

    public ActivityNode? Target;

    /// <summary>
    /// 仅用于设计时，源自本身的设计时连接线IConnection
    /// </summary>
    public object? SourceConnection;

    public virtual void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        if (!string.IsNullOrEmpty(Name))
        {
            ws.WriteFieldId(1);
            ws.WriteString(Name);
        }

        if (!string.IsNullOrEmpty(_sourceConnector))
        {
            ws.WriteFieldId(2);
            ws.WriteString(_sourceConnector);
        }

        if (!string.IsNullOrEmpty(_targetConnector))
        {
            ws.WriteFieldId(3);
            ws.WriteString(_targetConnector);
        }

        if (Target != null)
        {
            ws.WriteFieldId(4);
            ws.WriteByte(Target.Type);
            Target.WriteTo(ref ws);
        }

        ws.WriteFieldEnd();
    }

    public virtual void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        var propIndex = 0;
        do
        {
            propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1: Name = rs.ReadString(); break;
                case 2: _sourceConnector = rs.ReadString(); break;
                case 3: _targetConnector = rs.ReadString(); break;
                case 4:
                {
                    Target = ActivityFactory.Make(rs.ReadByte());
                    Target.ReadFrom(ref rs);
                    break;
                }
                case 0: break;
                default: throw SerializationException.ReadUnknownField(nameof(FlowLink), propIndex);
            }
        } while (propIndex != 0);
    }
}

/// <summary>
/// 条件分支
/// </summary>
public sealed class ConditionLink : FlowLink
{
    /// <summary>
    /// Null表式Else分支
    /// </summary>
    public Expression? Condition { get; set; }

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        if (!Expression.IsNull(Condition))
        {
            ws.WriteFieldId(1);
            ws.Serialize(Condition);
        }

        ws.WriteFieldEnd();
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        var propIndex = 0;
        do
        {
            propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1: Condition = (Expression)rs.Deserialize()!; break;
                case 0: break;
                default: throw SerializationException.ReadUnknownField(nameof(ConditionLink), propIndex);
            }
        } while (propIndex != 0);
    }
}