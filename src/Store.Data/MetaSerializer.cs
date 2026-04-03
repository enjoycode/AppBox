namespace AppBoxCore;

/// <summary>
/// 元数据序列化为byte[]及相应的反序列化
/// </summary>
public static class MetaSerializer
{
    public static byte[] SerializeMeta<T>(T obj) where T : IBinSerializable
    {
        using var ms = new MemoryStream(128);
        var writer = new SystemWriteStream(ms);
        obj.WriteTo(writer);
        return ms.GetBuffer();
    }

    public static T DeserializeMeta<T>(byte[] data, Func<T> creator) where T : IBinSerializable
    {
        using var ms = new MemoryStream(data);
        return DeserializeMeta(ms, creator);
    }

    public static T DeserializeMeta<T>(Stream stream, Func<T> creator) where T : IBinSerializable
    {
        var obj = creator();
        var reader = new SystemReadStream(stream);
        obj.ReadFrom(reader);
        return obj;
    }

    public static IList<ApplicationModel> DeserializeApplications(Stream stream)
    {
        var list = new List<ApplicationModel>();
        var reader = new SystemReadStream(stream);
        while (stream.Position < stream.Length)
        {
            var app = new ApplicationModel();
            app.ReadFrom(reader);
            list.Add(app);
        }

        return list;
    }

    public static IList<ModelFolder> DeserializeFolders(Stream stream)
    {
        var list = new List<ModelFolder>();
        var reader = new SystemReadStream(stream);
        while (stream.Position < stream.Length)
        {
            var folder = new ModelFolder();
            folder.ReadFrom(reader);
            list.Add(folder);
        }

        return list;
    }

    public static IList<ModelBase> DeserializeModels(Stream stream)
    {
        var list = new List<ModelBase>();
        var reader = new SystemReadStream(stream);
        while (stream.Position < stream.Length)
        {
            var modelType = (ModelType)reader.ReadByte();
            var model = ModelFactory.Make(modelType);
            model.ReadFrom(reader);
            model.AcceptChanges();
            list.Add(model);
        }

        return list;
    }
}