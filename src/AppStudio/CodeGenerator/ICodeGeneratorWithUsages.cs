using AppBoxCore;

namespace AppBoxDesign;

internal interface ICodeGeneratorWithUsages
{
    /// <summary>
    /// 根据名称查询是否模型
    /// </summary>
    /// <param name="fullName">eg: sys.Entities.Customer</param>
    bool FindModel(string fullName);

    /// <summary>
    /// 添加使用到的模型
    /// </summary>
    /// <param name="fullName">eg: sys.Entities.Customer</param>
    void AddUsedModel(string fullName);

    ModelType TargetModelType { get; }
}