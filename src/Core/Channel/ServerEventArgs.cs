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
            var payloadType = (PayloadType)stream.ReadByte();
            _values[index] = payloadType switch
            {
                PayloadType.Null => AnyValue.Empty,
                PayloadType.BooleanTrue => true,
                PayloadType.BooleanFalse => false,
                PayloadType.Byte => stream.ReadByte(),
                PayloadType.Int16 => stream.ReadShort(),
                PayloadType.Int32 => stream.ReadInt(),
                PayloadType.Int64 => stream.ReadLong(),
                PayloadType.Float => stream.ReadFloat(),
                PayloadType.Double => stream.ReadDouble(),
                PayloadType.Decimal => stream.ReadDecimal(),
                PayloadType.DateTime => stream.ReadDateTime(),
                PayloadType.Guid => stream.ReadGuid(),
                PayloadType.String => stream.ReadString() ?? AnyValue.Empty,
                _ => AnyValue.From(stream.Deserialize()) //TODO:设置反序列化实体为EntityData
            };

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