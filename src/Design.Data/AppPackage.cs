using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 用于导入导出
/// </summary>
public sealed class AppPackage : ModelPackage
{
    public AppPackage(ApplicationModel app)
    {
        Application = app;
    }

    public ApplicationModel Application { get; private set; }

    /// <summary>
    /// 用于导入时判断相应的数据库是否存在
    /// </summary>
    public List<DataStoreInfo> DataStores { get; private set; } = [];

    public byte[]? DevModelIdCounter { get; set; }

    public byte[]? UsrModelIdCounter { get; set; }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        Application.WriteTo(ref ws);

        ws.Serialize(DevModelIdCounter);
        ws.Serialize(UsrModelIdCounter);

        ws.WriteVariant(DataStores.Count);
        foreach (var dataStore in DataStores)
        {
            dataStore.WriteTo(ref ws);
        }

        ws.WriteFieldEnd(); //reserved

        base.WriteTo(ref ws);
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        Application.ReadFrom(ref rs);

        DevModelIdCounter = (byte[]?)rs.Deserialize();
        UsrModelIdCounter = (byte[]?)rs.Deserialize();

        var count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            var dataStore = new DataStoreInfo();
            dataStore.ReadFrom(ref rs);
            DataStores.Add(dataStore);
        }

        rs.ReadFieldId(); //reserved

        base.ReadFrom(ref rs);
    }

    #endregion

    public sealed class DataStoreInfo : IBinSerializable
    {
        public long Id { get; set; }
        public string Name { get; set; } = null!;

        public DataStoreKind Kind { get; set; }

        public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
        {
            //考虑精确匹配数据库提供者的属性，用于利用某数据库特性的应用(eg:只能用PGSQL)
            ws.WriteLong(Id);
            ws.WriteString(Name);
            ws.WriteByte((byte)Kind);
            ws.WriteFieldEnd(); //reserved
        }

        public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
        {
            Id = rs.ReadLong();
            Name = rs.ReadString()!;
            Kind = (DataStoreKind)rs.ReadByte();
            rs.ReadFieldId(); //reserved
        }
    }
}