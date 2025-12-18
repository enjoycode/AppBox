using AppBoxCore;

namespace AppBoxDesign.Debugging;

public enum DebugEventType : byte
{
    HitBreakpoint = 1,
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

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteLong(TargetModelId);
        ws.WriteByte((byte)EventArgs.EventType);
        EventArgs.WriteTo(ws);
    }

    public void ReadFrom(IInputStream rs)
    {
        TargetModelId = rs.ReadLong();
        var eventType = (DebugEventType)rs.ReadByte();
        EventArgs = eventType switch
        {
            DebugEventType.DebuggerExited => new DebuggerExited(),
            DebugEventType.HitBreakpoint => new HitBreakpoint(),
            _ => throw new Exception($"Unknown event type: {eventType}")
        };
        EventArgs.ReadFrom(rs);
    }
}

/// <summary>
/// 命中断点
/// </summary>
public sealed class HitBreakpoint : IDebugEventArgs
{
    public DebugEventType EventType => DebugEventType.HitBreakpoint;

    public void WriteTo(IOutputStream ws)
    {
        throw new NotImplementedException();
    }

    public void ReadFrom(IInputStream rs)
    {
        throw new NotImplementedException();
    }
}

/// <summary>
/// 调试进程已结束
/// </summary>
public sealed class DebuggerExited : IDebugEventArgs
{
    internal DebuggerExited() { }

    public DebuggerExited(int exitCode)
    {
        ExitCode = exitCode;
    }

    public int ExitCode { get; private set; }

    public DebugEventType EventType => DebugEventType.DebuggerExited;

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteInt(ExitCode);
    }

    public void ReadFrom(IInputStream rs)
    {
        ExitCode = rs.ReadInt();
    }
}