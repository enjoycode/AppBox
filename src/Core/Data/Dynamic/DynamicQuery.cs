namespace AppBoxCore;

public sealed class DynamicQuery : IBinSerializable
{
    //考虑支持手工多表联查(Joins属性)

    public ModelId ModelId { get; set; }

    public int PageSize { get; set; }

    public int PageIndex { get; set; }

    public SelectItem[] Selects { get; set; } = [];

    public Expression? Filter { get; set; }

    public OrderByItem[] Orders { get; set; } = [];

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteLong(ModelId);
        ws.WriteInt(PageSize);
        ws.WriteInt(PageIndex);

        ws.SerializeExpression(Filter);

        ws.WriteArray(Selects);
        ws.WriteArray(Orders);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        ModelId = rs.ReadLong();
        PageSize = rs.ReadInt();
        PageIndex = rs.ReadInt();

        Filter = (Expression?)rs.Deserialize();

        Selects = rs.ReadArray<TReader, SelectItem>();
        Orders = rs.ReadArray<TReader, OrderByItem>();
    }

    #endregion

    public sealed class SelectItem : IBinSerializable
    {
        public SelectItem() { }

        public SelectItem(string alias, Expression item, DataType type)
        {
            Alias = alias;
            Item = item;
            Type = type;
        }

        public Expression Item { get; private set; } = null!;
        public DataType Type { get; private set; }
        public string Alias { get; private set; } = string.Empty;

        #region ====Serialization====

        public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
        {
            ws.SerializeExpression(Item);
            ws.WriteByte((byte)Type);
            ws.WriteString(Alias);
        }

        public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
        {
            Item = (Expression)rs.Deserialize()!;
            Type = (DataType)rs.ReadByte();
            Alias = rs.ReadString()!;
        }

        #endregion
    }

    public sealed class OrderByItem : IBinSerializable
    {
        public OrderByItem() { }

        public OrderByItem(Expression field, bool descending = false)
        {
            Field = field;
            Descending = descending;
        }

        public Expression Field { get; internal set; } = null!;
        public bool Descending { get; internal set; }

        #region ====Serialization====

        public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
        {
            ws.SerializeExpression(Field);
            ws.WriteBool(Descending);
        }

        public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
        {
            Field = (Expression)rs.Deserialize()!;
            Descending = rs.ReadBool();
        }

        #endregion
    }
}