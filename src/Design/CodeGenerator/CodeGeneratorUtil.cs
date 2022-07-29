using System.Text;
using Microsoft.CodeAnalysis.Emit;

namespace AppBoxDesign;

internal static class CodeGeneratorUtil
{
    
    /// <summary>
    /// 检查编译是否成功，不成功则抛出异常
    /// </summary>
    internal static void CheckEmitResult(EmitResult emitResult)
    {
        if (emitResult.Success) return;
        
        var sb = new StringBuilder("编译错误:");
        sb.AppendLine();
        for (var i = 0; i < emitResult.Diagnostics.Length; i++)
        {
            var error = emitResult.Diagnostics[i];
            sb.AppendFormat("{0}. {1}", i + 1, error);
            sb.AppendLine();
        }

        throw new Exception(sb.ToString());
    }
}