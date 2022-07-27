namespace AppBoxDesign;

/// <summary>
/// 转换服务调用服务的代码，eg:
/// var res = await sys.Services.HelloService.SayHello("aa", 123)
/// var res = await RuntimeContext.InvokeAsync<string>(InvokeArgs.Make("aa", 123))
/// </summary>
internal sealed class CallServiceInterceptor
{
    internal const string Name = "CallService";
}