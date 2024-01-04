using System.Collections;
using System.Text;

namespace AppBoxCore;

public abstract class Expression
{
    //关于LinqExpression的一些限制
    //https://github.com/bartdesmet/ExpressionFutures/tree/master/CSharpExpressions
    // eg: System.Linq.Expressions.Expression<Func<Task<int>>> f = async () => await Task.FromResult(42);

    /// <summary>
    /// 表达式节点类型
    /// </summary>
    public abstract ExpressionType Type { get; }

    /// <summary>
    /// 转换为用于表达式编辑器的代码
    /// </summary>
    public abstract void ToCode(StringBuilder sb, int preTabs);

    /// <summary>
    /// 获取运行时类型
    /// </summary>
    public virtual Type GetRuntimeType(IExpressionContext ctx) =>
        throw new NotSupportedException(GetType().FullName);

    //TODO:直接参考FastExpressionCompiler emit code，省掉一次转换
    public virtual LinqExpression? ToLinqExpression(IExpressionContext ctx) =>
        throw new NotSupportedException(GetType().FullName);

    public static bool IsNull(Expression? exp) => Equals(exp, null);

    #region ====Serialization====

    protected internal virtual void WriteTo(IOutputStream writer) =>
        throw new NotSupportedException(GetType().FullName);

    protected internal virtual void ReadFrom(IInputStream reader) =>
        throw new NotSupportedException(GetType().FullName);

    #endregion

    #region ====Overrides====

    public override int GetHashCode()
    {
        return ToString().GetHashCode();
    }

    public override bool Equals(object? obj)
    {
        return ReferenceEquals(this, obj);
    }

    public override string ToString()
    {
        var sb = StringBuilderCache.Acquire();
        ToCode(sb, 0);
        return StringBuilderCache.GetStringAndRelease(sb);
    }

    #endregion

    #region ====特定类型方法====

    public Expression Contains(Expression value) => new BinaryExpression(this, value, BinaryOperatorType.Like);

    /// <summary>
    /// 相当于expA = expB, 因无法重写=操作符
    /// </summary>
    public Expression Assign(Expression value) => new BinaryExpression(this, value, BinaryOperatorType.Assign);

    public BinaryExpression In(Expression list) => new(this, list, BinaryOperatorType.In);

    public BinaryExpression In(IEnumerable list) => new(this, new ConstantExpression(list), BinaryOperatorType.In);

    public BinaryExpression NotIn(Expression list) => new(this, list, BinaryOperatorType.NotIn);

    public BinaryExpression NotIn(IEnumerable list) =>
        new(this, new ConstantExpression(list), BinaryOperatorType.NotIn);

    #endregion

    #region ====操作符重载====

    public static Expression operator +(Expression left, Expression right)
    {
        return new BinaryExpression(left, right, BinaryOperatorType.Plus);
    }

    public static Expression operator -(Expression left, Expression right)
    {
        return new BinaryExpression(left, right, BinaryOperatorType.Minus);
    }

    public static Expression operator *(Expression left, Expression right)
    {
        return new BinaryExpression(left, right, BinaryOperatorType.Multiply);
    }

    public static Expression operator /(Expression left, Expression right)
    {
        return new BinaryExpression(left, right, BinaryOperatorType.Divide);
    }

    public static Expression operator %(Expression left, Expression right)
    {
        return new BinaryExpression(left, right, BinaryOperatorType.Modulo);
    }

    public static Expression operator &(Expression left, Expression right)
    {
        //暂转换为AndAlso
        return new BinaryExpression(left, right, BinaryOperatorType.AndAlso);
    }

    public static Expression operator |(Expression left, Expression right)
    {
        //暂转换为OrElse
        return new BinaryExpression(left, right, BinaryOperatorType.OrElse);
    }

    public static BinaryExpression operator ==(Expression left, Expression right)
    {
        return new BinaryExpression(left, right, BinaryOperatorType.Equal);
    }

    public static BinaryExpression operator !=(Expression left, Expression right)
    {
        return new BinaryExpression(left, right, BinaryOperatorType.NotEqual);
    }

    public static BinaryExpression operator >(Expression left, Expression right)
    {
        return new BinaryExpression(left, right, BinaryOperatorType.Greater);
    }

    public static BinaryExpression operator >=(Expression left, Expression right)
    {
        return new BinaryExpression(left, right, BinaryOperatorType.GreaterOrEqual);
    }

    public static BinaryExpression operator <(Expression left, Expression right)
    {
        return new BinaryExpression(left, right, BinaryOperatorType.Less);
    }

    public static BinaryExpression operator <=(Expression left, Expression right)
    {
        return new BinaryExpression(left, right, BinaryOperatorType.LessOrEqual);
    }

    //public static BinaryExpression Op_Like(Expression left, Expression right)
    //{
    //    return new BinaryExpression(left, right, BinaryOperatorType.Like);
    //}

    #endregion

    #region ====隐式转换====

    public static implicit operator Expression(byte[] val) => new ConstantExpression(val);

    public static implicit operator Expression(bool val) => new ConstantExpression(val);

    public static implicit operator Expression(bool? val) =>
        val.HasValue ? new ConstantExpression(val.Value) : new ConstantExpression(null);

    public static implicit operator Expression(char val) => new ConstantExpression(val);

    public static implicit operator Expression(char? val) =>
        val.HasValue ? new ConstantExpression(val.Value) : new ConstantExpression(null);

    public static implicit operator Expression(DateTime val) => new ConstantExpression(val);

    public static implicit operator Expression(DateTime? val) =>
        val.HasValue ? new ConstantExpression(val.Value) : new ConstantExpression(null);

    public static implicit operator Expression(decimal val) => new ConstantExpression(val);

    public static implicit operator Expression(decimal? val) =>
        val.HasValue ? new ConstantExpression(val.Value) : new ConstantExpression(null);

    public static implicit operator Expression(Guid val) => new ConstantExpression(val);

    public static implicit operator Expression(Guid? val) =>
        val.HasValue ? new ConstantExpression(val.Value) : new ConstantExpression(null);

    public static implicit operator Expression(int val) => new ConstantExpression(val);

    public static implicit operator Expression(int? val) =>
        val.HasValue ? new ConstantExpression(val.Value) : new ConstantExpression(null);

    public static implicit operator Expression(long val) => new ConstantExpression(val);

    public static implicit operator Expression(long? val) =>
        val.HasValue ? new ConstantExpression(val.Value) : new ConstantExpression(null);

    public static implicit operator Expression(string val) => new ConstantExpression(val);

    public static implicit operator Expression(float val) => new ConstantExpression(val);

    public static implicit operator Expression(float? val) =>
        val.HasValue ? new ConstantExpression(val.Value) : new ConstantExpression(null);

    public static implicit operator Expression(double val) => new ConstantExpression(val);

    public static implicit operator Expression(double? val) =>
        val.HasValue ? new ConstantExpression(val.Value) : new ConstantExpression(null);

    #endregion
}