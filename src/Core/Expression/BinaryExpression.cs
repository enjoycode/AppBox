using System.Text;

namespace AppBoxCore;

public sealed class BinaryExpression : Expression
{
    #region ====Properties====

    public Expression LeftOperand { get; private set; }

    public BinaryOperatorType BinaryType { get; private set; }

    public Expression RightOperand { get; private set; }

    public override ExpressionType Type => ExpressionType.BinaryExpression;

    #endregion

    #region ====Ctor====

    public BinaryExpression(Expression leftOperator, Expression rightOperator,
        BinaryOperatorType operatorType)
    {
        LeftOperand = Equals(null, leftOperator) ? new PrimitiveExpression(null) : leftOperator;
        RightOperand = Equals(null, rightOperator) ? new PrimitiveExpression(null) : rightOperator;
        BinaryType = operatorType;
    }

    #endregion

    #region ====Overrides Methods====

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
//             switch (BinaryType)
//             {
//                 case BinaryOperatorType.Equal:
//                     type = System.Linq.Expressions.ExpressionType.Equal; break;
//                 case BinaryOperatorType.NotEqual:
//                     type = System.Linq.Expressions.ExpressionType.NotEqual; break;
//                 case BinaryOperatorType.Greater:
//                     type = System.Linq.Expressions.ExpressionType.GreaterThan; break;
//                 case BinaryOperatorType.GreaterOrEqual:
//                     type = System.Linq.Expressions.ExpressionType.GreaterThanOrEqual; break;
//                 case BinaryOperatorType.Less:
//                     type = System.Linq.Expressions.ExpressionType.LessThan; break;
//                 case BinaryOperatorType.LessOrEqual:
//                     type = System.Linq.Expressions.ExpressionType.LessThanOrEqual; break;
//                 default:
//                     throw ExceptionHelper.NotImplemented();
//             }
//
//
//             return System.Linq.Expressions.Expression.MakeBinary(type, left, right);
//         }

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

    private string GetBinaryOperatorTypeString()
    {
        return BinaryType switch
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
    }

    #endregion
}