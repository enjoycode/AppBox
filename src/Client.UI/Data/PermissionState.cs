using System.Diagnostics;
using AppBoxCore;
using PixUI;

namespace AppBoxClient;

/// <summary>
/// 权限状态，用于绑定按钮等
/// </summary>
public sealed class PermissionState : State<bool>
{
    public PermissionState(ModelId permissionModelId)
    {
        Debug.Assert(permissionModelId.Type == ModelType.Permission);
        Load(permissionModelId);
    }

    private bool _value;

    public override object? BoxedValue => Value;
    public override bool Readonly => true;

    public override bool Value
    {
        get => _value;
        set => throw new NotSupportedException();
    }

    private async void Load(ModelId permissionModelId)
    {
        var res = await Channel.HasPermission(permissionModelId);
        if (_value != res)
        {
            _value = res;
            NotifyValueChanged();
        }
    }
}