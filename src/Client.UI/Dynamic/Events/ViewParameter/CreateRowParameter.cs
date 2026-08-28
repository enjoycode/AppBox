using AppBoxCore;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 新建数据行的视图参数
/// </summary>
public sealed class CreateRowParameter : IViewParameterSource
{
    internal const string SourceName = "CreateRow";

    public string TypeName => SourceName;

    public List<FieldDefaultValue> DefaultValues { get; } = [];

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteCollection(DefaultValues);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        rs.ReadCollection(DefaultValues);
    }

    #endregion

    public ValueTask Run(IDynamicContext current, IDynamicContext target, string targetName)
    {
        //复制默认值给目标字段
        foreach (var item in DefaultValues)
        {
            if (Expression.IsNull(item.DefaultValue))
                continue;

            var dst = target.FindState($"{targetName}.{item.TargetFieldName}");
            if (dst == null)
                throw new Exception("Can't find target state");

            object? expressionValue = null;
            try
            {
                var body = item.DefaultValue!.ToLinqExpression(ExpressionContext.Default)!;
                var convertedBody = System.Linq.Expressions.Expression.Convert(body, typeof(object));
                var lambda = System.Linq.Expressions.Expression.Lambda<Func<object?>>(convertedBody);
                var func = lambda.Compile();
                expressionValue = func();
            }
            catch (Exception)
            {
                Notification.Error("无法编译表达式");
            }

            if (expressionValue == null)
                continue;
            var src = new DynamicState() { Type = DynamicState.GetStateTypeByValueType(expressionValue.GetType()) };
            src.Value = new DynamicPrimitive() { Source = DynamicPrimitiveSource.Primitive, Value = expressionValue };

            dst.Value!.CopyFrom(current, src);
        }

        return ValueTask.CompletedTask;
    }

    /// <summary>
    /// 新建数据行时的字段默认值
    /// </summary>
    public sealed class FieldDefaultValue : IBinSerializable
    {
        /// <summary>
        /// 目标字段名称(不需要全路径) eg: CreateTime
        /// </summary>
        public string TargetFieldName { get; set; } = null!;

        /// <summary>
        /// 默认值的表达式 eg: DateTime.Now
        /// </summary>
        public Expression? DefaultValue { get; set; }

        public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
        {
            ws.WriteString(TargetFieldName);
            ws.SerializeExpression(DefaultValue);
        }

        public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
        {
            TargetFieldName = rs.ReadString()!;
            DefaultValue = (Expression?)rs.Deserialize();
        }
    }
}