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
        return ms.ToArray();
    }

    public static T DeserializeMeta<T>(byte[] data, Func<T> creator) where T : IBinSerializable
    {
        var obj = creator();
        using var ms = new MemoryStream(data);
        var reader = new SystemReadStream(ms);
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
            list.Add(model);
        }

        return list;
    }
}