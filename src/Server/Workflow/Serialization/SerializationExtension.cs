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

        ws.Context.AddToSerialized(activity);

        ws.WriteByte((byte)PayloadType.WorkflowActivity);
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
        if (payloadType != PayloadType.WorkflowActivity)
            throw new SerializationException(SerializationError.PayloadTypeNotMatch);

        var type = reader.ReadByte();
        var activity = ActivityFactory.Make(type);
        reader.Context.AddToDeserialized(activity);
        activity.ReadFrom(ref reader);
        return activity;
    }

    public static void SerializeLinkArray<TWriter>(this ref TWriter ws, RuntimeFlowLink[] links)
        where TWriter : struct, IOutputStream
    {
        ws.WriteVariant(links.Length);
        foreach (var link in links)
            ws.SerializeLink(link);
    }

    public static RuntimeFlowLink[] DeserializeLinkArray<TReader>(this ref TReader rs)
        where TReader : struct, IInputStream
    {
        var count = rs.ReadVariant();
        var links = new RuntimeFlowLink[count];
        for (var i = 0; i < count; i++)
        {
            links[i] = rs.DeserializeLink()!;
        }

        return links;
    }


    public static void SerializeLink<TWriter>(this ref TWriter ws, RuntimeFlowLink? link)
        where TWriter : struct, IOutputStream
    {
        if (link == null)
        {
            ws.WriteByte((byte)PayloadType.Null);
            return;
        }

        if (ws.CheckSerialized(link)) return;

        ws.Context.AddToSerialized(link);

        ws.WriteByte((byte)PayloadType.WorkflowLink);
        link.WriteTo(ref ws);
    }

    public static RuntimeFlowLink? DeserializeLink<TReader>(this ref TReader reader)
        where TReader : struct, IInputStream
    {
        var payloadType = (PayloadType)reader.ReadByte();
        if (payloadType == PayloadType.Null) return null;
        if (payloadType == PayloadType.ObjectRef)
            return (RuntimeFlowLink)reader.Context.GetDeserialized(reader.ReadVariant());
        if (payloadType != PayloadType.WorkflowLink)
            throw new SerializationException(SerializationError.PayloadTypeNotMatch);

        var link = new RuntimeFlowLink();
        reader.Context.AddToDeserialized(link);
        link.ReadFrom(ref reader);
        return link;
    }
}