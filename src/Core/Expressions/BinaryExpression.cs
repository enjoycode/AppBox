using System.Text;

namespace AppBoxCore;

using LinqExpressionType = System.Linq.Expressions.ExpressionType;

public sealed class BinaryExpression : Expression
{
    internal BinaryExpression() { }

    public BinaryExpression(Expression leftOperator, Expression rightOperator,
        BinaryOperatorType operatorType, TypeExpression? convertedType = null)
    {
        LeftOperand = Equals(null, leftOperator) ? new ConstantExpression(null) : leftOperator;
        RightOperand = Equals(null, rightOperator) ? new ConstantExpression(null) : rightOperator;
        BinaryType = operatorType;
        ConvertedType = convertedType;
    }

    #region ====Properties====

    public Expression LeftOperand { get; private set; } = null!;

    public BinaryOperatorType BinaryType { get; private set; }

    public Expression RightOperand { get; private set; } = null!;

    public TypeExpression? ConvertedType { get; private set; }

    public override ExpressionType Type => ExpressionType.BinaryExpression;

    #endregion

    #region ====Overrides Methods====

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        //Todo:判断In,Like等特殊语法进行方法转换，否则解析器无法解析
        if (BinaryType == BinaryOperatorType.Like)
        {
            sb.Append("f.Contains(");
            LeftOperand.ToCode(sb, preTabs);
            sb.Append(",");
            RightOperand.ToCode(sb, preTabs);
            sb.Append(")");
        }
        else
        {
            LeftOperand.ToCode(sb, preTabs);
            sb.AppendFormat(" {0} ", GetBinaryOperatorTypeString());
            RightOperand.ToCode(sb, preTabs);
        }
    }

    public override LinqExpression? ToLinqExpression(IExpressionContext ctx)
    {
        var left = LeftOperand.ToLinqExpression(ctx)!;
        var right = RightOperand.ToLinqExpression(ctx)!;
        var op = GetLinqExpressionType();

        LinqExpression res = LinqExpression.MakeBinary(op, left, right);
        return TryConvert(res, ConvertedType, ctx);
    }

//         public override System.Linq.Expressions.Expression ToLinqExpression(IExpressionContext ctx)
//         {
//             //TODO: 暂简单处理Nullable问题
//             //TODO: 优化TupleField<String>的相关比较，直接用原生utf8，不要再转换为C#字符串
//             var left = LeftOperand.ToLinqExpression(ctx);
//             var right = RightOperand.ToLinqExpression(ctx);
// #if FUTURE
//             if (LeftOperand.Type == ExpressionType.KVFieldExpression)
//             {
//                 var tupleExp = (KVFieldExpression)LeftOperand;
//                 if (!(tupleExp.IsClassType()
//                     || RightOperand.Type == ExpressionType.KVFieldExpression
//                     || (RightOperand.Type == ExpressionType.PrimitiveExpression && ((PrimitiveExpression)RightOperand).Value == null)))
//                 {
//                     right = System.Linq.Expressions.Expression.Convert(right, left.Type);
//                 }
//             }
//             else if (RightOperand.Type == ExpressionType.KVFieldExpression)
//             {
//                 var tupleExp = (KVFieldExpression)RightOperand;
//                 if (!(tupleExp.IsClassType()
//                     || LeftOperand.Type == ExpressionType.KVFieldExpression
//                      || (LeftOperand.Type == ExpressionType.PrimitiveExpression && ((PrimitiveExpression)LeftOperand).Value == null)))
//                 {
//                     left = System.Linq.Expressions.Expression.Convert(left, right.Type);
//                 }
//             }
// #endif
//
//             System.Linq.Expressions.ExpressionType type;
//             return System.Linq.Expressions.Expression.MakeBinary(type, left, right);
//         }

    private LinqExpressionType GetLinqExpressionType() => BinaryType switch
    {
        BinaryOperatorType.Plus => LinqExpressionType.Add,
        BinaryOperatorType.Minus => LinqExpressionType.Subtract,
        BinaryOperatorType.Multiply => LinqExpressionType.Multiply,
        BinaryOperatorType.Divide => LinqExpressionType.Divide,
        BinaryOperatorType.Equal => LinqExpressionType.Equal,
        BinaryOperatorType.NotEqual => LinqExpressionType.NotEqual,
        BinaryOperatorType.Greater => LinqExpressionType.GreaterThan,
        BinaryOperatorType.GreaterOrEqual => LinqExpressionType.GreaterThanOrEqual,
        BinaryOperatorType.Less => LinqExpressionType.LessThan,
        BinaryOperatorType.LessOrEqual => LinqExpressionType.LessThanOrEqual,
        _ => throw new NotImplementedException()
    };

    private string GetBinaryOperatorTypeString() => BinaryType switch
    {
        BinaryOperatorType.BitwiseAnd => "&",
        BinaryOperatorType.BitwiseOr => "|",
        BinaryOperatorType.BitwiseXor => "Xor",
        BinaryOperatorType.Divide => "/",
        BinaryOperatorType.Equal => "==",
        BinaryOperatorType.Greater => ">",
        BinaryOperatorType.GreaterOrEqual => ">=",
        BinaryOperatorType.In => "In",
        BinaryOperatorType.Is => "Is",
        BinaryOperatorType.IsNot => "IsNot",
        BinaryOperatorType.Less => "<",
        BinaryOperatorType.LessOrEqual => "<=",
        BinaryOperatorType.Like => "Like",
        BinaryOperatorType.Minus => "-",
        BinaryOperatorType.Modulo => "Mod",
        BinaryOperatorType.Multiply => "*",
        BinaryOperatorType.NotEqual => "!=",
        BinaryOperatorType.Plus => "+",
        BinaryOperatorType.As => "as",
        _ => throw new NotSupportedException()
    };

    protected internal override void WriteTo(IOutputStream writer)
    {
        writer.SerializeExpression(LeftOperand);
        writer.SerializeExpression(RightOperand);
        writer.WriteByte((byte)BinaryType);
        writer.SerializeExpression(ConvertedType);
        writer.WriteVariant(0); //保留
    }

    protected internal override void ReadFrom(IInputStream reader)
    {
        LeftOperand = (Expression)reader.Deserialize()!;
        RightOperand = (Expression)reader.Deserialize()!;
        BinaryType = (BinaryOperatorType)reader.ReadByte();
        ConvertedType = reader.Deserialize() as TypeExpression;
        reader.ReadVariant(); //保留
    }

    #endregion
}