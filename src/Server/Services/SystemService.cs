using System;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxServer;

/// <summary>
/// 系统内置的一些服务，如初始化存储、密码Hash等
/// </summary>
internal sealed class SystemService : IService
{
    /// <summary>
    /// 用户登录时验证并返回组织单元的路径
    /// </summary>
    internal Task<TreePath> Login(string user, string password)
    {
        Log.Info($"用户登录: {user}");
        
        var path = new TreePath(new[]
        {
            new TreePathNode(Guid.NewGuid(), "Admin"),
            new TreePathNode(Guid.NewGuid(), "AppBox Corp.")
        });

        return Task.FromResult(path);
    }

    private ValueTask<string> Hello(string name)
    {
        return new ValueTask<string>($"Hello {name}");
    }

    public async ValueTask<AnyValue> InvokeAsync(ReadOnlyMemory<char> method, InvokeArgs args)
    {
        // return method switch
        // {
        //     var s when s.Span.SequenceEqual(nameof(Login)) => AnyValue.From(
        //         await Login(args.GetString()!, args.GetString()!)),
        //     var s when s.Span.SequenceEqual(nameof(Hello)) => AnyValue.From(
        //         await Hello(args.GetString()!)),
        //     _ => throw new Exception($"Can't find method: {method}")
        // };

        if (method.Span.SequenceEqual(nameof(Login)))
            return AnyValue.From(await Login(args.GetString()!, args.GetString()!));
        if (method.Span.SequenceEqual(nameof(Hello)))
            return AnyValue.From(await Hello(args.GetString()!));
        throw new Exception($"Can't find method: {method}");
    }
}