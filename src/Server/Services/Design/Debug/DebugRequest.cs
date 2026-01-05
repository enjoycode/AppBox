using AppBoxCore;
using AppBoxDesign.Debugging;

namespace AppBoxServer.Design;

/// <summary>
/// 挂起的调试请求命令，收到调试器结果后解析
/// </summary>
internal readonly struct DebugRequest
{
    public DebugRequest(DebugRequestType type)
    {
        RequestType = type;
    }

    public readonly DebugRequestType RequestType;
    public readonly TaskCompletionSource<DebugEventArgs> TaskCompletionSource { get; } = new();

    public IDebugEventArgs ParseResponse(MIResultRecord response) => RequestType switch
    {
        DebugRequestType.CreateVariable => ParseCreateVariable(response),
        DebugRequestType.EvaluateVariable => ParseEvaluateVariable(response),
        DebugRequestType.ListChildren => ParseListChildren(response),
        _ => throw new NotImplementedException(RequestType.ToString())
    };

    private static EvaluateResult ParseCreateVariable(MIResultRecord record)
    {
        //解析值
        var response = new EvaluateResult
        {
            Name = ((MIConst)record["name"]).ToString(),
            Type = ((MIConst)record["type"]).GetString(),
            Value = ((MIConst)record["value"]).GetString(),
            Expression = ((MIConst)record["exp"]).GetString(),
            ChildCount = ((MIConst)record["numchild"]).GetInt()
        };
        return response;
    }

    private static EvaluateValue ParseEvaluateVariable(MIResultRecord record)
    {
        var response = new EvaluateValue()
        {
            Value = ((MIConst)record["value"]).GetString(),
        };
        return response;
    }

    private static VariableChildren ParseListChildren(MIResultRecord record)
    {
        var response = new VariableChildren();
        var children = (MIList)record["children"];
        for (var i = 0; i < children.Count; i++)
        {
            var child = (MITuple)((MIResult)children[0]).Value;
            var result = new EvaluateResult()
            {
                Name = ((MIConst)child["name"]).ToString(),
                Type = ((MIConst)child["type"]).GetString(),
                Expression = ((MIConst)child["exp"]).GetString(),
                ChildCount = ((MIConst)child["numchild"]).GetInt()
            };
            response.Children.Add(result);
        }

        return response;
    }
}

internal enum DebugRequestType
{
    CreateVariable,
    ListChildren,
    EvaluateVariable,
}