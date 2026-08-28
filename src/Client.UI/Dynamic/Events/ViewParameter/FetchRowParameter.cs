using AppBoxCore;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 填充数据行的视图参数
/// </summary>
public sealed class FetchRowParameter : IViewParameterSource
{
    internal const string SourceName = "FetchRow";

    public string TypeName => SourceName;

    public List<PrimaryKeyValue> PkValues { get; } = [];

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteVariant(PkValues.Count);
        foreach (var pk in PkValues)
        {
            ws.WriteString(pk.FromStateName);
            ws.WriteString(pk.TargetFieldName);
        }
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        var count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            var pk = new PrimaryKeyValue();
            pk.FromStateName = rs.ReadString()!;
            pk.TargetFieldName = rs.ReadString()!;
            PkValues.Add(pk);
        }
    }

    #endregion

    public async ValueTask Run(IDynamicContext current, IDynamicContext target, string targetName)
    {
        //1. 复制主键字段的值给目标
        foreach (var pkValue in PkValues)
        {
            var src = current.FindState(pkValue.FromStateName);
            var dst = target.FindState($"{targetName}.{pkValue.TargetFieldName}");
            if (src == null || dst == null)
                throw new Exception("Can't find current or target state");
            dst.Value!.CopyFrom(current, src);
        }

        //2. 开始fetch目标DataRow
        var targetState = target.FindState(targetName);
        if (targetState == null)
            throw new Exception($"Target state: {targetName} does not exist");
        if (targetState.Type != DynamicStateType.DataRow)
            throw new Exception($"Target state: {targetName} must be a DataRow");

        var targetDataRow = (DynamicDataRow)targetState.Value!;
        await targetDataRow.Source.Fetch(target);
    }

    /// <summary>
    /// 填充数据行时的主键的值
    /// </summary>
    public sealed class PrimaryKeyValue
    {
        /// <summary>
        /// 目标字段名称，不需要全路径
        /// </summary>
        public string TargetFieldName { get; set; } = string.Empty;

        /// <summary>
        /// 来源状态名称，即将来源状态值复制给目标状态, eg: orders.Current.OrderId
        /// </summary>
        public string FromStateName { get; set; } = string.Empty;
    }
}