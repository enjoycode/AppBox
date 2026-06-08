using AppBoxCore;

namespace AppBox.Workflow;

public static class SerializationExtension
{
    public static void SerializeActivity<TWriter>(this ref TWriter ws, Activity? activity)
        where TWriter : struct, IOutputStream
    {
        if (activity == null)
        {
            ws.WriteByte((byte)PayloadType.Null);
            return;
        }

        if (ws.CheckSerialized(activity)) return;

        ws.WriteByte((byte)PayloadType.Activity);
        ws.WriteByte(activity.Type);
        activity.WriteTo(ref ws);
    }

    public static Activity? DeserializeActivity<TReader>(this ref TReader reader)
        where TReader : struct, IInputStream
    {
        var payloadType = (PayloadType)reader.ReadByte();
        if (payloadType == PayloadType.Null) return null;
        if (payloadType == PayloadType.ObjectRef)
            return (Activity)reader.Context.GetDeserialized(reader.ReadVariant());
        if (payloadType != PayloadType.Activity)
            throw new SerializationException(SerializationError.PayloadTypeNotMatch);

        var type = reader.ReadByte();
        var activity = ActivityFactory.Make(type);
        activity.ReadFrom(ref reader);
        return activity;
    }
}