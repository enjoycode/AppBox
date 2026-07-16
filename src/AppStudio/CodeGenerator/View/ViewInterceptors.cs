namespace AppBoxDesign;

internal sealed class ViewInterceptors : InterceptorManager
{
    public static readonly ViewInterceptors Default = new();

    private ViewInterceptors()
    {
        InvocationInterceptors.Add(CallServiceInterceptor.Name, CallServiceInterceptor.Default);
        InvocationInterceptors.Add(StartWorkflowInterceptor.Name, StartWorkflowInterceptor.Default);
    }
}