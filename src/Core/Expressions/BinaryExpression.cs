using System.Diagnostics;
using System.Text;

namespace AppBoxCore;

using LinqExpressionType = System.Linq.Expressions.ExpressionType;

public sealed class BinaryExpression : Expression
{
    internal BinaryExpression() { }

    public BinaryExpression(Expression leftOperator, Expression rightOperator,
        BinaryOperatorType operatorType, ExpressionTypeInfo? typeInfo = null)
    {
        LeftOperand = Equals(null, leftOperator) ? new ConstantExpression(AnyValue.Empty) : leftOperator;
        RightOperand = Equals(null, rightOperator) ? new ConstantExpression(AnyValue.Empty) : rightOperator;
        BinaryType = operatorType;
        if (typeInfo.HasValue)
        {
            _typeInfo = typeInfo.Value;
            if (IsLogical(BinaryType) && _typeInfo.TypeName != "bool")
                throw new ArgumentException("Type is not bool when is logical");
        }
        else
        {
            if (IsLogical(BinaryType))
                _typeInfo = new ExpressionTypeInfo("bool");
            else
                throw new NotImplementedException(BinaryType.ToString());
        }
    }

    public Expression LeftOperand { get; private set; } = null!;

    public BinaryOperatorType BinaryType { get; private set; }

    public Expression RightOperand { get; private set; } = null!;

    private ExpressionTypeInfo _typeInfo;
    public override ExpressionTypeInfo TypeInfo => _typeInfo;

    public override ExpressionType NodeType => ExpressionType.BinaryExpression;

    internal static bool IsLogical(BinaryOperatorType opType) =>
        opType is BinaryOperatorType.Equal or BinaryOperatorType.NotEqual
            or BinaryOperatorType.Greater or BinaryOperatorType.GreaterOrEqual
            or BinaryOperatorType.Less or BinaryOperatorType.LessOrEqual
            or BinaryOperatorType.AndAlso or BinaryOperatorType.OrElse;

    #region ====Overrides Methods====

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        //Todo:判断In,Like等特殊语法进行方法转换，否则解析器无法解析
        if (BinaryType == BinaryOperatorType.Like)
        {
            sb.Append("f.Contains(");
            LeftOperand.ToCode(sb, preTabs);
            sb.Append(',');
            RightOperand.ToCode(sb, preTabs);
            sb.Append(')');
        }
        else
        {
            LeftOperand.ToCode(sb, preTabs);
            sb.Append($" {GetBinaryOperatorTypeString()} ");
            RightOperand.ToCode(sb, preTabs);
        }
    }

    public override LinqExpression? ToLinqExpression(IExpressionContext ctx)
    {
        var left = LeftOperand.ToLinqExpression(ctx)!;
        var right = RightOperand.ToLinqExpression(ctx)!;
        var op = GetLinqExpressionType();

        //特殊处理 eg: "Hello" + " World"表达式
        if (op == LinqExpressionType.Add && left.Type == typeof(string))
        {
            return TryLinqConvert(LinqExpression.Add(left, right, ExpressionUtils.StringConcatMethod),
                TypeInfo, ctx);
        }

        LinqExpression res = LinqExpression.MakeBinary(op, left, right);
        return TryLinqConvert(res, TypeInfo, ctx);
    }

    private LinqExpressionType GetLinqExpressionType() => BinaryType switch
    {
        BinaryOperatorType.Add => LinqExpressionType.Add,
        BinaryOperatorType.Subtract => LinqExpressionType.Subtract,
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
        BinaryOperatorType.Subtract => "-",
        BinaryOperatorType.Modulo => "Mod",
        BinaryOperatorType.Multiply => "*",
        BinaryOperatorType.NotEqual => "!=",
        BinaryOperatorType.Add => "+",
        BinaryOperatorType.As => "as",
        _ => throw new NotSupportedException()
    };

    protected internal override void WriteTo(IOutputStream writer)
    {
        writer.SerializeExpression(LeftOperand);
        writer.SerializeExpression(RightOperand);
        writer.WriteByte((byte)BinaryType);
        _typeInfo.WriteTo(writer);
        writer.WriteVariant(0); //保留
    }

    protected internal override void ReadFrom(IInputStream reader)
    {
        LeftOperand = (Expression)reader.Deserialize()!;
        RightOperand = (Expression)reader.Deserialize()!;
        BinaryType = (BinaryOperatorType)reader.ReadByte();
        _typeInfo = ExpressionTypeInfo.ReadFrom(reader);
        reader.ReadVariant(); //保留
    }

    #endregion
}

public enum BinaryOperatorType
{
    BitwiseAnd = 7,
    BitwiseOr = 8,
    BitwiseXor = 9,
    Divide = 10,
    Equal = 0,
    Greater = 2,
    GreaterOrEqual = 5,
    In = 17,
    NotIn = 22,
    Is = 16,
    IsNot = 15,
    Less = 3,
    LessOrEqual = 4,
    Like = 6,
    Subtract = 14,
    Modulo = 11,
    Multiply = 12,
    NotEqual = 1,
    Add = 13,
    As = 18,
    AndAlso = 19,
    OrElse = 20,
    Assign = 21,
}