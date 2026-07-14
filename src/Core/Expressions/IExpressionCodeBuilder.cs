using System.Text;

namespace AppBoxCore;

public interface IExpressionCodeBuilder
{
    StringBuilder StringBuilder { get; }

    /// <summary>
    /// 解析模型的名称
    /// </summary>
    /// <returns> eg: sys.Entities.Employee </returns>
    string ResolveModelTypeName(ModelId modelId);
}