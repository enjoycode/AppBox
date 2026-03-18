namespace AppBoxCore;

/// <summary>
/// 仅内部使用，用于虚拟代码转译为运行时代码
/// </summary>
public interface IMemberPathBuilder
{
    EntityFieldExpression F(string name);
    EntityExpression R(string name, long modelId);
    EntitySetExpression S(string name, long modelId);
    Expression U(string name);
}