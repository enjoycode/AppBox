using System.Runtime.CompilerServices;

namespace AppBoxCore;

public interface IServerEventArgs
{
    ref readonly AnyValue this[int index] { get; }
}

public sealed class ServerEventArgs : IServerEventArgs
{
    internal ServerEventArgs(IInputStream stream)
    {
        var index = 0;
        while (stream.HasRemaining && index < 5)
        {
            _values[index] = AnyValue.ReadFrom(stream);
            index++;
        }
    }

    private readonly AnyValue5 _values;

    public ref readonly AnyValue this[int index] => ref _values[index];

    [InlineArray(5)]
    private struct AnyValue5
    {
        private AnyValue _value;
    }
}