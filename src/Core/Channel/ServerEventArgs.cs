using System.Runtime.CompilerServices;

namespace AppBoxCore;

public interface IServerEventArgs
{
    ref readonly AnyValue this[int index] { get; }
}

/// <summary>
/// 服务端事件参数,用于从AnyArgs读取缓存所有参数，以便多个事件订阅者共享读取参数
/// </summary>
public sealed class ServerEventArgs : IServerEventArgs
{
    public static ServerEventArgs From<T>(ref T stream) where T : struct, IInputStream
    {
        var serverEventArgs = new ServerEventArgs();
        var index = 0;
        while (stream.HasRemaining && index < 5)
        {
            serverEventArgs._values[index] = AnyValue.ReadFrom(ref stream);
            index++;
        }

        return serverEventArgs;
    }

    private ServerEventArgs() { }

    private AnyValue5 _values;

    public ref readonly AnyValue this[int index] => ref _values[index];

    [InlineArray(5)]
    private struct AnyValue5
    {
        private AnyValue _value;
    }
}