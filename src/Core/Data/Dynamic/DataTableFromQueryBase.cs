namespace AppBoxCore;

/// <summary>
/// 来源于动态查询的数据表，用于动态视图及报表的数据源
/// </summary>
public abstract class DataTableFromQueryBase
{
    public EntityExpression? Root { get; internal set; }

    public int PageSize { get; internal set; }

    public int PageIndex { get; internal set; }

    /// <summary>
    /// 查询输出的字段
    /// </summary>
    public List<DynamicQuery.SelectItem> Selects { get; } = [];

    /// <summary>
    /// 过滤项
    /// </summary>
    public List<FilterItem> Filters { get; } = [];

    /// <summary>
    /// 排序项
    /// </summary>
    public List<DynamicQuery.OrderByItem> Orders { get; } = [];

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter writer) where TWriter : struct, IOutputStream
    {
        writer.SerializeExpression(Root);
        writer.WriteInt(PageSize);
        writer.WriteInt(PageIndex);
        writer.WriteCollection(Selects);
        writer.WriteCollection(Filters);
        writer.WriteCollection(Orders);
    }

    public void ReadFrom<TReader>(ref TReader reader) where TReader : struct, IInputStream
    {
        Root = (EntityExpression?)reader.Deserialize();
        PageSize = reader.ReadInt();
        PageIndex = reader.ReadInt();
        reader.ReadCollection(Selects);
        reader.ReadCollection(Filters);
        reader.ReadCollection(Orders);
    }

    #endregion

    #region ====FilterItem====

    public sealed class FilterItem : IBinSerializable
    {
        public Expression Field { get; internal set; } = null!;
        public BinaryOperatorType Operator { get; internal set; }

        /// <summary>
        /// 比较的状态或参数的名称
        /// </summary>
        public string State { get; internal set; } = null!;

        #region ====Serialization=====

        public void WriteTo<TWriter>(ref TWriter writer) where TWriter : struct, IOutputStream
        {
            writer.SerializeExpression(Field);
            writer.WriteByte((byte)Operator);
            writer.WriteString(State);
        }

        public void ReadFrom<TReader>(ref TReader reader) where TReader : struct, IInputStream
        {
            Field = (Expression)reader.Deserialize()!;
            Operator = (BinaryOperatorType)reader.ReadByte();
            State = reader.ReadString()!;
        }

        #endregion
    }

    #endregion
}