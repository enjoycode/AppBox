namespace AppBoxCore;

public static class SerializationExtension
{
    public static void SerializeActivityNode<TWriter>(this ref TWriter ws, ActivityNode? node)
        where TWriter : struct, IOutputStream
    {
        if (node == null)
        {
            ws.WriteByte((byte)PayloadType.Null);
            return;
        }

        if (ws.CheckSerialized(node)) return;

        ws.WriteByte((byte)PayloadType.ActivityNode);
        ws.WriteByte(node.Type);
        node.WriteTo(ref ws);
    }

    public static ActivityNode? DeserializeActivityNode<TReader>(this ref TReader reader)
        where TReader : struct, IInputStream
    {
        var payloadType = (PayloadType)reader.ReadByte();
        if (payloadType == PayloadType.Null) return null;
        if (payloadType == PayloadType.ObjectRef)
            return (ActivityNode)reader.Context.GetDeserialized(reader.ReadVariant());
        if (payloadType != PayloadType.ActivityNode)
            throw new SerializationException(SerializationError.PayloadTypeNotMatch);

        var type = reader.ReadByte();
        var activity = ActivityNodeFactory.Make(type);
        activity.ReadFrom(ref reader);
        return activity;
    }
}