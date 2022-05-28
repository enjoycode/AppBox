using System.Text;
using AppBoxCore;

namespace AppBoxDesign;

internal static class CodeGenService
{
    internal static string GenEntityDummyCode(EntityModel model, string appName,
        DesignTree designTree)
    {
        //TODO:暂测试实现

        var sb = new StringBuilder(300);
        sb.Append($"namespace {appName}.Entities;\n");

        sb.Append($"public class {model.Name} \n{{\n");
        sb.Append("}\n");
        return sb.ToString();
    }
}