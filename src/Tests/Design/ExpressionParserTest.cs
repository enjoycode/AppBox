using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using NUnit.Framework;

namespace Tests.Design;

public class ExpressionParserTest
{
    [Test]
    public void ParseTest()
    {
        const string code = @"using System;
public static class Expression
{
    private static int v = 1;
    public static object? Method()
    {
        //return DateTime.Now;
        return v;
    }
}
";

        var parseOptions = new CSharpParseOptions().WithLanguageVersion(LanguageVersion.CSharp11);
        var compilationOptions = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary)
            .WithNullableContextOptions(NullableContextOptions.Enable);

        var tree = CSharpSyntaxTree.ParseText(code, parseOptions);
        var root = tree.GetCompilationUnitRoot();
        var compilation = CSharpCompilation.Create("Expression", options: compilationOptions)
            .AddReferences(MetadataReference.CreateFromFile(typeof(string).Assembly.Location))
            .AddSyntaxTrees(tree);
        var semanticModel = compilation.GetSemanticModel(tree);
        var diagnostics = semanticModel.GetDiagnostics();

        var returnNode = root.DescendantNodes()
            .OfType<ReturnStatementSyntax>()
            .Single();
        // var memberAccess = (MemberAccessExpressionSyntax) returnNode.Expression!;
        // var symbolInfo = semanticModel.GetSymbolInfo(memberAccess.Expression);
    }
}