using AppBoxCore;

namespace AppBoxDesign.Debugging;

public enum DebugEventType : byte
{
    Internal = 0,
    HitBreakpoint = 1,
    EvaluateResult = 2,
    VariableChildren = 3,
    DebuggerExited = 255,
}

public interface IDebugEventArgs : IBinSerializable
{
    public const int DebugEventId = 100;

    DebugEventType EventType { get; }
}

/// <summary>
/// 仅用于使用一个PayloadType包装IDebugEventArgs
/// </summary>
public sealed class DebugEventArgs : IBinSerializable
{
    internal DebugEventArgs() { }

    public DebugEventArgs(ModelId targetModelId, IDebugEventArgs args)
    {
        TargetModelId = targetModelId;
        EventArgs = args;
    }

    public ModelId TargetModelId { get; private set; }
    public IDebugEventArgs EventArgs { get; private set; } = null!;

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteLong(TargetModelId);
        ws.WriteByte((byte)EventArgs.EventType);
        EventArgs.WriteTo(ref ws);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        TargetModelId = rs.ReadLong();
        var eventType = (DebugEventType)rs.ReadByte();
        EventArgs = eventType switch
        {
            DebugEventType.DebuggerExited => new DebuggerExited(),
            DebugEventType.HitBreakpoint => new HitBreakpoint(),
            DebugEventType.EvaluateResult => new EvaluateResult(),
            DebugEventType.VariableChildren => new VariableChildren(),
            _ => throw new Exception($"Unknown event type: {eventType}")
        };
        EventArgs.ReadFrom(ref rs);
    }
}

/// <summary>
/// 命中断点
/// </summary>
public sealed class HitBreakpoint : IDebugEventArgs
{
    public int LineNumber { get; set; }

    public DebugEventType EventType => DebugEventType.HitBreakpoint;

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteInt(LineNumber);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        LineNumber = rs.ReadInt();
    }
}

/// <summary>
/// 调试进程已结束
/// </summary>
public sealed class DebuggerExited : IDebugEventArgs
{
    public int ExitCode { get; set; }

    public DebugEventType EventType => DebugEventType.DebuggerExited;

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteInt(ExitCode);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        ExitCode = rs.ReadInt();
    }
}

/// <summary>
/// 表达式值
/// </summary>
public sealed class EvaluateResult : IDebugEventArgs
{
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 值类型 eg: AppBoxCore.DataTable
    /// </summary>
    public string Type { get; set; } = string.Empty;

    public string Value { get; set; } = string.Empty;

    public string Expression { get; set; } = string.Empty;

    public bool IsError { get; set; }

    public int ChildCount { get; set; }

    public List<EvaluateResult>? Children { get; set; } //暂不需要序列化

    public DebugEventType EventType => DebugEventType.EvaluateResult;

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteString(Name);
        ws.WriteString(Type);
        ws.WriteBool(IsError);
        ws.WriteString(Value);
        ws.WriteString(Expression);
        ws.WriteInt(ChildCount);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        Name = rs.ReadString() ?? string.Empty;
        Type = rs.ReadString() ?? string.Empty;
        IsError = rs.ReadBool();
        Value = rs.ReadString() ?? string.Empty;
        Expression = rs.ReadString() ?? string.Empty;
        ChildCount = rs.ReadInt();
    }
}

/// <summary>
/// 变量的值，仅内部使用
/// </summary>
public sealed class EvaluateValue : IDebugEventArgs
{
    public bool IsError { get; set; }

    public string Value { get; set; } = string.Empty;

    public DebugEventType EventType => DebugEventType.Internal;

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
        => throw new NotSupportedException();

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
        => throw new NotSupportedException();
}

/// <summary>
/// 变量所有子级
/// </summary>
public sealed class VariableChildren : IDebugEventArgs
{
    public List<EvaluateResult> Children { get; } = [];

    public DebugEventType EventType => DebugEventType.VariableChildren;

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteVariant(Children.Count);

        for (var i = 0; i < Children.Count; i++)
        {
            Children[i].WriteTo(ref ws);
        }
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        var count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            var child = new EvaluateResult();
            child.ReadFrom(ref rs);
            Children.Add(child);
        }
    }
}