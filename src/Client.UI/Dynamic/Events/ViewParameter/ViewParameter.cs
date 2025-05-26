namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 视图参数，主要用于视图间切换时向目标视图传入状态参数
/// </summary>
public sealed class ViewParameter
{
    /// <summary>
    /// 目标状态名称 eg: "customer" or "customer.id"
    /// </summary>
    public string StateName { get; set; } = null!;

    public IViewParameterSource Source { get; set; } = null!;
}